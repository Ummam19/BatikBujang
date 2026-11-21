<script setup>
import StatusBadge from '@/components/common/StatusBadge.vue'
import WhatsAppOrderButton from './WhatsAppOrderButton.vue'
import { formatRupiah } from '@/utils/format'
import { resolveImage, onImgError } from '@/utils/placeholder'
import { PRODUCT_STATUS } from '@/utils/constants'

defineProps({
  product: { type: Object, required: true }
})
const emit = defineEmits(['order'])
</script>

<template>
  <article class="card flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
    <RouterLink :to="{ name: 'product-detail', params: { id: product.id } }" class="relative block aspect-[4/5] overflow-hidden bg-gold-soft">
      <img :src="resolveImage(product.image)" :alt="`Kain batik motif ${product.name}`" loading="lazy" class="h-full w-full object-cover" @error="onImgError" />
      <StatusBadge :status="product.status" class="absolute left-3 top-3 shadow-sm" />
    </RouterLink>

    <div class="flex flex-1 flex-col p-4">
      <h3 class="font-display text-lg font-semibold leading-snug">
        <RouterLink :to="{ name: 'product-detail', params: { id: product.id } }" class="hover:text-gold-dark">{{ product.name }}</RouterLink>
      </h3>
      <p class="mt-1 text-sm text-zinc-600">{{ product.fabricType }} &middot; {{ product.dimension }}</p>
      <p class="mt-3 text-lg font-bold text-gold-dark">{{ formatRupiah(product.price) }}</p>
      <p class="mt-1 text-xs text-zinc-500">
        {{ product.status === PRODUCT_STATUS.READY ? `Sisa ${product.stock} lembar` : `Estimasi pengerjaan ${product.estimatedDays || '-'} hari` }}
      </p>

      <div class="mt-4 grid grid-cols-2 gap-2">
        <RouterLink :to="{ name: 'product-detail', params: { id: product.id } }" class="btn btn-outline btn-sm">Lihat detail</RouterLink>
        <WhatsAppOrderButton :product="product" label="Pesan" small @click="emit('order', product)" />
      </div>
    </div>
  </article>
</template>
