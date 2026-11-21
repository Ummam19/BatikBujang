<script setup>
import StatsCard from '@/components/common/StatsCard.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { useProductStore } from '@/stores/useProductStore'
import { useTransactionStore } from '@/stores/useTransactionStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { formatRupiah, formatDate } from '@/utils/format'
import { PRODUCT_STATUS } from '@/utils/constants'

const productStore = useProductStore()
const txStore = useTransactionStore()
const settings = useSettingsStore()
const auth = useAuthStore()
</script>

<template>
  <div class="space-y-6">
    <div>
      <p class="text-zinc-600">Halo, <strong>{{ auth.currentAdmin?.name }}</strong>. Berikut ringkasan Batik Bujang hari ini.</p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatsCard label="Total motif katalog" :value="productStore.products.length" icon="box" tone="dark" />
      <StatsCard label="Stok Tersedia" :value="productStore.readyCount" hint="Siap kirim" icon="check" tone="success" />
      <StatsCard label="Pre-Order" :value="productStore.preOrderCount" hint="Stok 0 atau produksi ulang" icon="clock" tone="warning" />
      <StatsCard label="Catatan order WA" :value="txStore.transactions.length" :hint="`${txStore.pendingCount} belum selesai`" icon="receipt" tone="gold" />
    </div>

    <div class="grid gap-6 xl:grid-cols-2">
      <section class="card overflow-hidden">
        <div class="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <h2 class="font-display text-lg font-semibold">Stok menipis dan Pre-Order</h2>
          <RouterLink :to="{ name: 'admin-catalog' }" class="text-sm font-semibold text-gold-dark hover:underline">Kelola</RouterLink>
        </div>
        <ul v-if="productStore.lowStock.length" class="divide-y divide-zinc-100">
          <li v-for="p in productStore.lowStock" :key="p.id" class="flex items-center justify-between gap-3 px-5 py-3">
            <div class="min-w-0">
              <p class="truncate font-medium">{{ p.name }}</p>
              <p class="text-xs text-zinc-500">{{ p.fabricType }} &middot; {{ p.status === PRODUCT_STATUS.READY ? `sisa ${p.stock} lembar` : `estimasi ${p.estimatedDays || settings.catalog.poEstimateDays} hari` }}</p>
            </div>
            <StatusBadge :status="p.status" size="sm" />
          </li>
        </ul>
        <p v-else class="px-5 py-10 text-center text-sm text-zinc-500">Semua stok aman. Tidak ada motif yang menipis.</p>
      </section>

      <section class="card overflow-hidden">
        <div class="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <h2 class="font-display text-lg font-semibold">Order terbaru</h2>
          <RouterLink :to="{ name: 'admin-transactions' }" class="text-sm font-semibold text-gold-dark hover:underline">Lihat semua</RouterLink>
        </div>
        <ul v-if="txStore.sorted.length" class="divide-y divide-zinc-100">
          <li v-for="t in txStore.sorted.slice(0, 5)" :key="t.id" class="flex items-center justify-between gap-3 px-5 py-3">
            <div class="min-w-0">
              <p class="truncate font-medium">{{ t.code }} &middot; {{ t.customerName }}</p>
              <p class="text-xs text-zinc-500">{{ t.motifName }} &middot; {{ formatDate(t.createdAt) }} &middot; {{ formatRupiah(t.totalPrice) }}</p>
            </div>
            <StatusBadge :status="t.status" size="sm" />
          </li>
        </ul>
        <p v-else class="px-5 py-10 text-center text-sm text-zinc-500">Belum ada order. Catat order pertama dari WhatsApp di menu Transaksi.</p>
        <p class="border-t border-zinc-100 bg-ivory px-5 py-3 text-sm text-zinc-600">Total pendapatan lunas: <strong class="text-ink">{{ formatRupiah(txStore.revenue) }}</strong></p>
      </section>
    </div>
  </div>
</template>
