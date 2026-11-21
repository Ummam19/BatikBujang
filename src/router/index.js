import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useToast } from '@/composables/useToast'

import PublicLayout from '@/layouts/PublicLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'

const routes = [
  {
    path: '/',
    component: PublicLayout,
    children: [
      { path: '', name: 'home', component: () => import('@/views/public/HomeCatalogView.vue'), meta: { title: 'Katalog Kain Batik Riau' } },
      { path: 'produk/:id', name: 'product-detail', component: () => import('@/views/public/ProductDetailView.vue'), meta: { title: 'Detail Produk' } },
      { path: 'cek-pesanan', name: 'order-check', component: () => import('@/views/public/OrderCheckView.vue'), meta: { title: 'Cek Status Pre-Order' } }
    ]
  },
  { path: '/login', name: 'login', component: () => import('@/views/auth/LoginView.vue'), meta: { title: 'Login Admin' } },
  {
    path: '/admin',
    component: AdminLayout,
    redirect: { name: 'admin-dashboard' },
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', name: 'admin-dashboard', component: () => import('@/views/admin/DashboardView.vue'), meta: { requiresAuth: true, title: 'Dashboard', icon: 'grid', nav: true, order: 1 } },
      { path: 'katalog', name: 'admin-catalog', component: () => import('@/views/admin/CatalogManageView.vue'), meta: { requiresAuth: true, title: 'Katalog & Stok', icon: 'box', nav: true, order: 2 } },
      { path: 'transaksi', name: 'admin-transactions', component: () => import('@/views/admin/TransactionManageView.vue'), meta: { requiresAuth: true, title: 'Transaksi & Pre-Order', icon: 'receipt', nav: true, order: 3 } },
      { path: 'pengaturan', name: 'admin-settings', component: () => import('@/views/admin/SettingsManageView.vue'), meta: { requiresAuth: true, title: 'Pengaturan Akun & Toko', icon: 'sliders', nav: true, order: 4 } }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash, top: 80, behavior: 'smooth' }
    return { top: 0 }
  }
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  const toast = useToast()

  if (to.matched.some((r) => r.meta.requiresAuth) && !auth.isLoggedIn) {
    toast.warning('Akses ditolak. Silakan login sebagai admin untuk membuka halaman tersebut.')
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'login' && auth.isLoggedIn) {
    return { name: 'admin-dashboard' }
  }
  return true
})

router.afterEach((to) => {
  const brand = useSettingsStore().store.name
  document.title = to.meta.title ? `${to.meta.title} | ${brand}` : brand
})

export default router
