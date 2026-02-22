<template>
  <div class="flex min-h-screen bg-gray-50 dark:bg-zinc-950">
    <Sidebar :collapsed="sidebarCollapsed" @toggle="sidebarCollapsed = !sidebarCollapsed" />
    <div class="flex-1 flex flex-col min-w-0">
      <Topbar @toggle-mobile="mobileOpen = !mobileOpen" />
      <main class="flex-1 p-4 lg:p-6 pb-20 md:pb-6">
        <slot />
      </main>
    </div>
    <MobileNav />

    <!-- Mobile sidebar overlay -->
    <USlideover v-model="mobileOpen" side="left" class="md:hidden">
      <div class="p-4">
        <div class="flex items-center gap-3 mb-6">
          <NuxtLink to="/" class="flex items-center min-w-0">
            <img src="~/assets/img/hr-logo.svg" alt="Hallman HR" class="h-8 w-auto max-w-[180px] object-contain text-gray-800 dark:text-white" />
          </NuxtLink>
        </div>
        <MobileSidebarNav @navigate="mobileOpen = false" />
      </div>
    </USlideover>
  </div>
</template>

<script setup lang="ts">
const sidebarCollapsed = ref(false)
const mobileOpen = ref(false)
</script>
