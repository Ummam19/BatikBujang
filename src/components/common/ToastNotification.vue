<script setup>
import { useToast } from '@/composables/useToast'
import IconBase from './IconBase.vue'

const { toasts, dismiss } = useToast()

const STYLE = {
  success: 'border-success bg-success-bg text-success',
  error: 'border-danger bg-danger-bg text-danger',
  warning: 'border-warning bg-warning-bg text-warning',
  info: 'border-gold bg-gold-soft text-gold-dark'
}
const ICON = { success: 'check', error: 'alert', warning: 'alert', info: 'check' }
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6" aria-live="polite">
    <TransitionGroup name="toast">
      <div v-for="t in toasts" :key="t.id" role="alert"
        :class="['pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border-l-4 px-4 py-3 text-sm font-medium shadow-lg', STYLE[t.type]]">
        <IconBase :name="ICON[t.type]" :size="18" />
        <p class="flex-1">{{ t.message }}</p>
        <button class="opacity-70 hover:opacity-100" aria-label="Tutup notifikasi" @click="dismiss(t.id)"><IconBase name="x" :size="16" /></button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: opacity .2s ease, transform .2s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
