<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SidebarAdmin from '@/components/admin/SidebarAdmin.vue'
import IconBase from '@/components/common/IconBase.vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToast()
const sidebarOpen = ref(false)

watch(() => route.fullPath, () => { sidebarOpen.value = false })

function handleLogout() {
  auth.logout()
  toast.info('Anda telah keluar dari panel admin.')
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen lg:pl-64">
    <SidebarAdmin :user="auth.currentAdmin" :open="sidebarOpen" @close="sidebarOpen = false" @logout="handleLogout" />
    <div class="flex min-h-screen flex-col">
      <header class="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur lg:px-8">
        <button class="btn btn-ghost btn-sm lg:hidden" aria-label="Buka menu" @click="sidebarOpen = true">
          <IconBase name="menu" />
        </button>
        <h1 class="truncate font-display text-lg font-semibold sm:text-xl">{{ route.meta.title }}</h1>
        <div class="ml-auto flex items-center gap-2">
          <RouterLink :to="{ name: 'home' }" target="_blank" class="btn btn-outline btn-sm">
            <IconBase name="external" :size="14" /> <span class="hidden sm:inline">Lihat etalase</span>
          </RouterLink>
        </div>
      </header>
      <main class="flex-1 p-4 lg:p-8"><RouterView /></main>
    </div>
  </div>
</template>
