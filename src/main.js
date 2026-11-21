import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

import { useSettingsStore } from '@/stores/useSettingsStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useProductStore } from '@/stores/useProductStore'
import { useTransactionStore } from '@/stores/useTransactionStore'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// Muat localStorage (atau salin dari src/seed/*.json bila kosong) SEBELUM router aktif,
// agar navigation guard sudah mengenali sesi login saat halaman pertama dibuka.
useSettingsStore().initializeStore()
useAuthStore().initializeStore()
useProductStore().initializeStore()
useTransactionStore().initializeStore()

app.use(router)
app.mount('#app')
