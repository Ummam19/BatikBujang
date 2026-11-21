<script setup>
import IconBase from '@/components/common/IconBase.vue'
import WhatsAppOrderButton from './WhatsAppOrderButton.vue'

defineProps({
  store: { type: Object, required: true },
  shopeeUrl: { type: String, default: '' },
  dimension: { type: String, default: '' },
  priceRange: { type: String, default: '' },
  fabricNames: { type: Array, default: () => [] }
})
const emit = defineEmits(['browse'])
</script>

<template>
  <section class="relative overflow-hidden bg-ink text-white">
    <div class="batik-pattern absolute inset-0 opacity-30" aria-hidden="true"></div>
    <div class="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-14 lg:px-8 lg:py-24">
      <div>
        <h1 class="font-display text-4xl font-bold leading-[1.1] tracking-wide sm:text-5xl lg:text-6xl">{{ store.name.toUpperCase() }}</h1>
        <p class="mt-4 font-display text-xl italic text-gold sm:text-2xl">{{ store.tagline }}</p>
        <p class="mt-6 max-w-lg text-base leading-relaxed text-zinc-300">{{ store.description }}</p>

        <div class="mt-8 flex flex-wrap gap-3">
          <button class="btn btn-primary" @click="emit('browse')">
            <IconBase name="grid" :size="18" /> Lihat katalog
          </button>
          <WhatsAppOrderButton label="Chat WhatsApp owner" />
          <a v-if="shopeeUrl" :href="shopeeUrl" target="_blank" rel="noopener noreferrer"
            class="btn border border-white/30 text-white hover:border-gold hover:text-gold">
            <IconBase name="bag" :size="18" /> Kunjungi Shopee
          </a>
        </div>
      </div>

      <!-- Ilustrasi kain lembaran dengan proporsi 220 x 115 -->
      <figure class="mx-auto w-full max-w-md">
        <div class="batik-pattern aspect-[220/115] w-full rounded-md border-4 border-double border-gold bg-gold-soft shadow-2xl" role="img" aria-label="Ilustrasi kain batik lembaran"></div>
        <figcaption class="mt-4 space-y-1 text-center text-sm text-zinc-300">
          <p>Kain lembaran <strong class="text-white">{{ dimension }}</strong>, bisa request ukuran.</p>
          <p v-if="priceRange">{{ priceRange }}</p>
          <p v-if="fabricNames.length" class="text-zinc-400">{{ fabricNames.join(', ') }}</p>
        </figcaption>
      </figure>
    </div>
  </section>
</template>
