<script setup>
import { reactive, ref, computed, watch } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import IconBase from '@/components/common/IconBase.vue'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useProductStore } from '@/stores/useProductStore'
import { useTransactionStore } from '@/stores/useTransactionStore'
import { useToast } from '@/composables/useToast'
import { PRODUCT_STATUS } from '@/utils/constants'
import { formatRupiah } from '@/utils/format'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  transaction: { type: Object, default: null } // null = catat order baru
})
const emit = defineEmits(['update:modelValue', 'saved'])

const settings = useSettingsStore()
const productStore = useProductStore()
const txStore = useTransactionStore()
const toast = useToast()

const CUSTOM = '' // nilai productId untuk request custom
const isEdit = computed(() => !!props.transaction)

const blank = () => ({
  customerName: '',
  customerWa: '',
  productId: CUSTOM,
  customMotif: '',
  fabricType: settings.fabricTypes[0]?.name || '',
  dimension: settings.catalog.defaultDimension,
  quantity: 1,
  totalPrice: settings.fabricTypes[0]?.basePrice || 0,
  paymentMethod: settings.paymentMethods[0]?.name || '',
  status: settings.orderStatuses[0]?.value || '',
  notes: ''
})

const form = reactive(blank())
const errors = ref({})
const totalTouched = ref(false)

watch(() => [props.modelValue, props.transaction], ([open]) => {
  if (!open) return
  const t = props.transaction
  Object.assign(form, blank(), t ? { ...t, productId: t.productId || CUSTOM, customMotif: t.isCustom ? t.motifName : '' } : {})
  errors.value = {}
  totalTouched.value = isEdit.value
}, { immediate: true })

const selectedProduct = computed(() => (form.productId ? productStore.getById(form.productId) : null))

// Prediksi jenis order sesuai aturan bisnis stok
const predictedType = computed(() => {
  if (isEdit.value) return props.transaction.orderType
  return selectedProduct.value && selectedProduct.value.stock > 0 ? PRODUCT_STATUS.READY : PRODUCT_STATUS.PREORDER
})

function recalcTotal() {
  if (totalTouched.value || isEdit.value) return
  const unit = selectedProduct.value ? selectedProduct.value.price : (settings.getFabric(form.fabricType)?.basePrice || 0)
  form.totalPrice = unit * (Number(form.quantity) || 0)
}
function onProductChange() {
  const p = selectedProduct.value
  if (p) {
    form.fabricType = p.fabricType
    form.dimension = p.dimension
    form.customMotif = ''
  }
  totalTouched.value = false
  recalcTotal()
}

function submit() {
  const payload = { ...form }
  const res = isEdit.value
    ? txStore.updateTransaction(props.transaction.id, payload)
    : txStore.createTransaction(payload)
  if (!res.ok) {
    errors.value = res.errors
    toast.warning(res.errors.global || 'Periksa kembali isian formulir.')
    return
  }
  if (res.becamePreOrder) toast.info('Stok motif ini habis. Status produk otomatis menjadi Pre-Order.')
  emit('saved', res.transaction, !isEdit.value)
  emit('update:modelValue', false)
}
</script>

<template>
  <BaseModal :model-value="modelValue" :title="isEdit ? `Edit order ${transaction.code}` : 'Catat order baru'" size="lg" persistent
    @update:model-value="emit('update:modelValue', $event)">
    <form id="tx-form" class="grid gap-4 md:grid-cols-2" novalidate @submit.prevent="submit">
      <div>
        <label for="tf-name" class="label">Nama pelanggan</label>
        <input id="tf-name" v-model="form.customerName" type="text" :class="['input', errors.customerName && 'input-error']" />
        <p v-if="errors.customerName" class="field-error">{{ errors.customerName }}</p>
      </div>
      <div>
        <label for="tf-wa" class="label">Nomor WhatsApp</label>
        <input id="tf-wa" v-model="form.customerWa" type="tel" inputmode="tel" placeholder="081234567890" :class="['input', errors.customerWa && 'input-error']" />
        <p v-if="errors.customerWa" class="field-error">{{ errors.customerWa }}</p>
      </div>

      <div class="md:col-span-2">
        <label for="tf-product" class="label">Motif</label>
        <select id="tf-product" v-model="form.productId" :disabled="isEdit" :class="['input', errors.productId && 'input-error']" @change="onProductChange">
          <option :value="CUSTOM">Request custom (motif di luar katalog)</option>
          <option v-for="p in productStore.products" :key="p.id" :value="p.id">
            {{ p.name }} &middot; {{ p.fabricType }} &middot; {{ p.status === PRODUCT_STATUS.READY ? `stok ${p.stock}` : PRODUCT_STATUS.PREORDER }}
          </option>
        </select>
        <p v-if="errors.productId" class="field-error">{{ errors.productId }}</p>
      </div>

      <div v-if="!form.productId" class="md:col-span-2">
        <label for="tf-custom" class="label">Deskripsi motif custom</label>
        <input id="tf-custom" v-model="form.customMotif" type="text" :disabled="isEdit" :class="['input', errors.customMotif && 'input-error']" placeholder="Contoh: motif logo instansi, warna hitam emas" />
        <p v-if="errors.customMotif" class="field-error">{{ errors.customMotif }}</p>
      </div>

      <div>
        <label for="tf-fabric" class="label">Jenis kain</label>
        <select id="tf-fabric" v-model="form.fabricType" :disabled="isEdit || !!form.productId" :class="['input', errors.fabricType && 'input-error']" @change="recalcTotal">
          <option v-for="f in settings.fabricTypes" :key="f.name" :value="f.name">{{ f.name }}</option>
        </select>
      </div>
      <div>
        <label for="tf-dim" class="label">Ukuran</label>
        <input id="tf-dim" v-model="form.dimension" type="text" :class="['input', errors.dimension && 'input-error']" />
        <p v-if="errors.dimension" class="field-error">{{ errors.dimension }}</p>
        <p v-else class="field-hint">Ubah jika pelanggan meminta ukuran khusus.</p>
      </div>

      <div>
        <label for="tf-qty" class="label">Jumlah lembar</label>
        <input id="tf-qty" v-model.number="form.quantity" type="number" min="1" step="1" :disabled="isEdit" :class="['input', errors.quantity && 'input-error']" @input="recalcTotal" />
        <p v-if="errors.quantity" class="field-error">{{ errors.quantity }}</p>
      </div>
      <div>
        <label for="tf-total" class="label">Total harga (Rp)</label>
        <input id="tf-total" v-model.number="form.totalPrice" type="number" min="0" step="1000" :class="['input', errors.totalPrice && 'input-error']" @input="totalTouched = true" />
        <p v-if="errors.totalPrice" class="field-error">{{ errors.totalPrice }}</p>
        <p v-else class="field-hint">Terisi otomatis dari harga, bisa diubah manual.</p>
      </div>

      <div>
        <label for="tf-pay" class="label">Metode pembayaran</label>
        <select id="tf-pay" v-model="form.paymentMethod" :class="['input', errors.paymentMethod && 'input-error']">
          <option v-for="m in settings.paymentMethods" :key="m.name" :value="m.name">{{ m.name }}</option>
        </select>
      </div>
      <div>
        <label for="tf-status" class="label">Status pesanan</label>
        <select id="tf-status" v-model="form.status" :class="['input', errors.status && 'input-error']">
          <option v-for="s in settings.orderStatuses" :key="s.value" :value="s.value">{{ s.value }}</option>
        </select>
      </div>

      <div class="md:col-span-2">
        <label for="tf-notes" class="label">Catatan</label>
        <textarea id="tf-notes" v-model="form.notes" rows="2" class="input" placeholder="Contoh: DP sudah masuk, kirim via JNE"></textarea>
      </div>

      <div class="rounded-xl bg-gold-soft p-4 text-sm md:col-span-2">
        <p class="flex flex-wrap items-center gap-2 font-semibold">
          Jenis order: <StatusBadge :status="predictedType" /> <span class="font-normal text-zinc-600">Total {{ formatRupiah(form.totalPrice) }}</span>
        </p>
        <p v-if="!isEdit && predictedType === PRODUCT_STATUS.READY" class="mt-1 text-zinc-700">
          Stok {{ selectedProduct.name }} akan berkurang {{ form.quantity || 0 }} lembar (sisa {{ Math.max(selectedProduct.stock - (Number(form.quantity) || 0), 0) }}).
          Jika sisa 0, status produk otomatis berubah menjadi Pre-Order.
        </p>
        <p v-else-if="!isEdit" class="mt-1 text-zinc-700">Stok tidak berubah karena motif ini Pre-Order atau request custom.</p>
        <p v-else class="mt-1 text-zinc-700">Motif, kain, dan jumlah dikunci agar stok tetap konsisten. Hapus lalu catat ulang jika perlu mengubahnya.</p>
      </div>
    </form>

    <template #footer>
      <button type="button" class="btn btn-outline" @click="emit('update:modelValue', false)">Batal</button>
      <button type="submit" form="tx-form" class="btn btn-primary"><IconBase name="check" :size="16" /> {{ isEdit ? 'Simpan perubahan' : 'Simpan order' }}</button>
    </template>
  </BaseModal>
</template>
