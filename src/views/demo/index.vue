<script setup lang="ts">
import SlideSelect from '@/components/SlideSelect/index.vue'

const paragraphs = [
  'This is a sample text for testing the slide selection feature. Users can swipe their fingers on the screen to select any portion of this text. Selected text will be highlighted for easy marking of important content.',
  'This is a longer paragraph containing enough text content to allow slide selection operations on mobile devices. Selected content will be highlighted with a yellow background.',
  'You can try selecting this text, or select part of the content from other paragraphs. Each highlight will be saved independently, and multiple highlight areas can exist at the same time. Highlights will disappear after refreshing the page since data is only stored in memory.',
]

function onSelect(range: Range | null) {
  if (range) {
    const text = range.toString()
    console.log(text)
  }
}
</script>

<template>
  <SlideSelect :content="paragraphs" @select="onSelect" />
</template>
