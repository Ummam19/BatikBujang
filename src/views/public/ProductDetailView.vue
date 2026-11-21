<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import StatusBadge from '@/components/common/StatusBadge.vue'
import IconBase from '@/components/common/IconBase.vue'
import ProductCard from '@/components/public/ProductCard.vue'
import WhatsAppOrderButton from '@/components/public/WhatsAppOrderButton.vue'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useProductStore } from '@/stores/useProductStore'
import { PRODUCT_STATUS } from '@/utils/constants'
import { formatRupiah } from '@/utils/format'
import { resolveImage, onImgError } from '@/utils/placeholder'

const route = useRoute()
const settings = useSettingsStore()
const productStore = useProductStore()

const product = computed(() => productStore.getById(route.params.id))
const fabric = computed(() => (product.value ? settings.getFabric(product.value.fabricType) : null))
const isReady = computed(() => product.value?.status === PRODUCT_STATUS.READY)
const related = computed(() =>
  productStore.products.filter((p) => p.id !== product.value?.id)
    .sort((a, b) => Number(b.fabricType === product.value?.fabricType) - Number(a.fabricType === product.value?.fabricType))
    .slice(0, 4))
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <RouterLink :to="{ name: 'home', hash: '#katalog' }" class="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-gold-dark">
      <IconBase name="arrowLeft" :size="16" /> Kembali ke katalog
    </RouterLink>

    <div v-if="!product" class="card mt-6 px-6 py-16 text-center">
      <p class="font-display text-xl font-semibold">Produk tidak ditemukan</p>
      <p class="mt-1 text-sm text-zinc-600">Motif ini mungkin sudah dihapus dari katalog.</p>
      <RouterLink :to="{ name: 'home', hash: '#katalog' }" class="btn btn-primary mt-5">Lihat semua motif</RouterLink>
    </div>

    <template v-else>
      <div class="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div class="overflow-hidden rounded-2xl border border-zinc-200 bg-gold-soft">
          <img :src="resolveImage(product.image)" :alt="`Kain batik motif ${product.name}`" class="aspect-[4/5] w-full object-cover" @error="onImgError" />
        </div>

        <div>
          <StatusBadge :status="product.status" />
          <h1 class="mt-3 font-display text-3xl font-bold sm:text-4xl">{{ product.name }}</h1>
          <p class="mt-1 text-zinc-600">{{ product.fabricType }}</p>
          <p class="mt-4 text-3xl font-bold text-gold-dark">{{ formatRupiah(product.price) }}</p>
          <p class="mt-1 text-xs text-zinc-500">Harga dapat menyesuaikan jenis bahan dan permintaan ukuran.</p>

          <p v-if="product.description" class="mt-5 leading-relaxed text-zinc-700">{{ product.description }}</p>

          <dl class="mt-6 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white text-sm">
            <div class="flex justify-between gap-4 px-4 py-3"><dt class="text-zinc-500">Bentuk</dt><dd class="font-medium">Kain lembaran</dd></div>
            <div class="flex justify-between gap-4 px-4 py-3"><dt class="text-zinc-500">Dimensi</dt><dd class="text-right font-medium">{{ product.dimension }}</dd></div>
            <div class="flex justify-between gap-4 px-4 py-3">
              <dt class="text-zinc-500">{{ isReady ? 'Stok' : 'Estimasi pengerjaan' }}</dt>
              <dd class="font-medium">{{ isReady ? `${product.stock} lembar, siap kirim` : `sekitar ${product.estimatedDays || settings.catalog.poEstimateDays} hari` }}</dd>
            </div>
          </dl>
          <p class="mt-2 text-sm text-gold-dark">{{ settings.catalog.customSizeNote }}</p>

          <div v-if="fabric" class="mt-6 rounded-xl bg-gold-soft p-4">
            <p class="font-semibold">Tentang {{ fabric.name }}</p>
            <p class="mt-1 text-sm leading-relaxed text-zinc-700">{{ fabric.description }}</p>
          </div>

          <div class="mt-6 flex flex-col gap-3 sm:flex-row">
            <WhatsAppOrderButton :product="product" class="sm:flex-1" />
            <a :href="settings.store.shopeeUrl" target="_blank" rel="noopener noreferrer" class="btn btn-outline sm:flex-1">
              <IconBase name="bag" :size="18" /> Lihat di Shopee
            </a>
          </div>
          <p class="mt-2 text-xs text-zinc-500">
            {{ isReady ? 'Pesan dibuat otomatis dengan detail motif, kain, ukuran, dan status Stok Tersedia.' : 'Pesan dibuat otomatis untuk Pre-Order, lengkap dengan detail motif, kain, dan ukuran.' }}
          </p>

          <div class="mt-6 border-t border-zinc-200 pt-5">
            <p class="font-semibold">Metode pembayaran</p>
            <ul class="mt-3 space-y-2">
              <li v-for="m in settings.paymentMethods" :key="m.name" class="flex gap-3 text-sm">
                <IconBase name="card" :size="18" class="mt-0.5 text-gold-dark" />
                <span><strong>{{ m.name }}</strong><span v-if="m.detail" class="text-zinc-600">. {{ m.detail }}</span></span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <section v-if="related.length" class="mt-16">
        <h2 class="font-display text-2xl font-bold">Motif lainnya</h2>
        <div class="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <ProductCard v-for="p in related" :key="p.id" :product="p" />
        </div>
      </section>
    </template>
  </div>
</template>
