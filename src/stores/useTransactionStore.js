import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import seed from '@/seed/transactions.json'
import { STORAGE_KEYS, PRODUCT_STATUS } from '@/utils/constants'
import { loadJSON, saveJSON } from '@/utils/storage'
import { deepClone, generateId, isValidPhone, normalizePhone } from '@/utils/format'
import { useSettingsStore } from './useSettingsStore'
import { useProductStore } from './useProductStore'
import { useAuthStore } from './useAuthStore'

const KEY = STORAGE_KEYS.transactions

export const useTransactionStore = defineStore('transactions', () => {
  const transactions = ref([])
  const initialized = ref(false)

  watch(transactions, (v) => { if (initialized.value) saveJSON(KEY, v) }, { deep: true, flush: 'sync' })

  function initializeStore() {
    const stored = loadJSON(KEY)
    if (Array.isArray(stored)) {
      transactions.value = stored
    } else {
      transactions.value = deepClone(seed)
      saveJSON(KEY, transactions.value)
    }
    initialized.value = true
  }

  function resetToSeed() {
    initialized.value = true
    transactions.value = deepClone(seed)
  }

  const sorted = computed(() => [...transactions.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
  const finalStatuses = computed(() => useSettingsStore().orderStatuses.filter((s) => s.final).map((s) => s.value))
  const revenue = computed(() =>
    transactions.value.filter((t) => finalStatuses.value.includes(t.status)).reduce((sum, t) => sum + Number(t.totalPrice), 0))
  const pendingCount = computed(() => transactions.value.filter((t) => !finalStatuses.value.includes(t.status)).length)

  function nextCode() {
    const max = transactions.value.reduce((m, t) => {
      const n = parseInt(String(t.code).replace(/\D/g, ''), 10)
      return Number.isFinite(n) && n > m ? n : m
    }, 0)
    return `BB-${String(max + 1).padStart(4, '0')}`
  }

  function validateTransaction(p, { editing = false } = {}) {
    const settings = useSettingsStore()
    const errors = {}
    if (String(p.customerName || '').trim().length < 2) errors.customerName = 'Nama pelanggan wajib diisi.'
    if (!isValidPhone(p.customerWa)) errors.customerWa = 'Nomor WA tidak valid (contoh: 081234567890).'
    if (!p.productId && !String(p.customMotif || '').trim() && !editing) errors.customMotif = 'Isi deskripsi motif request custom.'
    if (!settings.getFabric(p.fabricType)) errors.fabricType = 'Pilih jenis kain.'
    if (!String(p.dimension || '').trim()) errors.dimension = 'Ukuran wajib diisi.'
    if (!editing) {
      const q = Number(p.quantity)
      if (!Number.isInteger(q) || q < 1) errors.quantity = 'Jumlah lembar minimal 1.'
    }
    if (!Number.isFinite(Number(p.totalPrice)) || Number(p.totalPrice) <= 0) errors.totalPrice = 'Total harga harus lebih dari 0.'
    if (!settings.paymentMethods.some((m) => m.name === p.paymentMethod)) errors.paymentMethod = 'Pilih metode pembayaran.'
    if (!settings.orderStatuses.some((s) => s.value === p.status)) errors.status = 'Pilih status pesanan.'
    return errors
  }

  function createTransaction(p) {
    const errors = validateTransaction(p)
    if (Object.keys(errors).length) return { ok: false, errors }
    const settings = useSettingsStore()
    const productStore = useProductStore()
    const qty = Number(p.quantity)
    const product = p.productId ? productStore.getById(p.productId) : null
    if (p.productId && !product) return { ok: false, errors: { productId: 'Produk tidak ditemukan.' } }

    let orderType = PRODUCT_STATUS.PREORDER
    let stockDeducted = false
    let becamePreOrder = false
    if (product && product.stock > 0) {
      if (qty > product.stock) {
        return { ok: false, errors: { quantity: `Stok ${product.name} hanya ${product.stock} lembar. Kurangi jumlah atau catat sebagai request custom.` } }
      }
      orderType = PRODUCT_STATUS.READY
      productStore.adjustStock(product.id, -qty)
      stockDeducted = true
      becamePreOrder = productStore.getById(product.id).stock === 0
    }

    const tx = {
      id: generateId('trx'),
      code: nextCode(),
      customerName: p.customerName.trim(),
      customerWa: normalizePhone(p.customerWa),
      productId: product ? product.id : null,
      motifName: product ? product.name : String(p.customMotif).trim(),
      isCustom: !product,
      fabricType: p.fabricType,
      dimension: p.dimension.trim(),
      quantity: qty,
      totalPrice: Number(p.totalPrice),
      paymentMethod: p.paymentMethod,
      status: p.status,
      orderType,
      estimatedDays: orderType === PRODUCT_STATUS.PREORDER ? (product?.estimatedDays || settings.catalog.poEstimateDays) : null,
      notes: String(p.notes || '').trim(),
      stockDeducted,
      createdBy: useAuthStore().session?.adminId || null,
      createdAt: new Date().toISOString()
    }
    transactions.value.unshift(tx)
    return { ok: true, transaction: tx, becamePreOrder }
  }

  // Edit tidak mengubah produk/jumlah/kain agar stok tetap konsisten
  function updateTransaction(id, p) {
    const idx = transactions.value.findIndex((t) => t.id === id)
    if (idx < 0) return { ok: false, errors: { global: 'Transaksi tidak ditemukan.' } }
    const current = transactions.value[idx]
    const merged = { ...current, ...p }
    const errors = validateTransaction(merged, { editing: true })
    if (Object.keys(errors).length) return { ok: false, errors }
    transactions.value[idx] = {
      ...current,
      customerName: merged.customerName.trim(),
      customerWa: normalizePhone(merged.customerWa),
      dimension: merged.dimension.trim(),
      totalPrice: Number(merged.totalPrice),
      paymentMethod: merged.paymentMethod,
      status: merged.status,
      notes: String(merged.notes || '').trim()
    }
    return { ok: true, transaction: transactions.value[idx] }
  }

  function setStatus(id, status) {
    const t = transactions.value.find((x) => x.id === id)
    if (t) t.status = status
  }

  // Hapus transaksi => stok yang pernah dipotong dikembalikan
  function deleteTransaction(id) {
    const idx = transactions.value.findIndex((t) => t.id === id)
    if (idx < 0) return false
    const t = transactions.value[idx]
    if (t.stockDeducted && t.productId) useProductStore().adjustStock(t.productId, t.quantity)
    transactions.value.splice(idx, 1)
    return true
  }

  // Pencarian publik: Kode Pesanan ATAU Nomor WA
  function findForCustomer(query) {
    const q = String(query || '').trim()
    if (!q) return []
    const phone = normalizePhone(q)
    const looksLikePhone = /^[\d+\s-]{8,}$/.test(q)
    return sorted.value.filter((t) =>
      t.code.toLowerCase() === q.toLowerCase() || (looksLikePhone && normalizePhone(t.customerWa) === phone))
  }

  return {
    transactions, initialized, sorted, revenue, pendingCount,
    initializeStore, resetToSeed, nextCode, validateTransaction, createTransaction,
    updateTransaction, setStatus, deleteTransaction, findForCustomer
  }
})
