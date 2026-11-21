<script setup>
import { ref, computed } from 'vue'
import HeroSection from '@/components/public/HeroSection.vue'
import ProductFilterBar from '@/components/public/ProductFilterBar.vue'
import ProductCard from '@/components/public/ProductCard.vue'
import IconBase from '@/components/common/IconBase.vue'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useProductStore } from '@/stores/useProductStore'
import { FILTER_ALL, PRODUCT_STATUS } from '@/utils/constants'
import { formatRupiah } from '@/utils/format'

const settings = useSettingsStore()
const productStore = useProductStore()

const filters = ref({ search: '', fabric: FILTER_ALL, status: FILTER_ALL })

const fabricOptions = computed(() => [FILTER_ALL, ...settings.fabricTypes.map((f) => f.name)])
const statusOptions = [FILTER_ALL, PRODUCT_STATUS.READY, PRODUCT_STATUS.PREORDER]

const filtered = computed(() => {
  const q = filters.value.search.trim().toLowerCase()
  return productStore.products.filter((p) =>
    (!q || p.name.toLowerCase().includes(q) || p.fabricType.toLowerCase().includes(q)) &&
    (filters.value.fabric === FILTER_ALL || p.fabricType === filters.value.fabric) &&
    (filters.value.status === FILTER_ALL || p.status === filters.value.status))
})

const priceRange = computed(() => {
  const prices = productStore.products.map((p) => p.price)
  if (!prices.length) return ''
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max ? formatRupiah(min) : `${formatRupiah(min)} sampai ${formatRupiah(max)}`
})

const resetFilters = () => { filters.value = { search: '', fabric: FILTER_ALL, status: FILTER_ALL } }
const scrollToCatalog = () => document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' })
</script>

<template>
  <div>
    <HeroSection :store="settings.store" :shopee-url="settings.store.shopeeUrl" :dimension="settings.catalog.defaultDimension"
      :price-range="priceRange" :fabric-names="settings.fabricTypes.map((f) => f.name)" @browse="scrollToCatalog" />

    <section id="katalog" class="mx-auto max-w-7xl scroll-mt-20 px-4 py-12 sm:px-6 lg:px-8">
      <div class="mb-6 max-w-2xl">
        <h2 class="font-display text-3xl font-bold">Katalog kain batik</h2>
        <p class="mt-2 text-zinc-600">Pilih motif dan jenis kain. Status Stok Tersedia berarti siap kirim, Pre-Order berarti motif sedang diproduksi ulang atau dibuat sesuai pesanan.</p>
      </div>

      <ProductFilterBar v-model="filters" :fabric-options="fabricOptions" :status-options="statusOptions"
        :result-count="filtered.length" @reset="resetFilters" />

      <div v-if="filtered.length" class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <ProductCard v-for="p in filtered" :key="p.id" :product="p" />
      </div>
      <div v-else class="card mt-6 px-6 py-14 text-center">
        <IconBase name="search" :size="32" class="mx-auto text-gold" />
        <p class="mt-3 font-display text-lg font-semibold">Motif tidak ditemukan</p>
        <p class="mt-1 text-sm text-zinc-600">Coba kata kunci lain, atau hapus filter jenis kain dan status.</p>
        <button class="btn btn-outline mt-5" @click="resetFilters">Hapus semua filter</button>
      </div>
    </section>

    <section class="bg-white py-12">
      <div class="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <h2 class="font-display text-2xl font-bold">Cara memesan</h2>
          <ol class="mt-5 space-y-4">
            <li v-for="(step, i) in settings.howToOrder" :key="step.title" class="flex gap-4">
              <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-bold text-white">{{ i + 1 }}</span>
              <div>
                <p class="font-semibold">{{ step.title }}</p>
                <p class="text-sm text-zinc-600">{{ step.text }}</p>
              </div>
            </li>
          </ol>
          <div class="mt-6 rounded-xl bg-gold-soft p-4 text-sm">
            <p class="font-semibold">Pembayaran yang diterima</p>
            <p class="mt-1 text-zinc-700">{{ settings.paymentMethods.map((m) => m.name).join(', ') }}</p>
          </div>
        </div>

        <div>
          <h2 class="font-display text-2xl font-bold">Mengenal jenis kain</h2>
          <dl class="mt-5 space-y-4">
            <div v-for="f in settings.fabricTypes" :key="f.name" class="border-l-2 border-gold pl-4">
              <dt class="font-semibold">{{ f.name }} <span class="font-normal text-zinc-500">&middot; mulai {{ formatRupiah(f.basePrice) }}</span></dt>
              <dd class="mt-1 text-sm text-zinc-600">{{ f.description }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  </div>
</template>
