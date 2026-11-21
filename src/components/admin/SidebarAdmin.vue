<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import BrandLogo from '@/components/common/BrandLogo.vue'
import IconBase from '@/components/common/IconBase.vue'

defineProps({
  user: { type: Object, default: null },
  open: { type: Boolean, default: false } // hanya berpengaruh di layar kecil
})
const emit = defineEmits(['close', 'logout'])

const router = useRouter()
// Menu dibangun dari meta route (meta.nav), tanpa hardcode di komponen
const items = computed(() =>
  router.getRoutes().filter((r) => r.meta?.nav).sort((a, b) => a.meta.order - b.meta.order))
</script>

<template>
  <div>
    <div v-if="open" class="fixed inset-0 z-40 bg-ink/60 lg:hidden" @click="emit('close')"></div>
    <aside :class="['fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-ink text-zinc-300 transition-transform duration-200 lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full']"
      aria-label="Menu admin">
      <div class="flex h-16 items-center justify-between border-b border-zinc-800 px-4">
        <BrandLogo size="sm" :show-tagline="false" inverse />
        <button class="text-zinc-400 hover:text-white lg:hidden" aria-label="Tutup menu" @click="emit('close')"><IconBase name="x" /></button>
      </div>

      <nav class="flex-1 space-y-1 overflow-y-auto p-3">
        <RouterLink v-for="r in items" :key="r.name" :to="{ name: r.name }"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-zinc-800 hover:text-white"
          active-class="!bg-gold !text-white">
          <IconBase :name="r.meta.icon" :size="18" /> {{ r.meta.title }}
        </RouterLink>
      </nav>

      <div class="border-t border-zinc-800 p-4">
        <div v-if="user" class="mb-3 flex items-center gap-3">
          <span class="flex h-9 w-9 items-center justify-center rounded-full bg-gold/20 text-gold"><IconBase name="user" :size="18" /></span>
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold text-white">{{ user.name }}</p>
            <p class="truncate text-xs text-zinc-400">{{ user.role }}</p>
          </div>
        </div>
        <button class="btn w-full border border-zinc-700 text-zinc-200 hover:border-gold hover:text-gold btn-sm" @click="emit('logout')">
          <IconBase name="logout" :size="16" /> Keluar
        </button>
      </div>
    </aside>
  </div>
</template>
