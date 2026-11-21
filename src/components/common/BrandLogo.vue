<script setup>
import { ref, computed } from 'vue'
import { useSettingsStore } from '@/stores/useSettingsStore'

const props = defineProps({
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg'].includes(v) },
  showTagline: { type: Boolean, default: true },
  inverse: { type: Boolean, default: false } // teks putih untuk latar gelap
})

const settings = useSettingsStore()
const logoFailed = ref(false)

const iconSize = computed(() => ({ sm: 'h-9 w-9', md: 'h-11 w-11', lg: 'h-16 w-16' }[props.size]))
const nameSize = computed(() => ({ sm: 'text-base', md: 'text-lg', lg: 'text-3xl' }[props.size]))

// Bunga empat kelopak yang membentuk lekuk huruf 'B'
const flowers = [[31, 18], [32, 30], [17, 12]]
const petals = [[0, -2.4], [2.4, 0], [0, 2.4], [-2.4, 0]]
</script>

<template>
  <div class="flex items-center gap-3">
    <img v-if="!logoFailed" src="/images/brand/logo-batik-bujang.png" :alt="`Logo ${settings.store.name}`"
      :class="[iconSize, 'rounded-full object-contain']" @error="logoFailed = true" />
    <svg v-else viewBox="0 0 48 48" :class="[iconSize, 'shrink-0']" role="img" :aria-label="`Logo ${settings.store.name}`">
      <circle cx="24" cy="24" r="24" fill="#C59B43" />
      <path d="M17 12v24M17 12h8a6 6 0 010 12h-8M17 24h9a6 6 0 010 12h-9" fill="none" stroke="#fff"
        stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      <g v-for="(f, i) in flowers" :key="i" :transform="`translate(${f[0]} ${f[1]})`">
        <circle v-for="(p, j) in petals" :key="j" :cx="p[0]" :cy="p[1]" r="1.7" fill="#fff" />
        <circle r="1.2" fill="#C59B43" />
      </g>
    </svg>
    <div class="flex flex-col leading-tight">
      <span :class="['font-display font-bold tracking-wide', nameSize, inverse ? 'text-white' : 'text-ink']">
        {{ settings.store.name.toUpperCase() }}
      </span>
      <span v-if="showTagline" :class="['text-[11px] italic', inverse ? 'text-gold' : 'text-gold-dark']">
        {{ settings.store.tagline }}
      </span>
    </div>
  </div>
</template>
