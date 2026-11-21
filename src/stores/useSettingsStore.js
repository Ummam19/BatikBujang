import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import seed from '@/seed/settings.json'
import { STORAGE_KEYS } from '@/utils/constants'
import { loadJSON, saveJSON } from '@/utils/storage'
import { deepClone, isValidPhone, normalizePhone } from '@/utils/format'

const KEY = STORAGE_KEYS.settings

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref(deepClone(seed))
  const initialized = ref(false)

  // Persistensi otomatis: setiap perubahan langsung ditulis ke localStorage
  watch(settings, (v) => { if (initialized.value) saveJSON(KEY, v) }, { deep: true, flush: 'sync' })

  function initializeStore() {
    const stored = loadJSON(KEY)
    if (stored && typeof stored === 'object' && stored.store) {
      const base = deepClone(seed)
      settings.value = {
        ...base,
        ...stored,
        store: { ...base.store, ...stored.store },
        catalog: { ...base.catalog, ...(stored.catalog || {}) }
      }
    } else {
      settings.value = deepClone(seed)
      saveJSON(KEY, settings.value)
    }
    initialized.value = true
  }

  function resetToSeed() {
    initialized.value = true
    settings.value = deepClone(seed)
  }

  const store = computed(() => settings.value.store)
  const catalog = computed(() => settings.value.catalog)
  const paymentMethods = computed(() => settings.value.paymentMethods)
  const fabricTypes = computed(() => settings.value.fabricTypes)
  const orderStatuses = computed(() => settings.value.orderStatuses)
  const publicNav = computed(() => settings.value.publicNav)
  const howToOrder = computed(() => settings.value.howToOrder)

  const getFabric = (name) => fabricTypes.value.find((f) => f.name === name) || null

  function validateStoreProfile(p) {
    const errors = {}
    if (!isValidPhone(p.whatsappNumber)) errors.whatsappNumber = 'Nomor WhatsApp tidak valid (contoh: 081234567890).'
    if (!/^https?:\/\/\S+\.\S+/.test(String(p.shopeeUrl || '').trim())) errors.shopeeUrl = 'Link Shopee harus diawali http:// atau https://.'
    if (!String(p.address || '').trim()) errors.address = 'Alamat usaha wajib diisi.'
    return errors
  }

  function updateStoreProfile(p) {
    const errors = validateStoreProfile(p)
    if (Object.keys(errors).length) return { ok: false, errors }
    settings.value.store = {
      ...settings.value.store,
      whatsappNumber: normalizePhone(p.whatsappNumber),
      shopeeUrl: p.shopeeUrl.trim(),
      address: p.address.trim()
    }
    return { ok: true }
  }

  function updatePaymentMethods(list) {
    const cleaned = list.map((m) => ({ name: String(m.name || '').trim(), detail: String(m.detail || '').trim() }))
    const errors = {}
    if (!cleaned.length) errors.global = 'Minimal harus ada satu metode pembayaran.'
    const seen = new Set()
    cleaned.forEach((m, i) => {
      if (!m.name) errors[`name-${i}`] = 'Nama metode wajib diisi.'
      else if (seen.has(m.name.toLowerCase())) errors[`name-${i}`] = 'Nama metode tidak boleh sama.'
      seen.add(m.name.toLowerCase())
    })
    if (Object.keys(errors).length) return { ok: false, errors }
    settings.value.paymentMethods = cleaned
    return { ok: true }
  }

  return {
    settings, initialized, store, catalog, paymentMethods, fabricTypes, orderStatuses, publicNav, howToOrder,
    getFabric, initializeStore, resetToSeed, validateStoreProfile, updateStoreProfile, updatePaymentMethods
  }
})
