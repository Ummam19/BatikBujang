<script setup>
import { ref, computed } from 'vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import IconBase from '@/components/common/IconBase.vue'
import ProductFormModal from '@/components/admin/ProductFormModal.vue'
import { useProductStore } from '@/stores/useProductStore'
import { useToast } from '@/composables/useToast'
import { FILTER_ALL, PRODUCT_STATUS } from '@/utils/constants'
import { formatRupiah } from '@/utils/format'
import { resolveImage, onImgError } from '@/utils/placeholder'

const productStore = useProductStore()
const toast = useToast()

const search = ref('')
const statusFilter = ref(FILTER_ALL)
const statusOptions = [FILTER_ALL, PRODUCT_STATUS.READY, PRODUCT_STATUS.PREORDER]

const formOpen = ref(false)
const editing = ref(null)
const confirmOpen = ref(false)
const toDelete = ref(null)

const rows = computed(() => {
  const q = search.value.trim().toLowerCase()
  return productStore.products.filter((p) =>
    (!q || p.name.toLowerCase().includes(q) || p.fabricType.toLowerCase().includes(q)) &&
    (statusFilter.value === FILTER_ALL || p.status === statusFilter.value))
})

function openAdd() { editing.value = null; formOpen.value = true }
function openEdit(p) { editing.value = p; formOpen.value = true }
function askDelete(p) { toDelete.value = p; confirmOpen.value = true }
function doDelete() {
  if (toDelete.value && productStore.deleteProduct(toDelete.value.id)) toast.success(`Motif ${toDelete.value.name} dihapus.`)
  toDelete.value = null
}
function onSaved(product, isNew) {
  toast.success(isNew ? `Motif ${product.name} ditambahkan.` : `Motif ${product.name} diperbarui.`)
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-1 flex-col gap-3 sm:flex-row">
        <div class="relative sm:max-w-xs sm:flex-1">
          <IconBase name="search" :size="16" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input v-model="search" type="search" class="input pl-9" placeholder="Cari motif atau jenis kain" aria-label="Cari produk" />
        </div>
        <select v-model="statusFilter" class="input sm:w-48" aria-label="Filter status">
          <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
      <button class="btn btn-primary" @click="openAdd"><IconBase name="plus" :size="18" /> Tambah motif</button>
    </div>

    <div class="card overflow-x-auto">
      <table class="w-full min-w-[760px]">
        <thead class="border-b border-zinc-200 bg-ivory">
          <tr><th class="th">Foto</th><th class="th">Motif</th><th class="th">Jenis kain</th><th class="th">Harga</th><th class="th">Stok</th><th class="th">Status</th><th class="th text-right">Aksi</th></tr>
        </thead>
        <tbody class="divide-y divide-zinc-100">
          <tr v-for="p in rows" :key="p.id">
            <td class="td"><img :src="resolveImage(p.image)" :alt="p.name" class="h-14 w-11 rounded-md border border-zinc-200 object-cover" @error="onImgError" /></td>
            <td class="td"><p class="font-semibold">{{ p.name }}</p><p class="text-xs text-zinc-500">{{ p.dimension }}</p></td>
            <td class="td">{{ p.fabricType }}</td>
            <td class="td font-medium">{{ formatRupiah(p.price) }}</td>
            <td class="td">{{ p.stock }}</td>
            <td class="td">
              <StatusBadge :status="p.status" size="sm" />
              <p v-if="p.status === PRODUCT_STATUS.PREORDER" class="mt-1 text-xs text-zinc-500">{{ p.estimatedDays }} hari</p>
            </td>
            <td class="td">
              <div class="flex justify-end gap-1">
                <button class="btn btn-ghost btn-sm" :aria-label="`Edit ${p.name}`" @click="openEdit(p)"><IconBase name="pencil" :size="16" /></button>
                <button class="btn btn-ghost btn-sm !text-danger" :aria-label="`Hapus ${p.name}`" @click="askDelete(p)"><IconBase name="trash" :size="16" /></button>
              </div>
            </td>
          </tr>
          <tr v-if="!rows.length"><td colspan="7" class="px-4 py-12 text-center text-sm text-zinc-500">Tidak ada motif yang cocok. Ubah pencarian atau tambah motif baru.</td></tr>
        </tbody>
      </table>
    </div>

    <ProductFormModal v-model="formOpen" :product="editing" @saved="onSaved" />
    <ConfirmDialog v-model="confirmOpen" title="Hapus motif?" confirm-text="Ya, hapus"
      :message="`Motif ${toDelete?.name || ''} akan dihapus permanen dari katalog. Catatan order lama tetap tersimpan.`" @confirm="doDelete" />
  </div>
</template>
