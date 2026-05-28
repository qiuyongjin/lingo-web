<script setup lang="ts">
import { nextTick, onMounted, onUnmounted } from 'vue'
import SlideSelect from '@/components/SlideSelect/index.vue'
import { buildSentenceWithClickedWord, sentence, useSentence } from '@/views/reading/index.ts'

let cleanupExpand: (() => void) | null = null

function onSelectionEnd(range: Range | null) {
  if (range) {
    const text = range.toString()
    console.warn(text)
  }
}

function onWordClick(word: string, range: Range | null, _x: number, _y: number) {
  // Get the paragraph element containing this word
  let paragraphEl: Element | null = null
  if (range) {
    let node: Node | null = range.startContainer
    while (node && node.nodeType !== Node.ELEMENT_NODE) {
      node = node.parentNode
    }
    // Walk up to find p element
    while (node && node.nodeName !== 'P' && node.nodeName !== 'DIV') {
      node = node.parentNode
    }
    paragraphEl = node as Element | null
  }

  const sentence = buildSentenceWithClickedWord(paragraphEl, word, range)
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
  // cleanupExpand = initWordBoundaryExpand()
  if (window.nativeBridge) {
    window.nativeBridge.send({ type: 'bridgeReady' })
  }
  nextTick(() => {
    if (!sentence.value.length) {
      sentence.value = `October 12, Wednesday, Cloudy

Today I feel a little sad. I woke up in the morning and saw the gray sky. The clouds are heavy, and there is no sun. I think the weather makes me feel down.

I played with my toy dog, but I was not happy. Maybe I miss my friend. She moved to a new city last week. I tried to call her, but she was not home. I ate my lunch alone, and the food was not tasty.

After dinner, I sat by the window and watched the rain. The rain sounds like soft music. I feel better now. I know tomorrow will be a new day. I hope the sun comes out.`
    }
  })
})

onUnmounted(() => {
  cleanupExpand?.()
  cleanupExpand = null
})
</script>

<template>
  <div class="page">
    <SlideSelect
      :content="useSentence.title"
      text-color="#ff8d28"
      font-size="38px"
      font-weight="bold"
      @selection-end="onSelectionEnd"
      @click="onWordClick"
    />
    <SlideSelect
      :content="useSentence.body"
      @selection-end="onSelectionEnd"
      @click="onWordClick"
    />
  </div>
</template>
