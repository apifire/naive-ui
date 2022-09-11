<markdown>
# 可增加

增加一些标签页。只对 `'card'` 类型生效。
</markdown>

<template>
  <n-tabs
    v-model:value="value"
    type="card"
    :addable="addable"
    moreable
    :closable="closable"
    tab-style="min-width: 80px;"
    :render-more-icon="renderMoreIcon"
    :close-class="renderCloseIcon"
    @close="handleClose"
    @add="handleAdd"
    @more="handleMore"
  >
    <n-tab-pane v-for="panel in panels" :key="panel" :name="panel">
      {{ panel }}
    </n-tab-pane>
    <template #prefix>
      Prefix
    </template>
    <template #suffix>
      Suffix
    </template>
  </n-tabs>
</template>

<script lang="ts">
import { defineComponent, ref, computed, VNode, h } from 'vue'

export default defineComponent({
  setup () {
    const valueRef = ref(1)
    const panelsRef = ref([1, 2, 3, 4, 5])
    const addableRef = computed(() => {
      return {
        disabled: panelsRef.value.length >= 10
      }
    })
    const closableRef = computed(() => {
      return panelsRef.value.length > 1
    })
    return {
      value: valueRef,
      panels: panelsRef,
      addable: addableRef,
      closable: closableRef,
      handleAdd () {
        const newValue = Math.max(...panelsRef.value) + 1
        panelsRef.value.push(newValue)
        valueRef.value = newValue
      },
      handleClose (name: number) {
        const { value: panels } = panelsRef
        const nameIndex = panels.findIndex((panelName) => panelName === name)
        if (!~nameIndex) return
        panels.splice(nameIndex, 1)
        if (name === valueRef.value) {
          valueRef.value = panels[Math.min(nameIndex, panels.length - 1)]
        }
      },
      renderMoreIcon (data: number | string): VNode {
        return h('span', {}, { default: () => '测试' })
      },
      renderCloseIcon (data: number | string): string {
        console.log('--------------', data)
        return 'ceshi'
      },
      handleMore (e: MouseEvent) {
        console.log('我进来了yo', e)
      }
    }
  }
})
</script>
