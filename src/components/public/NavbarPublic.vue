<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BrandLogo from '@/components/common/BrandLogo.vue'
import IconBase from '@/components/common/IconBase.vue'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useAuthStore } from '@/stores/useAuthStore'

const settings = useSettingsStore()
const auth = useAuthStore()
const route = useRoute()
const open = ref(false)

watch(() => route.fullPath, () => { open.value = false })
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-gold/25 bg-white/90 backdrop-blur">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <RouterLink to="/" aria-label="Beranda Batik Bujang"><BrandLogo size="md" /></RouterLink>

      <nav class="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
        <RouterLink v-for="item in settings.publicNav" :key="item.label" :to="item.to"
          class="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-gold-soft hover:text-gold-dark">
          {{ item.label }}
        </RouterLink>
        <RouterLink :to="{ name: auth.isLoggedIn ? 'admin-dashboard' : 'login' }" class="btn btn-dark btn-sm ml-2">
          <IconBase name="lock" :size="14" /> {{ auth.isLoggedIn ? 'Panel Admin' : 'Login Admin' }}
        </RouterLink>
      </nav>

      <button class="btn btn-ghost md:hidden" :aria-expanded="open" aria-label="Buka menu" @click="open = !open">
        <IconBase :name="open ? 'x' : 'menu'" />
      </button>
    </div>

    <nav v-if="open" class="border-t border-zinc-200 bg-white px-4 pb-4 pt-2 md:hidden" aria-label="Navigasi seluler">
      <RouterLink v-for="item in settings.publicNav" :key="item.label" :to="item.to"
        class="block rounded-lg px-3 py-3 text-sm font-medium text-zinc-700 hover:bg-gold-soft">
        {{ item.label }}
      </RouterLink>
      <RouterLink :to="{ name: auth.isLoggedIn ? 'admin-dashboard' : 'login' }" class="btn btn-dark mt-2 w-full">
        <IconBase name="lock" :size="16" /> {{ auth.isLoggedIn ? 'Panel Admin' : 'Login Admin' }}
      </RouterLink>
    </nav>
  </header>
</template>
