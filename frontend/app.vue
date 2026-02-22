<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: (title) => title ? `${title} — HR System` : 'HR Management System',
})
</script>

<style>
body {
  font-family: 'Noto Sans Thai', sans-serif;
}
</style>
