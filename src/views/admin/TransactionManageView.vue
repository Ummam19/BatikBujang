<script setup>
import { ref, computed } from 'vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import IconBase from '@/components/common/IconBase.vue'
import TransactionFormModal from '@/components/admin/TransactionFormModal.vue'
import ReceiptPrintModal from '@/components/admin/ReceiptPrintModal.vue'
import { useTransactionStore } from '@/stores/useTransactionStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useToast } from '@/composables/useToast'
import { FILTER_ALL } from '@/utils/constants'
import { formatRupiah, formatDate } from '@/utils/format'
import { exportToCsv } from '@/utils/csv'

const txStore = useTransactionStore()
const settings = useSettingsStore()
const toast = useToast()

const search = ref('')
const statusFilter = ref(FILTER_ALL)
const formOpen = ref(false)
const editing = ref(null)
const receiptOpen = ref(false)
const receiptTx = ref(null)
const confirmOpen = ref(false)
const toDelete = ref(null)

const statusOptions = computed(() => [FILTER_ALL, ...settings.orderStatuses.map((s) => s.value)])
const rows = computed(() => {
  const q = search.value.trim().toLowerCase()
  return txStore.sorted.filter((t) =>
    (!q || [t.code, t.customerName, t.customerWa, t.motifName].some((v) => String(v).toLowerCase().includes(q))) &&
    (statusFilter.value === FILTER_ALL || t.status === statusFilter.value))
})
const rowsTotal = computed(() => rows.value.reduce((s, t) => s + Number(t.totalPrice), 0))

function openAdd() { editing.value = null; formOpen.value = true }
function openEdit(t) { editing.value = t; formOpen.value = true }
function openReceipt(t) { receiptTx.value = t; receiptOpen.value = true }
function askDelete(t) { toDelete.value = t; confirmOpen.value = true }
function doDelete() {
  const t = toDelete.value
  if (t && txStore.deleteTransaction(t.id)) {
    toast.success(t.stockDeducted ? `Order ${t.code} dihapus dan stok dikembalikan.` : `Order ${t.code} dihapus.`)
  }
  toDelete.value = null
}
function onSaved(t, isNew) { toast.success(isNew ? `Order ${t.code} berhasil dicatat.` : `Order ${t.code} diperbarui.`) }
function changeStatus(t, status) {
  txStore.setStatus(t.id, status)
  toast.success(`Status ${t.code}: ${status}`)
}

function exportCsv() {
  if (!rows.value.length) { toast.warning('Tidak ada data untuk diexport.'); return }
  exportToCsv(`laporan-order-batik-bujang-${new Date().toISOString().slice(0, 10)}.csv`, [
    { label: 'Kode', value: (t) => t.code },
    { label: 'Tanggal', value: (t) => formatDate(t.createdAt, true) },
    { label: 'Pelanggan', value: (t) => t.customerName },
    { label: 'No WA', value: (t) => t.customerWa },
    { label: 'Motif', value: (t) => t.motifName },
    { label: 'Jenis Kain', value: (t) => t.fabricType },
    { label: 'Ukuran', value: (t) => t.dimension },
    { label: 'Jumlah Lembar', value: (t) => t.quantity },
    { label: 'Total Harga', value: (t) => t.totalPrice },
    { label: 'Metode Bayar', value: (t) => t.paymentMethod },
    { label: 'Jenis Order', value: (t) => t.orderType },
    { label: 'Status', value: (t) => t.status },
    { label: 'Catatan', value: (t) => t.notes }
  ], rows.value)
  toast.success('Laporan CSV berhasil diunduh.')
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex flex-1 flex-col gap-3 sm:flex-row">
        <div class="relative sm:max-w-xs sm:flex-1">
          <IconBase name="search" :size="16" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input v-model="search" type="search" class="input pl-9" placeholder="Cari kode, nama, nomor WA, motif" aria-label="Cari transaksi" />
        </div>
        <select v-model="statusFilter" class="input sm:w-56" aria-label="Filter status">
          <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
      <div class="flex flex-wrap gap-2">
        <button class="btn btn-outline" @click="exportCsv"><IconBase name="download" :size="16" /> Export CSV</button>
        <button class="btn btn-primary" @click="openAdd"><IconBase name="plus" :size="18" /> Catat order</button>
      </div>
    </div>

    <div class="card overflow-x-auto">
      <table class="w-full min-w-[980px]">
        <thead class="border-b border-zinc-200 bg-ivory">
          <tr><th class="th">Kode</th><th class="th">Pelanggan</th><th class="th">Pesanan</th><th class="th">Total</th><th class="th">Bayar</th><th class="th">Status</th><th class="th text-right">Aksi</th></tr>
        </thead>
        <tbody class="divide-y divide-zinc-100">
          <tr v-for="t in rows" :key="t.id">
            <td class="td"><p class="font-semibold">{{ t.code }}</p><p class="text-xs text-zinc-500">{{ formatDate(t.createdAt) }}</p></td>
            <td class="td"><p class="font-medium">{{ t.customerName }}</p><p class="text-xs text-zinc-500">{{ t.customerWa }}</p></td>
            <td class="td">
              <p class="font-medium">{{ t.motifName }} <span class="font-normal text-zinc-500">&times; {{ t.quantity }}</span></p>
              <p class="text-xs text-zinc-500">{{ t.fabricType }} &middot; {{ t.dimension }}</p>
              <StatusBadge :status="t.orderType" size="sm" class="mt-1" />
            </td>
            <td class="td font-medium">{{ formatRupiah(t.totalPrice) }}</td>
            <td class="td">{{ t.paymentMethod }}</td>
            <td class="td">
              <select :value="t.status" class="input !w-auto !py-1.5 text-xs" :aria-label="`Ubah status ${t.code}`" @change="changeStatus(t, $event.target.value)">
                <option v-for="s in settings.orderStatuses" :key="s.value" :value="s.value">{{ s.value }}</option>
              </select>
            </td>
            <td class="td">
              <div class="flex justify-end gap-1">
                <button class="btn btn-ghost btn-sm" :aria-label="`Cetak nota ${t.code}`" @click="openReceipt(t)"><IconBase name="printer" :size="16" /></button>
                <button class="btn btn-ghost btn-sm" :aria-label="`Edit ${t.code}`" @click="openEdit(t)"><IconBase name="pencil" :size="16" /></button>
                <button class="btn btn-ghost btn-sm !text-danger" :aria-label="`Hapus ${t.code}`" @click="askDelete(t)"><IconBase name="trash" :size="16" /></button>
              </div>
            </td>
          </tr>
          <tr v-if="!rows.length"><td colspan="7" class="px-4 py-12 text-center text-sm text-zinc-500">Belum ada order yang cocok. Klik Catat order untuk menambahkan pesanan dari WhatsApp.</td></tr>
        </tbody>
      </table>
    </div>
    <p class="text-sm text-zinc-600">{{ rows.length }} order tampil &middot; total nilai {{ formatRupiah(rowsTotal) }}</p>

    <TransactionFormModal v-model="formOpen" :transaction="editing" @saved="onSaved" />
    <ReceiptPrintModal v-model="receiptOpen" :transaction="receiptTx" />
    <ConfirmDialog v-model="confirmOpen" title="Hapus catatan order?" confirm-text="Ya, hapus"
      :message="`Order ${toDelete?.code || ''} akan dihapus.${toDelete?.stockDeducted ? ' Stok motif yang pernah dipotong akan dikembalikan.' : ''}`" @confirm="doDelete" />
  </div>
</template>
