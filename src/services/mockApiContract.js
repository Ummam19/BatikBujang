// =============================================================================
// Service layer tiruan + kontrak endpoint (/api/v1/*)
// Saat backend nyata tersedia, ganti isi `mockApi` dengan fetch/axios ke endpoint
// pada API_CONTRACT tanpa mengubah komponen. Detail contoh JSON ada di README.md.
// =============================================================================
import { useAuthStore } from '@/stores/useAuthStore'
import { useProductStore } from '@/stores/useProductStore'
import { useTransactionStore } from '@/stores/useTransactionStore'
import { useSettingsStore } from '@/stores/useSettingsStore'

export const API_CONTRACT = [
  { method: 'POST', path: '/api/v1/auth/login', access: 'Publik', success: 200, errors: [400, 401] },
  { method: 'GET', path: '/api/v1/products', access: 'Publik', success: 200, errors: [] },
  { method: 'GET', path: '/api/v1/products/:id', access: 'Publik', success: 200, errors: [404] },
  { method: 'POST', path: '/api/v1/products', access: 'Admin', success: 201, errors: [400, 401, 403] },
  { method: 'PUT', path: '/api/v1/products/:id', access: 'Admin', success: 200, errors: [400, 401, 403, 404] },
  { method: 'DELETE', path: '/api/v1/products/:id', access: 'Admin', success: 200, errors: [401, 403, 404] },
  { method: 'GET', path: '/api/v1/transactions', access: 'Admin', success: 200, errors: [401, 403] },
  { method: 'GET', path: '/api/v1/transactions/lookup?q=', access: 'Publik', success: 200, errors: [400] },
  { method: 'POST', path: '/api/v1/transactions', access: 'Admin', success: 201, errors: [400, 401, 403] },
  { method: 'PATCH', path: '/api/v1/transactions/:id', access: 'Admin', success: 200, errors: [400, 401, 403, 404] },
  { method: 'GET', path: '/api/v1/settings', access: 'Publik', success: 200, errors: [] },
  { method: 'PUT', path: '/api/v1/settings', access: 'Admin (Owner/Pengelola)', success: 200, errors: [400, 401, 403] }
]

const ok = (status, data) => Promise.resolve({ status, data })
const fail = (status, message, errors = {}) => Promise.resolve({ status, error: { message, errors } })
const guard = () => (useAuthStore().isLoggedIn ? null : fail(401, 'Silakan login terlebih dahulu.'))

export const mockApi = {
  login(body) {
    const r = useAuthStore().login(body?.email, body?.password)
    if (r.ok) return ok(200, { user: { id: r.admin.id, name: r.admin.name, email: r.admin.email, role: r.admin.role } })
    return fail(body?.email && body?.password ? 401 : 400, r.message)
  },
  listProducts: () => ok(200, useProductStore().products),
  getProduct(id) {
    const p = useProductStore().getById(id)
    return p ? ok(200, p) : fail(404, 'Produk tidak ditemukan.')
  },
  createProduct(body) {
    const g = guard(); if (g) return g
    const r = useProductStore().saveProduct({ ...body, id: null })
    return r.ok ? ok(201, r.product) : fail(400, 'Validasi gagal.', r.errors)
  },
  updateProduct(id, body) {
    const g = guard(); if (g) return g
    if (!useProductStore().getById(id)) return fail(404, 'Produk tidak ditemukan.')
    const r = useProductStore().saveProduct({ ...body, id })
    return r.ok ? ok(200, r.product) : fail(400, 'Validasi gagal.', r.errors)
  },
  deleteProduct(id) {
    const g = guard(); if (g) return g
    return useProductStore().deleteProduct(id) ? ok(200, { id }) : fail(404, 'Produk tidak ditemukan.')
  },
  listTransactions() {
    const g = guard(); if (g) return g
    return ok(200, useTransactionStore().sorted)
  },
  lookupTransactions(q) {
    if (!String(q || '').trim()) return fail(400, 'Parameter q wajib diisi.')
    return ok(200, useTransactionStore().findForCustomer(q))
  },
  createTransaction(body) {
    const g = guard(); if (g) return g
    const r = useTransactionStore().createTransaction(body)
    return r.ok ? ok(201, r.transaction) : fail(400, 'Validasi gagal.', r.errors)
  },
  updateTransaction(id, body) {
    const g = guard(); if (g) return g
    const r = useTransactionStore().updateTransaction(id, body)
    return r.ok ? ok(200, r.transaction) : fail(400, 'Validasi gagal.', r.errors)
  },
  getSettings: () => ok(200, useSettingsStore().settings),
  updateSettings(body) {
    const g = guard(); if (g) return g
    const r = useSettingsStore().updateStoreProfile(body)
    return r.ok ? ok(200, useSettingsStore().store) : fail(400, 'Validasi gagal.', r.errors)
  }
}
