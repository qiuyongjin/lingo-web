<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

const sampleText = `This is a sample text for testing the slide selection feature. Users can swipe their fingers on the screen to select any portion of this text. Selected text will be highlighted for easy marking of important content.

This is a longer paragraph containing enough text content to allow slide selection operations on mobile devices. Selected content will be highlighted with a yellow background.

You can try selecting this text, or select part of the content from other paragraphs. Each highlight will be saved independently, and multiple highlight areas can exist at the same time. Highlights will disappear after refreshing the page since data is only stored in memory.`

const paragraphs = computed(() => {
  return sampleText.split('\n\n')
})

const selectionRange = ref<Range | null>(null)
const startRange = ref<Range | null>(null)

function getRangeFromPoint(x: number, y: number): Range | null {
  if (!document.caretRangeFromPoint)
    return null
  const range = document.caretRangeFromPoint(x, y)
  return range
}

function handleTouchStart(e: TouchEvent) {
  if (e.touches.length !== 1)
    return
  const touch = e.touches[0]

  const selection = window.getSelection()
  if (!selection)
    return

  // 如果已有选择，检查点击位置是否在选择区域边界附近
  // 如果是，不重置选择，让浏览器处理手柄拖拽
  if (!selection.isCollapsed && selectionRange.value) {
    const range = selectionRange.value
    const isInsideRange = isPointInRange(touch.clientX, touch.clientY, range)
    if (isInsideRange) {
      // 点击在选区内，不重置，让浏览器处理
      startRange.value = null
      return
    }
  }

  // 点击在选区外，开始新的选择
  const range = getRangeFromPoint(touch.clientX, touch.clientY)
  if (!range)
    return

  startRange.value = range
  selectionRange.value = range

  selection.removeAllRanges()
  selection.addRange(range)
}

function isPointInRange(x: number, y: number, range: Range): boolean {
  const rects = range.getClientRects()
  if (rects.length === 0)
    return false

  const padding = 10
  for (let i = 0; i < rects.length; i++) {
    const rect = rects[i]
    if (
      x >= rect.left - padding
      && x <= rect.right + padding
      && y >= rect.top - padding
      && y <= rect.bottom + padding
    ) {
      return true
    }
  }
  return false
}

function handleTouchMove(e: TouchEvent) {
  if (e.touches.length !== 1 || !startRange.value)
    return
  e.preventDefault()

  const touch = e.touches[0]
  const range = getRangeFromPoint(touch.clientX, touch.clientY)
  if (!range)
    return

  const selection = window.getSelection()
  if (!selection)
    return

  selection.removeAllRanges()

  const newRange = document.createRange()
  const startContainer = startRange.value.startContainer
  const startOffset = startRange.value.startOffset
  const endContainer = range.endContainer
  const endOffset = range.endOffset

  // 确保起点在终点之前
  if (
    startContainer === endContainer && startOffset <= endOffset
    || startContainer !== endContainer
    && (startContainer.compareDocumentPosition(endContainer) & Node.DOCUMENT_POSITION_FOLLOWING)
  ) {
    newRange.setStart(startContainer, startOffset)
    newRange.setEnd(endContainer, endOffset)
  }
  else {
    newRange.setStart(endContainer, endOffset)
    newRange.setEnd(startContainer, startOffset)
  }

  selection.addRange(newRange)
  selectionRange.value = newRange
}

function handleTouchEnd() {
  startRange.value = null
}

function handleSelectionChange() {
  console.log('[select] selectionchange', window.getSelection()?.toString())
  const selection = window.getSelection()
  if (!selection || selection.isCollapsed)
    return
  if (selection.rangeCount > 0) {
    selectionRange.value = selection.getRangeAt(0)
  }
}

onMounted(() => {
  document.addEventListener('touchstart', handleTouchStart, { passive: true })
  document.addEventListener('touchmove', handleTouchMove, { passive: false })
  document.addEventListener('touchend', handleTouchEnd)
  document.addEventListener('touchcancel', handleTouchEnd)
  document.addEventListener('selectionchange', handleSelectionChange)
})

onUnmounted(() => {
  document.removeEventListener('touchstart', handleTouchStart)
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
  document.removeEventListener('touchcancel', handleTouchEnd)
  document.removeEventListener('selectionchange', handleSelectionChange)
})
</script>

<template>
  <div class="select-page">
    <p v-for="(paragraph, index) in paragraphs" :key="index" v-html="paragraph" />
  </div>
</template>

<style scoped>
.select-page {
  padding: 16px;
  min-height: 100vh;
  box-sizing: border-box;
  background: #fff;
  user-select: text;
  -webkit-user-select: text;
  cursor: text;
  font-size: 20px;
  line-height: 1.8;
}

.select-page p {
  margin: 12px 0;
}

.select-page ::selection {
  background: rgb(255, 200, 0);
}
</style>
