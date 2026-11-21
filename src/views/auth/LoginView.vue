<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BrandLogo from '@/components/common/BrandLogo.vue'
import IconBase from '@/components/common/IconBase.vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { useToast } from '@/composables/useToast'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const toast = useToast()

const form = ref({ email: '', password: '' })
const showPassword = ref(false)
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  const res = auth.login(form.value.email, form.value.password)
  loading.value = false
  if (!res.ok) {
    error.value = res.message
    return
  }
  toast.success(`Selamat datang, ${res.admin.name}.`)
  const target = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/admin')
    ? route.query.redirect : { name: 'admin-dashboard' }
  router.push(target)
}
</script>

<template>
  <div class="batik-pattern flex min-h-screen items-center justify-center bg-gold-soft px-4 py-10">
    <div class="w-full max-w-md">
      <RouterLink to="/" class="mb-6 flex justify-center" aria-label="Kembali ke beranda"><BrandLogo size="lg" /></RouterLink>

      <form class="card space-y-5 p-6 sm:p-8" novalidate @submit.prevent="submit">
        <div>
          <h1 class="font-display text-2xl font-bold">Login admin</h1>
          <p class="mt-1 text-sm text-zinc-600">Khusus Owner dan Pengelola Website.</p>
        </div>

        <div v-if="error" class="flex items-start gap-2 rounded-lg bg-danger-bg px-3 py-2.5 text-sm font-medium text-danger" role="alert">
          <IconBase name="alert" :size="18" /> {{ error }}
        </div>

        <div>
          <label for="email" class="label">Email</label>
          <input id="email" v-model="form.email" type="email" class="input" placeholder="nama@batikbujang.id" autocomplete="username" required />
        </div>

        <div>
          <label for="password" class="label">Password</label>
          <div class="relative">
            <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'" class="input pr-12" autocomplete="current-password" required />
            <button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-semibold text-gold-dark" @click="showPassword = !showPassword">
              {{ showPassword ? 'Sembunyikan' : 'Tampilkan' }}
            </button>
          </div>
        </div>

        <button type="submit" class="btn btn-primary w-full" :disabled="loading">
          <IconBase name="lock" :size="16" /> {{ loading ? 'Memeriksa...' : 'Masuk' }}
        </button>
        <RouterLink to="/" class="block text-center text-sm text-zinc-600 hover:text-gold-dark">Kembali ke etalase</RouterLink>
      </form>
    </div>
  </div>
</template>
