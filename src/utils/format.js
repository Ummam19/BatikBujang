export const formatRupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(n) || 0)

export function formatDate(iso, withTime = false) {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', withTime
    ? { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: 'short', year: 'numeric' }).format(d)
}

export const deepClone = (v) => JSON.parse(JSON.stringify(v))

export const generateId = (prefix = 'id') =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

export const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim())

// 0812... / +62812... / 62812... / 812... -> 62812...
export function normalizePhone(v) {
  let d = String(v || '').replace(/\D/g, '')
  if (d.startsWith('0')) d = '62' + d.slice(1)
  else if (d.startsWith('8')) d = '62' + d
  return d
}

export const isValidPhone = (v) => {
  const d = normalizePhone(v)
  return d.length >= 10 && d.length <= 15 && d.startsWith('62')
}

// "Siti Rahmah" -> "Si** Ra****"
export const maskName = (name) =>
  String(name || '').split(' ').filter(Boolean)
    .map((w) => w.slice(0, 2) + '*'.repeat(Math.max(w.length - 2, 1))).join(' ')
