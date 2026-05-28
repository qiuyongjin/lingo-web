<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import SlideSelect from '@/components/SlideSelect/index.vue'
import { initWordBoundaryExpand } from '@/utils/word-boundary-expand'
import { buildSentenceWithHighlight, sentence } from '@/views/home/index.ts'

let cleanupExpand: (() => void) | null = null

function onSelectionEnd(range: Range | null) {
  if (range) {
    const text = range.toString()
    console.warn(text)
  }
}

function onWordClick(word: string, range: Range | null) {
  const sentence = buildSentenceWithHighlight(word, range)
  if (!sentence)
    return

  console.warn(sentence)
  const data = {
    type: 'clickWord',
    payload: {
      word,
      line: 0,
      wordIndex: 1,
      titleOrBody: 'body',
      sentence,
    },
  }
  if (window.nativeBridge) {
    window.nativeBridge.send(data)
  }
}

onMounted(() => {
  if (window.nativeBridge) {
    window.nativeBridge.send({ type: 'getData' })
  }
  cleanupExpand = initWordBoundaryExpand()
})

onUnmounted(() => {
  cleanupExpand?.()
  cleanupExpand = null
})
</script>

<template>
  <div class="page">
    <p style="color: red;">
      {{ sentence.length }}
    </p>
    <SlideSelect :content="sentence" @selection-end="onSelectionEnd" @click="onWordClick" />
  </div>
</template>
