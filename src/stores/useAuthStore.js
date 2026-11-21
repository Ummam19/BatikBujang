import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import seed from '@/seed/admins.json'
import { STORAGE_KEYS } from '@/utils/constants'
import { loadJSON, saveJSON, removeKey } from '@/utils/storage'
import { deepClone, isValidEmail } from '@/utils/format'

export const useAuthStore = defineStore('auth', () => {
  const admins = ref([])
  const session = ref(null)
  const initialized = ref(false)

  watch(admins, (v) => { if (initialized.value) saveJSON(STORAGE_KEYS.admins, v) }, { deep: true, flush: 'sync' })
  watch(session, (v) => {
    if (!initialized.value) return
    if (v) saveJSON(STORAGE_KEYS.session, v)
    else removeKey(STORAGE_KEYS.session)
  }, { deep: true, flush: 'sync' })

  function initializeStore() {
    const storedAdmins = loadJSON(STORAGE_KEYS.admins)
    if (Array.isArray(storedAdmins) && storedAdmins.length === 2) {
      admins.value = storedAdmins
    } else {
      admins.value = deepClone(seed)
      saveJSON(STORAGE_KEYS.admins, admins.value)
    }
    const storedSession = loadJSON(STORAGE_KEYS.session)
    session.value = storedSession && storedSession.adminId ? storedSession : null
    initialized.value = true
  }

  // Sesi hanya valid jika akunnya masih ada
  const currentAdmin = computed(() =>
    session.value ? admins.value.find((a) => a.id === session.value.adminId) || null : null)
  const isLoggedIn = computed(() => !!currentAdmin.value)

  function login(email, password) {
    const e = String(email || '').trim().toLowerCase()
    if (!isValidEmail(e)) return { ok: false, message: 'Format email tidak valid.' }
    if (!password) return { ok: false, message: 'Password wajib diisi.' }
    const admin = admins.value.find((a) => a.email.toLowerCase() === e)
    if (!admin || admin.password !== password) return { ok: false, message: 'Email atau password salah.' }
    session.value = { adminId: admin.id, email: admin.email, name: admin.name, role: admin.role, loginAt: new Date().toISOString() }
    return { ok: true, admin }
  }

  function logout() { session.value = null }

  // list: [{ id, name, email, newPassword, confirmPassword }]
  function validateAdminAccounts(list) {
    const errors = {}
    if (list.length !== 2) errors.global = 'Sistem harus memiliki tepat 2 akun admin.'
    list.forEach((a, i) => {
      if (!String(a.name || '').trim()) errors[`name-${i}`] = 'Nama wajib diisi.'
      if (!isValidEmail(a.email)) errors[`email-${i}`] = 'Format email tidak valid.'
      if (a.newPassword) {
        if (a.newPassword.length < 8) errors[`newPassword-${i}`] = 'Password minimal 8 karakter.'
        if (a.newPassword !== a.confirmPassword) errors[`confirmPassword-${i}`] = 'Konfirmasi password tidak cocok.'
      } else if (a.confirmPassword) {
        errors[`confirmPassword-${i}`] = 'Isi password baru terlebih dahulu.'
      }
    })
    const emails = list.map((a) => String(a.email || '').trim().toLowerCase())
    if (emails.length === 2 && emails[0] === emails[1] && !errors['email-1']) errors['email-1'] = 'Email kedua akun harus berbeda.'
    return errors
  }

  function updateAdmins(list) {
    const errors = validateAdminAccounts(list)
    if (Object.keys(errors).length) return { ok: false, errors }
    admins.value = admins.value.map((a) => {
      const u = list.find((x) => x.id === a.id)
      if (!u) return a
      return { ...a, name: u.name.trim(), email: u.email.trim().toLowerCase(), password: u.newPassword || a.password }
    })
    if (session.value) {
      const me = currentAdmin.value
      if (me) session.value = { ...session.value, email: me.email, name: me.name }
    }
    return { ok: true }
  }

  function resetToSeed() {
    initialized.value = true
    const role = currentAdmin.value?.role
    admins.value = deepClone(seed)
    const match = admins.value.find((a) => a.role === role)
    session.value = match
      ? { adminId: match.id, email: match.email, name: match.name, role: match.role, loginAt: new Date().toISOString() }
      : null
  }

  return {
    admins, session, initialized, currentAdmin, isLoggedIn,
    initializeStore, login, logout, validateAdminAccounts, updateAdmins, resetToSeed
  }
})
