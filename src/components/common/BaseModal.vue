<script setup>
import { watch, onBeforeUnmount } from 'vue'
import IconBase from './IconBase.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg', 'xl'].includes(v) },
  persistent: { type: Boolean, default: false } // true: klik backdrop tidak menutup
})
const emit = defineEmits(['update:modelValue', 'close'])

const WIDTH = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' }

function close() {
  emit('update:modelValue', false)
  emit('close')
}
function onKey(e) { if (e.key === 'Escape' && !props.persistent) close() }

watch(() => props.modelValue, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (open) window.addEventListener('keydown', onKey)
  else window.removeEventListener('keydown', onKey)
}, { immediate: true })

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" :aria-label="title">
      <div class="absolute inset-0 bg-ink/60" @click="!persistent && close()"></div>
      <div :class="['relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl', WIDTH[size]]">
        <header class="flex items-center justify-between gap-3 border-b border-zinc-200 px-5 py-4">
          <h2 class="font-display text-lg font-semibold">{{ title }}</h2>
          <button class="btn btn-ghost btn-sm" aria-label="Tutup" @click="close"><IconBase name="x" :size="18" /></button>
        </header>
        <div class="flex-1 overflow-y-auto px-5 py-4"><slot /></div>
        <footer v-if="$slots.footer" class="flex flex-wrap justify-end gap-2 border-t border-zinc-200 bg-ivory px-5 py-3">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>
