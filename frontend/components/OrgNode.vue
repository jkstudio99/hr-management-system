<template>
  <div :style="{ paddingLeft: `${depth * 24}px` }">
    <div class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
      <UAvatar :text="`${node.firstName?.charAt(0)}${node.lastName?.charAt(0)}`" size="sm" />
      <div class="min-w-0">
        <p class="text-sm font-medium">{{ node.firstName }} {{ node.lastName }}</p>
        <p class="text-caption-size text-gray-500">{{ node.jobTitle?.titleName || '' }} · {{ node.department?.departmentName || '' }}</p>
      </div>
      <UBadge v-if="node.subordinates?.length" variant="subtle" size="xs">{{ node.subordinates.length }}</UBadge>
    </div>
    <OrgNode v-for="child in node.subordinates" :key="child.id" :node="child" :depth="depth + 1" />
  </div>
</template>
<script setup lang="ts">
defineProps<{ node: any; depth: number }>()
</script>
