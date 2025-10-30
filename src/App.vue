<script setup lang="ts">
import { handleGetSelection, sentence, target, updateHeight } from '@/views/read'

function init() {
  (window as any).handleGetSelection = handleGetSelection
  window.onload = () => {
    try {
      (window as any).nativeBridge.receiveMessage((message: any) => {
        const { action, data } = message
        if (action === 'annotation') {
          const targetIndex = target.value.findIndex((v: any) => v.word === data.word)
          if (targetIndex > -1) {
            target.value[targetIndex] = data
          }
          else {
            target.value.push(data)
          }
          updateHeight()
          return
        }
        sentence.value = data
        updateHeight()
      })
    }
    catch {
    }
  }
}
init()
</script>

<template>
  <router-view />
</template>

<style scoped>

</style>
