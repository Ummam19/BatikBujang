<script setup>
import { reactive, ref, computed, watch } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import IconBase from '@/components/common/IconBase.vue'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useProductStore } from '@/stores/useProductStore'
import { useToast } from '@/composables/useToast'
import { PRODUCT_STATUS } from '@/utils/constants'
import { resolveImage, onImgError } from '@/utils/placeholder'
import { fileToResizedDataUrl } from '@/utils/image'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  product: { type: Object, default: null } // null = tambah baru
})
const emit = defineEmits(['update:modelValue', 'saved'])

const settings = useSettingsStore()
const productStore = useProductStore()
const toast = useToast()

const blank = () => ({
  id: null,
  name: '',
  fabricType: settings.fabricTypes[0]?.name || '',
  dimension: settings.catalog.defaultDimension,
  price: settings.fabricTypes[0]?.basePrice || 0,
  stock: 1,
  status: PRODUCT_STATUS.READY,
  estimatedDays: settings.catalog.poEstimateDays,
  image: '',
  description: ''
})

const form = reactive(blank())
const errors = ref({})
const imageMode = ref('path')
const saving = ref(false)
const statusOptions = [PRODUCT_STATUS.READY, PRODUCT_STATUS.PREORDER]
const isEdit = computed(() => !!props.product)

watch(() => [props.modelValue, props.product], ([open]) => {
  if (!open) return
  Object.assign(form, blank(), props.product
    ? { ...props.product, estimatedDays: props.product.estimatedDays ?? settings.catalog.poEstimateDays }
    : {})
  errors.value = {}
  imageMode.value = String(form.image).startsWith('data:') ? 'upload' : 'path'
}, { immediate: true })

const imageSuggestions = computed(() =>
  [...new Set(productStore.products.map((p) => p.image).filter((i) => i && !i.startsWith('data:')))])

function onFabricChange() {
  if (!isEdit.value) form.price = settings.getFabric(form.fabricType)?.basePrice || form.price
}
function onStatusChange() {
  if (form.status === PRODUCT_STATUS.PREORDER) form.stock = 0
  else if (Number(form.stock) <= 0) form.stock = 1
}
function onStockInput() {
  const s = Number(form.stock)
  if (s > 0) form.status = PRODUCT_STATUS.READY
  else if (s === 0 && form.stock !== '') form.status = PRODUCT_STATUS.PREORDER
}
function normalizePath() {
  const v = String(form.image || '').trim()
  if (v && !/^(\/|https?:|data:)/.test(v)) form.image = `/images/products/${v}`
}

async function onFile(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    errors.value = { ...errors.value, image: 'File harus berupa gambar (jpg, png, webp).' }
    return
  }
  try {
    form.image = await fileToResizedDataUrl(file)
    errors.value = { ...errors.value, image: undefined }
  } catch (err) {
    errors.value = { ...errors.value, image: err.message }
  }
  e.target.value = ''
}

function submit() {
  normalizePath()
  saving.value = true
  const res = productStore.saveProduct({ ...form })
  saving.value = false
  if (!res.ok) {
    errors.value = res.errors
    toast.warning('Periksa kembali isian formulir.')
    return
  }
  emit('saved', res.product, res.isNew)
  emit('update:modelValue', false)
}
</script>

<template>
  <BaseModal :model-value="modelValue" :title="isEdit ? 'Edit motif' : 'Tambah motif baru'" size="lg" persistent
    @update:model-value="emit('update:modelValue', $event)">
    <form id="product-form" class="grid gap-5 md:grid-cols-2" novalidate @submit.prevent="submit">
      <div class="space-y-4">
        <div>
          <label for="pf-name" class="label">Nama motif</label>
          <input id="pf-name" v-model="form.name" type="text" :class="['input', errors.name && 'input-error']" placeholder="Contoh: Pucuk Rebung" />
          <p v-if="errors.name" class="field-error">{{ errors.name }}</p>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="pf-fabric" class="label">Jenis kain</label>
            <select id="pf-fabric" v-model="form.fabricType" :class="['input', errors.fabricType && 'input-error']" @change="onFabricChange">
              <option v-for="f in settings.fabricTypes" :key="f.name" :value="f.name">{{ f.name }}</option>
            </select>
            <p v-if="errors.fabricType" class="field-error">{{ errors.fabricType }}</p>
          </div>
          <div>
            <label for="pf-dim" class="label">Dimensi</label>
            <input id="pf-dim" v-model="form.dimension" type="text" :class="['input', errors.dimension && 'input-error']" />
            <p v-if="errors.dimension" class="field-error">{{ errors.dimension }}</p>
          </div>
        </div>

        <div>
          <label for="pf-price" class="label">Harga (Rp)</label>
          <input id="pf-price" v-model.number="form.price" type="number" min="0" step="1000" :class="['input', errors.price && 'input-error']" />
          <p v-if="errors.price" class="field-error">{{ errors.price }}</p>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="pf-status" class="label">Status produk</label>
            <select id="pf-status" v-model="form.status" :class="['input', errors.status && 'input-error']" @change="onStatusChange">
              <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
          <div>
            <label for="pf-stock" class="label">Jumlah stok</label>
            <input id="pf-stock" v-model.number="form.stock" type="number" min="0" step="1" :class="['input', errors.stock && 'input-error']" @input="onStockInput" />
          </div>
        </div>
        <p v-if="errors.stock" class="field-error -mt-2">{{ errors.stock }}</p>
        <p v-else class="field-hint -mt-2">Stok 0 otomatis berstatus Pre-Order. Stok di atas 0 otomatis Stok Tersedia.</p>

        <div v-if="form.status === PRODUCT_STATUS.PREORDER">
          <label for="pf-days" class="label">Estimasi pengerjaan (hari)</label>
          <input id="pf-days" v-model.number="form.estimatedDays" type="number" min="1" step="1" :class="['input', errors.estimatedDays && 'input-error']" />
          <p v-if="errors.estimatedDays" class="field-error">{{ errors.estimatedDays }}</p>
        </div>

        <div>
          <label for="pf-desc" class="label">Keterangan motif</label>
          <textarea id="pf-desc" v-model="form.description" rows="3" class="input" placeholder="Cerita singkat motif (opsional)"></textarea>
        </div>
      </div>

      <div class="space-y-3">
        <p class="label">Foto produk</p>
        <div class="aspect-[4/5] max-h-72 overflow-hidden rounded-xl border border-zinc-200 bg-gold-soft">
          <img :src="resolveImage(form.image)" alt="Pratinjau foto produk" class="h-full w-full object-cover" @error="onImgError" />
        </div>

        <div class="grid grid-cols-2 gap-2 rounded-lg bg-zinc-100 p-1 text-sm font-semibold" role="tablist">
          <button type="button" role="tab" :aria-selected="imageMode === 'path'" :class="['rounded-md py-2', imageMode === 'path' ? 'bg-white shadow-sm' : 'text-zinc-600']" @click="imageMode = 'path'">Opsi A: Path folder</button>
          <button type="button" role="tab" :aria-selected="imageMode === 'upload'" :class="['rounded-md py-2', imageMode === 'upload' ? 'bg-white shadow-sm' : 'text-zinc-600']" @click="imageMode = 'upload'">Opsi B: Upload</button>
        </div>

        <div v-if="imageMode === 'path'">
          <input v-model="form.image" type="text" list="product-image-options" :class="['input', errors.image && 'input-error']"
            placeholder="/images/products/batik-pucuk-rebung.jpg" aria-label="Path foto produk" @blur="normalizePath" />
          <datalist id="product-image-options"><option v-for="i in imageSuggestions" :key="i" :value="i"></option></datalist>
          <p class="field-hint">Taruh file di folder <code>public/images/products/</code>, lalu ketik path-nya. Cukup nama file pun diterima.</p>
        </div>
        <div v-else>
          <input type="file" accept="image/*" class="input file:mr-3 file:rounded-md file:border-0 file:bg-gold file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white" aria-label="Upload foto produk" @change="onFile" />
          <p class="field-hint">Foto diperkecil otomatis lalu disimpan di localStorage browser ini.</p>
        </div>
        <p v-if="errors.image" class="field-error">{{ errors.image }}</p>
        <button v-if="form.image" type="button" class="btn btn-ghost btn-sm" @click="form.image = ''"><IconBase name="trash" :size="14" /> Hapus foto</button>
      </div>
    </form>

    <template #footer>
      <button type="button" class="btn btn-outline" @click="emit('update:modelValue', false)">Batal</button>
      <button type="submit" form="product-form" class="btn btn-primary" :disabled="saving">
        <IconBase name="check" :size="16" /> {{ isEdit ? 'Simpan perubahan' : 'Tambah motif' }}
      </button>
    </template>
  </BaseModal>
</template>
