<script setup>
import { ref } from 'vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import IconBase from '@/components/common/IconBase.vue'
import WhatsAppOrderButton from '@/components/public/WhatsAppOrderButton.vue'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useTransactionStore } from '@/stores/useTransactionStore'
import { formatDate, maskName } from '@/utils/format'

const settings = useSettingsStore()
const txStore = useTransactionStore()

const query = ref('')
const error = ref('')
const results = ref([])
const searched = ref(false)

function search() {
  error.value = ''
  if (!query.value.trim()) {
    error.value = 'Masukkan Kode Pesanan (contoh: BB-0002) atau Nomor WhatsApp Anda.'
    return
  }
  results.value = txStore.findForCustomer(query.value)
  searched.value = true
}

const stepIndex = (status) => settings.orderStatuses.findIndex((s) => s.value === status)
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-10 sm:px-6">
    <h1 class="font-display text-3xl font-bold">Cek status pesanan</h1>
    <p class="mt-2 text-zinc-600">Pantau progres Pre-Order Anda tanpa perlu login. Masukkan Kode Pesanan dari owner atau Nomor WhatsApp yang dipakai saat memesan.</p>

    <form class="card mt-6 p-5" novalidate @submit.prevent="search">
      <label for="q" class="label">Kode Pesanan atau Nomor WhatsApp</label>
      <div class="flex flex-col gap-3 sm:flex-row">
        <input id="q" v-model="query" type="text" :class="['input', error && 'input-error']" placeholder="BB-0002 atau 081234567802" autocomplete="off" />
        <button type="submit" class="btn btn-primary sm:w-auto"><IconBase name="search" :size="18" /> Cek status</button>
      </div>
      <p v-if="error" class="field-error" role="alert">{{ error }}</p>
    </form>

    <div v-if="searched" class="mt-6 space-y-5">
      <div v-if="!results.length" class="card px-6 py-12 text-center">
        <p class="font-display text-lg font-semibold">Pesanan tidak ditemukan</p>
        <p class="mt-1 text-sm text-zinc-600">Periksa kembali kode atau nomor yang Anda ketik. Jika masih belum muncul, owner mungkin belum mencatat pesanan Anda.</p>
        <WhatsAppOrderButton class="mt-5" label="Tanya owner via WhatsApp" />
      </div>

      <article v-for="o in results" :key="o.id" class="card p-5">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="text-sm text-zinc-500">Kode pesanan</p>
            <p class="font-display text-xl font-bold">{{ o.code }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <StatusBadge :status="o.orderType" />
            <StatusBadge :status="o.status" />
          </div>
        </div>

        <dl class="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <div><dt class="text-zinc-500">Atas nama</dt><dd class="font-medium">{{ maskName(o.customerName) }}</dd></div>
          <div><dt class="text-zinc-500">Tanggal pesan</dt><dd class="font-medium">{{ formatDate(o.createdAt) }}</dd></div>
          <div><dt class="text-zinc-500">Motif</dt><dd class="font-medium">{{ o.motifName }}</dd></div>
          <div><dt class="text-zinc-500">Kain dan ukuran</dt><dd class="font-medium">{{ o.fabricType }}, {{ o.dimension }}</dd></div>
          <div><dt class="text-zinc-500">Jumlah</dt><dd class="font-medium">{{ o.quantity }} lembar</dd></div>
          <div><dt class="text-zinc-500">Pembayaran</dt><dd class="font-medium">{{ o.paymentMethod }}</dd></div>
        </dl>

        <ol class="mt-6 grid gap-3 sm:grid-cols-3" aria-label="Progres pesanan">
          <li v-for="(s, i) in settings.orderStatuses" :key="s.value"
            :class="['rounded-xl border p-3 text-sm', i <= stepIndex(o.status) ? 'border-gold bg-gold-soft' : 'border-zinc-200 bg-white text-zinc-500']">
            <p class="flex items-center gap-1.5 font-semibold">
              <IconBase v-if="i < stepIndex(o.status) || (i === stepIndex(o.status) && s.final)" name="check" :size="16" class="text-success" />
              <IconBase v-else-if="i === stepIndex(o.status)" name="clock" :size="16" class="text-gold-dark" />
              {{ s.value }}
            </p>
            <p class="mt-1 text-xs">{{ s.description }}</p>
          </li>
        </ol>

        <p v-if="o.estimatedDays && !settings.orderStatuses.find((s) => s.value === o.status)?.final" class="mt-4 text-sm text-warning">
          Estimasi pengerjaan sekitar {{ o.estimatedDays }} hari. Hubungi owner untuk kepastian jadwal.
        </p>
      </article>
    </div>
  </div>
</template>
