<script setup>
import { computed } from 'vue'
import IconBase from '@/components/common/IconBase.vue'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { buildWhatsAppUrl, buildGeneralMessage, buildProductMessage } from '@/utils/whatsapp'

const props = defineProps({
  product: { type: Object, default: null }, // null = chat umum ke owner
  label: { type: String, default: '' },
  variant: { type: String, default: 'primary', validator: (v) => ['primary', 'outline', 'floating'].includes(v) },
  block: { type: Boolean, default: false },
  small: { type: Boolean, default: false }
})
const emit = defineEmits(['click'])

const settings = useSettingsStore()

const text = computed(() => props.label || (props.product ? 'Pesan via WhatsApp' : 'Tanya via WhatsApp'))
const href = computed(() => {
  const msg = props.product
    ? buildProductMessage({ product: props.product, storeName: settings.store.name, defaultDays: settings.catalog.poEstimateDays })
    : buildGeneralMessage(settings.store.name)
  return buildWhatsAppUrl(settings.store.whatsappNumber, msg)
})
const cls = computed(() => {
  if (props.variant === 'floating') {
    return 'fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-success text-white shadow-lg transition-colors hover:bg-green-800'
  }
  return ['btn', props.variant === 'outline' ? 'btn-outline' : 'btn-wa', props.small ? 'btn-sm' : '', props.block ? 'w-full' : '']
})
</script>

<template>
  <a :href="href" target="_blank" rel="noopener noreferrer" :class="cls" @click="emit('click', product)">
    <IconBase name="whatsapp" :size="variant === 'floating' ? 26 : small ? 14 : 18" />
    <span :class="variant === 'floating' ? 'sr-only' : ''">{{ text }}</span>
  </a>
</template>
