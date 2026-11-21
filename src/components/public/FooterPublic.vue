<script setup>
import BrandLogo from '@/components/common/BrandLogo.vue'
import IconBase from '@/components/common/IconBase.vue'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { buildWhatsAppUrl, buildGeneralMessage } from '@/utils/whatsapp'

const settings = useSettingsStore()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="mt-16 bg-ink text-zinc-300">
    <div class="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
      <div>
        <BrandLogo inverse />
        <p class="mt-4 max-w-xs text-sm leading-relaxed text-zinc-400">{{ settings.store.description }}</p>
      </div>

      <div>
        <h3 class="font-display text-base font-semibold text-white">Hubungi dan belanja</h3>
        <ul class="mt-4 space-y-3 text-sm">
          <li class="flex gap-2"><IconBase name="pin" :size="18" class="mt-0.5 text-gold" /> <span>{{ settings.store.address }}</span></li>
          <li>
            <a :href="buildWhatsAppUrl(settings.store.whatsappNumber, buildGeneralMessage(settings.store.name))" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 hover:text-gold">
              <IconBase name="whatsapp" :size="18" class="text-gold" /> WhatsApp +{{ settings.store.whatsappNumber }}
            </a>
          </li>
          <li>
            <a :href="settings.store.shopeeUrl" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 hover:text-gold">
              <IconBase name="bag" :size="18" class="text-gold" /> Toko Shopee {{ settings.store.name }}
            </a>
          </li>
        </ul>
      </div>

      <div>
        <h3 class="font-display text-base font-semibold text-white">Metode pembayaran</h3>
        <ul class="mt-4 flex flex-wrap gap-2">
          <li v-for="m in settings.paymentMethods" :key="m.name" class="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-200">
            <IconBase name="card" :size="14" class="text-gold" /> {{ m.name }}
          </li>
        </ul>
        <RouterLink :to="{ name: 'login' }" class="btn mt-6 border border-zinc-600 text-zinc-200 hover:border-gold hover:text-gold btn-sm">
          <IconBase name="lock" :size="14" /> Login Admin
        </RouterLink>
      </div>
    </div>
    <div class="border-t border-zinc-800 py-4 text-center text-xs text-zinc-500">
      &copy; {{ year }} {{ settings.store.name }} &mdash; {{ settings.store.tagline }}
    </div>
  </footer>
</template>
