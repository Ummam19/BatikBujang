import { useToast } from '@/composables/useToast'

export function loadJSON(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    useToast().error('Gagal menyimpan ke localStorage (penyimpanan penuh). Gunakan foto lebih kecil atau path folder.')
    return false
  }
}

export function removeKey(key) {
  try { localStorage.removeItem(key) } catch { /* abaikan */ }
}
