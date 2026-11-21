<script setup>
import NavbarPublic from '@/components/public/NavbarPublic.vue'
import FooterPublic from '@/components/public/FooterPublic.vue'
import WhatsAppOrderButton from '@/components/public/WhatsAppOrderButton.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <NavbarPublic />
    <main class="flex-1"><RouterView /></main>
    <FooterPublic />
    <WhatsAppOrderButton variant="floating" label="Tanya via WhatsApp" />
  </div>
</template>
