<script setup lang="ts">
import { nextTick } from 'vue'
import { sentence, target, updateHeight } from '@/views/reading'

function init() {
  if (!window.nativeBridge)
    return

  window.nativeBridge.onMessage = (msg: any) => {
    const { type, payload } = msg
    if (type === 'annotation') {
      const targetIndex = target.value.findIndex((v: any) => {
        const index = v.line === payload.line && v.wordIndex === payload.wordIndex
        const titleOrBody = v.titleOrBody === payload.titleOrBody
        return index && titleOrBody
      })
      if (targetIndex > -1) {
        target.value[targetIndex] = payload
      }
      else {
        target.value.push(payload)
      }
      updateHeight()
      return
    }
    if (type === 'setContent') {
      sentence.value = payload.data
      // window.nativeBridge.send({ type: 'debug', payload: { data: sentence.value } })
      nextTick(() => {
        updateHeight()
      })
    }
  }
}

window.onload = () => {
  init()
}
</script>

<template>
  <router-view />
</template>

<style scoped>

</style>
