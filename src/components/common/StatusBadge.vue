<script setup>
import { computed } from 'vue'
import { STATUS_TONES } from '@/utils/constants'

const props = defineProps({
  status: { type: String, required: true },
  tone: { type: String, default: '' }, // override: success | warning | danger | gold | neutral
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md'].includes(v) }
})

const TONE_CLASS = {
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  danger: 'bg-danger-bg text-danger',
  gold: 'bg-gold-soft text-gold-dark ring-1 ring-inset ring-gold/40',
  neutral: 'bg-zinc-100 text-zinc-700'
}
const cls = computed(() => TONE_CLASS[props.tone || STATUS_TONES[props.status] || 'neutral'])
</script>

<template>
  <span :class="['inline-flex items-center whitespace-nowrap rounded-full font-semibold', cls, size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs']">
    {{ status }}
  </span>
</template>
