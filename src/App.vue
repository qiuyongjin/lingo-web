<script setup lang="ts">
import { handleGetSelection, sentence, target, updateHeight } from '@/views/read'

function init() {
  (window as any).handleGetSelection = handleGetSelection
  window.onload = () => {
    try {
      (window as any).nativeBridge.receiveMessage((message: any) => {
        const { action, data } = message
        if (action === 'annotation') {
          // sentMessage({ action: 'debug', data })
          const targetIndex = target.value.findIndex((v: any) => {
            return v.line === data.line && v.wordIndex === data.wordIndex
          })
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
