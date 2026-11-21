<script setup>
import { computed } from 'vue'
import IconBase from './IconBase.vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  hint: { type: String, default: '' },
  icon: { type: String, default: 'box' },
  tone: { type: String, default: 'gold', validator: (v) => ['gold', 'success', 'warning', 'dark'].includes(v) }
})

const TONES = {
  gold: 'bg-gold-soft text-gold-dark',
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  dark: 'bg-ink text-gold'
}
const toneCls = computed(() => TONES[props.tone])
</script>

<template>
  <div class="card flex items-center gap-4 p-5">
    <div :class="['flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', toneCls]">
      <IconBase :name="icon" :size="24" />
    </div>
    <div class="min-w-0">
      <p class="text-sm text-zinc-500">{{ label }}</p>
      <p class="font-display text-2xl font-bold leading-tight">{{ value }}</p>
      <p v-if="hint" class="truncate text-xs text-zinc-500">{{ hint }}</p>
    </div>
  </div>
</template>
