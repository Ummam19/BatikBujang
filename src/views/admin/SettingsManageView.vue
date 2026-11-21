<script setup>
import { ref, reactive, watch } from 'vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import IconBase from '@/components/common/IconBase.vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useProductStore } from '@/stores/useProductStore'
import { useTransactionStore } from '@/stores/useTransactionStore'
import { useToast } from '@/composables/useToast'

const auth = useAuthStore()
const settings = useSettingsStore()
const productStore = useProductStore()
const txStore = useTransactionStore()
const toast = useToast()

const tabs = [
  { key: 'akun', label: 'Akun admin', icon: 'user' },
  { key: 'toko', label: 'Profil toko', icon: 'pin' },
  { key: 'bayar', label: 'Pembayaran', icon: 'card' },
  { key: 'data', label: 'Data', icon: 'refresh' }
]
const tab = ref('akun')

// ---- Akun admin (2 akun) ----
const accounts = ref([])
const accountErrors = ref({})
const showPw = ref(false)
watch(() => auth.admins, (list) => {
  accounts.value = list.map((a) => ({ id: a.id, name: a.name, role: a.role, email: a.email, newPassword: '', confirmPassword: '' }))
}, { immediate: true, deep: true })

function saveAccounts() {
  const res = auth.updateAdmins(accounts.value)
  if (!res.ok) {
    accountErrors.value = res.errors
    toast.warning(res.errors.global || 'Periksa kembali data akun.')
    return
  }
  accountErrors.value = {}
  toast.success('Email dan password admin berhasil diperbarui.')
}

// ---- Profil toko ----
const profile = reactive({ ...settings.store })
const profileErrors = ref({})
function saveProfile() {
  const res = settings.updateStoreProfile(profile)
  if (!res.ok) {
    profileErrors.value = res.errors
    toast.warning('Periksa kembali data toko.')
    return
  }
  profileErrors.value = {}
  profile.whatsappNumber = settings.store.whatsappNumber
  toast.success('Profil toko berhasil disimpan.')
}

// ---- Metode pembayaran ----
const payments = ref(settings.paymentMethods.map((m) => ({ ...m })))
const paymentErrors = ref({})
const addPayment = () => payments.value.push({ name: '', detail: '' })
const removePayment = (i) => payments.value.splice(i, 1)
function savePayments() {
  const res = settings.updatePaymentMethods(payments.value)
  if (!res.ok) {
    paymentErrors.value = res.errors
    toast.warning(res.errors.global || 'Periksa kembali metode pembayaran.')
    return
  }
  paymentErrors.value = {}
  payments.value = settings.paymentMethods.map((m) => ({ ...m }))
  toast.success('Metode pembayaran disimpan.')
}

// ---- Reset ----
const resetOpen = ref(false)
function resetAll() {
  settings.resetToSeed()
  productStore.resetToSeed()
  txStore.resetToSeed()
  auth.resetToSeed()
  Object.assign(profile, settings.store)
  payments.value = settings.paymentMethods.map((m) => ({ ...m }))
  toast.success('Semua data dikembalikan ke JSON seed awal.')
}
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-5">
    <div class="flex gap-1 overflow-x-auto rounded-xl bg-zinc-100 p-1" role="tablist">
      <button v-for="t in tabs" :key="t.key" role="tab" :aria-selected="tab === t.key"
        :class="['flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold', tab === t.key ? 'bg-white text-ink shadow-sm' : 'text-zinc-600 hover:text-ink']"
        @click="tab = t.key">
        <IconBase :name="t.icon" :size="16" /> {{ t.label }}
      </button>
    </div>

    <!-- AKUN -->
    <form v-if="tab === 'akun'" class="space-y-5" novalidate @submit.prevent="saveAccounts">
      <p class="text-sm text-zinc-600">Sistem hanya mengizinkan dua akun: Owner dan Pengelola Website. Kosongkan password baru jika tidak ingin mengubahnya.</p>
      <p v-if="accountErrors.global" class="field-error">{{ accountErrors.global }}</p>

      <section v-for="(a, i) in accounts" :key="a.id" class="card space-y-4 p-5">
        <h2 class="font-display text-lg font-semibold">{{ a.role }}</h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label :for="`acc-name-${i}`" class="label">Nama</label>
            <input :id="`acc-name-${i}`" v-model="a.name" type="text" :class="['input', accountErrors[`name-${i}`] && 'input-error']" />
            <p v-if="accountErrors[`name-${i}`]" class="field-error">{{ accountErrors[`name-${i}`] }}</p>
          </div>
          <div>
            <label :for="`acc-email-${i}`" class="label">Email login</label>
            <input :id="`acc-email-${i}`" v-model="a.email" type="email" autocomplete="off" :class="['input', accountErrors[`email-${i}`] && 'input-error']" />
            <p v-if="accountErrors[`email-${i}`]" class="field-error">{{ accountErrors[`email-${i}`] }}</p>
          </div>
          <div>
            <label :for="`acc-pw-${i}`" class="label">Password baru</label>
            <input :id="`acc-pw-${i}`" v-model="a.newPassword" :type="showPw ? 'text' : 'password'" autocomplete="new-password" placeholder="Minimal 8 karakter" :class="['input', accountErrors[`newPassword-${i}`] && 'input-error']" />
            <p v-if="accountErrors[`newPassword-${i}`]" class="field-error">{{ accountErrors[`newPassword-${i}`] }}</p>
          </div>
          <div>
            <label :for="`acc-cpw-${i}`" class="label">Konfirmasi password baru</label>
            <input :id="`acc-cpw-${i}`" v-model="a.confirmPassword" :type="showPw ? 'text' : 'password'" autocomplete="new-password" :class="['input', accountErrors[`confirmPassword-${i}`] && 'input-error']" />
            <p v-if="accountErrors[`confirmPassword-${i}`]" class="field-error">{{ accountErrors[`confirmPassword-${i}`] }}</p>
          </div>
        </div>
      </section>

      <div class="flex flex-wrap items-center justify-between gap-3">
        <label class="flex items-center gap-2 text-sm text-zinc-700"><input v-model="showPw" type="checkbox" class="rounded border-zinc-300 text-gold focus:ring-gold" /> Tampilkan password yang diketik</label>
        <button type="submit" class="btn btn-primary"><IconBase name="check" :size="16" /> Simpan akun</button>
      </div>
    </form>

    <!-- TOKO -->
    <form v-else-if="tab === 'toko'" class="card space-y-4 p-5" novalidate @submit.prevent="saveProfile">
      <div>
        <label for="st-wa" class="label">Nomor WhatsApp owner</label>
        <input id="st-wa" v-model="profile.whatsappNumber" type="tel" inputmode="tel" placeholder="081234567890" :class="['input', profileErrors.whatsappNumber && 'input-error']" />
        <p v-if="profileErrors.whatsappNumber" class="field-error">{{ profileErrors.whatsappNumber }}</p>
        <p v-else class="field-hint">Disimpan dalam format internasional (62...) untuk link wa.me.</p>
      </div>
      <div>
        <label for="st-shopee" class="label">Link toko Shopee</label>
        <input id="st-shopee" v-model="profile.shopeeUrl" type="url" placeholder="https://shopee.co.id/nama-toko" :class="['input', profileErrors.shopeeUrl && 'input-error']" />
        <p v-if="profileErrors.shopeeUrl" class="field-error">{{ profileErrors.shopeeUrl }}</p>
      </div>
      <div>
        <label for="st-address" class="label">Alamat usaha</label>
        <textarea id="st-address" v-model="profile.address" rows="3" :class="['input', profileErrors.address && 'input-error']"></textarea>
        <p v-if="profileErrors.address" class="field-error">{{ profileErrors.address }}</p>
      </div>
      <div class="flex justify-end"><button type="submit" class="btn btn-primary"><IconBase name="check" :size="16" /> Simpan profil toko</button></div>
    </form>

    <!-- PEMBAYARAN -->
    <form v-else-if="tab === 'bayar'" class="card space-y-4 p-5" novalidate @submit.prevent="savePayments">
      <p class="text-sm text-zinc-600">Metode ini tampil di etalase publik dan menjadi pilihan saat mencatat order.</p>
      <p v-if="paymentErrors.global" class="field-error">{{ paymentErrors.global }}</p>
      <div v-for="(m, i) in payments" :key="i" class="grid gap-3 rounded-xl border border-zinc-200 p-3 sm:grid-cols-[1fr_2fr_auto] sm:items-start">
        <div>
          <input v-model="m.name" type="text" placeholder="Nama metode" :aria-label="`Nama metode ${i + 1}`" :class="['input', paymentErrors[`name-${i}`] && 'input-error']" />
          <p v-if="paymentErrors[`name-${i}`]" class="field-error">{{ paymentErrors[`name-${i}`] }}</p>
        </div>
        <input v-model="m.detail" type="text" placeholder="Keterangan untuk pembeli" :aria-label="`Keterangan metode ${i + 1}`" class="input" />
        <button type="button" class="btn btn-ghost !text-danger" :disabled="payments.length <= 1" :aria-label="`Hapus metode ${i + 1}`" @click="removePayment(i)"><IconBase name="trash" :size="16" /></button>
      </div>
      <div class="flex flex-wrap justify-between gap-3">
        <button type="button" class="btn btn-outline" @click="addPayment"><IconBase name="plus" :size="16" /> Tambah metode</button>
        <button type="submit" class="btn btn-primary"><IconBase name="check" :size="16" /> Simpan pembayaran</button>
      </div>
    </form>

    <!-- DATA -->
    <section v-else class="card space-y-4 p-5">
      <h2 class="font-display text-lg font-semibold">Reset data ke JSON seed awal</h2>
      <p class="text-sm leading-relaxed text-zinc-600">
        Mengembalikan produk, transaksi, pengaturan toko, dan kedua akun admin ke isi file <code>src/seed/*.json</code>.
        Semua perubahan yang tersimpan di browser ini akan hilang. Cocok untuk pengujian QA dan demo.
        Setelah mengedit file seed, jalankan reset ini agar perubahannya terbaca.
      </p>
      <button class="btn btn-danger" @click="resetOpen = true"><IconBase name="refresh" :size="16" /> Reset data ke seed awal</button>
    </section>

    <ConfirmDialog v-model="resetOpen" title="Reset semua data?" confirm-text="Ya, reset semua"
      message="Seluruh produk, order, pengaturan, dan akun admin akan dikembalikan ke data seed awal. Tindakan ini tidak dapat dibatalkan." @confirm="resetAll" />
  </div>
</template>
