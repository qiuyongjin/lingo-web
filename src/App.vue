<script setup lang="ts">
import { sentence, target, updateHeight } from '@/views/read'

function init() {
  (window as any).handleGetSelection = function () {
    const selection = (window as any).getSelection().toString()
    // sentMessage({ action: 'debug', data: selection })
    return { text: selection }
  }
  window.onload = () => {
    try {
      (window as any).nativeBridge.receiveMessage((message: any) => {
        const { action, data } = message
        if (action === 'annotation') {
          // sentMessage({ action: 'debug', data })
          const targetIndex = target.value.findIndex((v: any) => {
            const index = v.line === data.line && v.wordIndex === data.wordIndex
            const titleOrBody = v.titleOrBody === data.titleOrBody
            return index && titleOrBody
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
