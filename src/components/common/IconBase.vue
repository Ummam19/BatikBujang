<script setup>
import { computed } from 'vue'
import { ICONS } from '@/utils/icons'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: Number, default: 20 },
  stroke: { type: Number, default: 1.8 }
})
const path = computed(() => ICONS[props.name] || ICONS.box)
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" :stroke-width="stroke"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="shrink-0">
    <path :d="path" />
  </svg>
</template>
