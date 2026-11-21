<script setup>
import BaseModal from './BaseModal.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Konfirmasi' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: 'Ya, lanjutkan' },
  cancelText: { type: String, default: 'Batal' },
  variant: { type: String, default: 'danger', validator: (v) => ['danger', 'primary'].includes(v) }
})
const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

function cancel() { emit('update:modelValue', false); emit('cancel') }
function confirm() { emit('confirm'); emit('update:modelValue', false) }
</script>

<template>
  <BaseModal :model-value="modelValue" :title="title" size="sm" @update:model-value="(v) => !v && cancel()">
    <p class="text-sm leading-relaxed text-zinc-700">{{ message }}</p>
    <template #footer>
      <button class="btn btn-outline" @click="cancel">{{ cancelText }}</button>
      <button :class="['btn', variant === 'danger' ? 'btn-danger' : 'btn-primary']" @click="confirm">{{ confirmText }}</button>
    </template>
  </BaseModal>
</template>
