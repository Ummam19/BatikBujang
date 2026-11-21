<script setup>
import BaseModal from '@/components/common/BaseModal.vue'
import IconBase from '@/components/common/IconBase.vue'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { formatRupiah, formatDate } from '@/utils/format'

defineProps({
  modelValue: { type: Boolean, default: false },
  transaction: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue'])

const settings = useSettingsStore()
const print = () => window.print()
</script>

<template>
  <BaseModal :model-value="modelValue" title="Nota transaksi" size="sm" @update:model-value="emit('update:modelValue', $event)">
    <div v-if="transaction" id="receipt-area" class="mx-auto w-full max-w-[300px] bg-white font-mono text-xs leading-relaxed text-ink">
      <div class="border-b border-dashed border-zinc-400 pb-3 text-center">
        <p class="font-display text-base font-bold tracking-wide">{{ settings.store.name.toUpperCase() }}</p>
        <p class="italic">{{ settings.store.tagline }}</p>
        <p class="mt-1">{{ settings.store.address }}</p>
        <p>WA +{{ settings.store.whatsappNumber }}</p>
      </div>

      <div class="space-y-0.5 border-b border-dashed border-zinc-400 py-3">
        <p class="flex justify-between"><span>No. Nota</span><span>{{ transaction.code }}</span></p>
        <p class="flex justify-between"><span>Tanggal</span><span>{{ formatDate(transaction.createdAt, true) }}</span></p>
        <p class="flex justify-between"><span>Pelanggan</span><span>{{ transaction.customerName }}</span></p>
        <p class="flex justify-between"><span>No. WA</span><span>{{ transaction.customerWa }}</span></p>
      </div>

      <div class="border-b border-dashed border-zinc-400 py-3">
        <p class="font-bold">{{ transaction.motifName }}</p>
        <p>{{ transaction.fabricType }} &middot; {{ transaction.dimension }}</p>
        <p class="flex justify-between"><span>{{ transaction.quantity }} lembar</span><span>{{ formatRupiah(transaction.totalPrice) }}</span></p>
        <p>Jenis order: {{ transaction.orderType }}</p>
      </div>

      <div class="space-y-0.5 py-3">
        <p class="flex justify-between text-sm font-bold"><span>TOTAL</span><span>{{ formatRupiah(transaction.totalPrice) }}</span></p>
        <p class="flex justify-between"><span>Pembayaran</span><span>{{ transaction.paymentMethod }}</span></p>
        <p class="flex justify-between"><span>Status</span><span>{{ transaction.status }}</span></p>
      </div>

      <p class="border-t border-dashed border-zinc-400 pt-3 text-center">Terima kasih telah berbelanja.<br />Simpan nota ini untuk cek status pesanan.</p>
    </div>

    <template #footer>
      <button class="btn btn-outline" @click="emit('update:modelValue', false)">Tutup</button>
      <button class="btn btn-primary" @click="print"><IconBase name="printer" :size="16" /> Cetak</button>
    </template>
  </BaseModal>
</template>
