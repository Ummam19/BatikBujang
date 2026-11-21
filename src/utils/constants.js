// Kunci logika bisnis & penyimpanan. Data konten ada di src/seed/*.json
export const STORAGE_KEYS = Object.freeze({
  admins: 'bb_admins',
  products: 'bb_products',
  transactions: 'bb_transactions',
  settings: 'bb_settings',
  session: 'bb_session'
})

export const PRODUCT_STATUS = Object.freeze({
  READY: 'Stok Tersedia',
  PREORDER: 'Pre-Order'
})

export const FILTER_ALL = 'Semua'

// Pemetaan status -> warna badge (success | warning | danger | gold | neutral)
export const STATUS_TONES = Object.freeze({
  'Stok Tersedia': 'success',
  'Pre-Order': 'warning',
  'Menunggu Pembayaran': 'warning',
  'Pre-Order Diproses': 'gold',
  'Lunas / Selesai': 'success'
})
