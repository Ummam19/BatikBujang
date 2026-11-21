import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import seed from '@/seed/products.json'
import { STORAGE_KEYS, PRODUCT_STATUS } from '@/utils/constants'
import { loadJSON, saveJSON } from '@/utils/storage'
import { deepClone, generateId } from '@/utils/format'
import { useSettingsStore } from './useSettingsStore'

const KEY = STORAGE_KEYS.products

export const useProductStore = defineStore('products', () => {
  const products = ref([])
  const initialized = ref(false)

  watch(products, (v) => { if (initialized.value) saveJSON(KEY, v) }, { deep: true, flush: 'sync' })

  function initializeStore() {
    const stored = loadJSON(KEY)
    if (Array.isArray(stored)) {
      products.value = stored
    } else {
      products.value = deepClone(seed)
      saveJSON(KEY, products.value)
    }
    initialized.value = true
  }

  function resetToSeed() {
    initialized.value = true
    products.value = deepClone(seed)
  }

  const readyCount = computed(() => products.value.filter((p) => p.status === PRODUCT_STATUS.READY).length)
  const preOrderCount = computed(() => products.value.filter((p) => p.status === PRODUCT_STATUS.PREORDER).length)
  const lowStock = computed(() => {
    const th = useSettingsStore().catalog.lowStockThreshold
    return products.value
      .filter((p) => p.status === PRODUCT_STATUS.PREORDER || p.stock <= th)
      .sort((a, b) => a.stock - b.stock)
  })
  const getById = (id) => products.value.find((p) => p.id === id) || null

  function validateProduct(p) {
    const settings = useSettingsStore()
    const errors = {}
    const stock = Number(p.stock)
    if (!String(p.name || '').trim()) errors.name = 'Nama motif wajib diisi.'
    if (!settings.getFabric(p.fabricType)) errors.fabricType = 'Pilih jenis kain yang valid.'
    if (!String(p.dimension || '').trim()) errors.dimension = 'Dimensi wajib diisi.'
    if (!Number.isFinite(Number(p.price)) || Number(p.price) <= 0) errors.price = 'Harga harus lebih dari 0.'
    if (p.stock === '' || !Number.isInteger(stock) || stock < 0) errors.stock = 'Stok harus bilangan bulat 0 atau lebih.'
    else if (p.status === PRODUCT_STATUS.READY && stock <= 0) errors.stock = 'Status Stok Tersedia memerlukan stok lebih dari 0.'
    else if (p.status === PRODUCT_STATUS.PREORDER && stock > 0) errors.stock = 'Status Pre-Order hanya untuk stok 0.'
    if (p.status === PRODUCT_STATUS.PREORDER) {
      const d = Number(p.estimatedDays)
      if (!Number.isInteger(d) || d < 1) errors.estimatedDays = 'Estimasi pengerjaan minimal 1 hari.'
    }
    if (![PRODUCT_STATUS.READY, PRODUCT_STATUS.PREORDER].includes(p.status)) errors.status = 'Status tidak valid.'
    return errors
  }

  function saveProduct(payload) {
    const errors = validateProduct(payload)
    if (Object.keys(errors).length) return { ok: false, errors }
    const stock = Number(payload.stock)
    const status = stock > 0 ? PRODUCT_STATUS.READY : PRODUCT_STATUS.PREORDER
    const clean = {
      id: payload.id || generateId('prd'),
      name: payload.name.trim(),
      fabricType: payload.fabricType,
      dimension: payload.dimension.trim(),
      price: Number(payload.price),
      stock,
      status,
      estimatedDays: status === PRODUCT_STATUS.PREORDER ? Number(payload.estimatedDays) : null,
      image: String(payload.image || '').trim(),
      description: String(payload.description || '').trim()
    }
    const idx = products.value.findIndex((p) => p.id === clean.id)
    if (idx > -1) {
      products.value[idx] = { ...products.value[idx], ...clean }
      return { ok: true, product: products.value[idx], isNew: false }
    }
    products.value.push({ ...clean, createdAt: new Date().toISOString() })
    return { ok: true, product: products.value[products.value.length - 1], isNew: true }
  }

  function deleteProduct(id) {
    const i = products.value.findIndex((p) => p.id === id)
    if (i > -1) products.value.splice(i, 1)
    return i > -1
  }

  // delta negatif = stok keluar. Status otomatis mengikuti stok (0 => Pre-Order)
  function adjustStock(id, delta) {
    const p = getById(id)
    if (!p) return null
    p.stock = Math.max(0, Number(p.stock) + Number(delta))
    if (p.stock > 0) {
      p.status = PRODUCT_STATUS.READY
      p.estimatedDays = null
    } else {
      p.status = PRODUCT_STATUS.PREORDER
      p.estimatedDays = p.estimatedDays || useSettingsStore().catalog.poEstimateDays
    }
    return p
  }

  return {
    products, initialized, readyCount, preOrderCount, lowStock, getById,
    initializeStore, resetToSeed, validateProduct, saveProduct, deleteProduct, adjustStock
  }
})
