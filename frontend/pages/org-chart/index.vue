<template>
  <div>
    <PageHeader :title="t('orgChart.title')" description="" />
    <UCard>
      <div v-if="tree.length" class="space-y-2">
        <OrgNode v-for="node in tree" :key="node.id" :node="node" :depth="0" />
      </div>
      <div v-else class="text-center py-12 text-gray-400">
        <UIcon name="i-heroicons-squares-2x2" class="w-12 h-12 mx-auto mb-2" />
        <p>{{ t('orgChart.noData') }}</p>
      </div>
    </UCard>
  </div>
</template>
<script setup lang="ts">
useHead({ title: 'Org Chart' })
const api = useApiService()
const { t } = useI18n()
const tree = ref<any[]>([])
onMounted(async () => { try { tree.value = await api.orgChart.tree() } catch {} })
</script>
