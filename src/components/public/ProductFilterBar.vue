<script setup>
import IconBase from '@/components/common/IconBase.vue'
import { FILTER_ALL } from '@/utils/constants'

const props = defineProps({
  modelValue: { type: Object, required: true }, // { search, fabric, status }
  fabricOptions: { type: Array, default: () => [] },
  statusOptions: { type: Array, default: () => [] },
  resultCount: { type: Number, default: 0 }
})
const emit = defineEmits(['update:modelValue', 'reset'])

const update = (key, value) => emit('update:modelValue', { ...props.modelValue, [key]: value })
const isDirty = () => props.modelValue.search || props.modelValue.fabric !== FILTER_ALL || props.modelValue.status !== FILTER_ALL
</script>

<template>
  <div class="card space-y-5 p-4 sm:p-5">
    <div class="relative">
      <IconBase name="search" :size="18" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
      <input :value="modelValue.search" type="search" class="input pl-10" placeholder="Cari nama motif, misalnya Pucuk Rebung"
        aria-label="Cari motif" @input="update('search', $event.target.value)" />
    </div>

    <div>
      <p class="label">Jenis kain</p>
      <div class="flex flex-wrap gap-2">
        <button v-for="f in fabricOptions" :key="f" type="button" :class="['chip', modelValue.fabric === f && 'chip-active']"
          :aria-pressed="modelValue.fabric === f" @click="update('fabric', f)">{{ f }}</button>
      </div>
    </div>

    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="label">Status</p>
        <div class="flex flex-wrap gap-2">
          <button v-for="s in statusOptions" :key="s" type="button" :class="['chip', modelValue.status === s && 'chip-active']"
            :aria-pressed="modelValue.status === s" @click="update('status', s)">{{ s }}</button>
        </div>
      </div>
      <p class="text-sm text-zinc-500">
        {{ resultCount }} motif ditemukan
        <button v-if="isDirty()" type="button" class="ml-2 font-semibold text-gold-dark underline" @click="emit('reset')">Hapus filter</button>
      </p>
    </div>
  </div>
</template>
