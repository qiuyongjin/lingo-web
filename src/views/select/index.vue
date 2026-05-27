<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

const sampleText = `这是一段示例文字，用于测试滑动选择功能。用户可以通过手指在屏幕上滑动来选中这段文字中的任意部分。选中的文字会以高亮方式显示，方便用户标记重要内容。

这是一个较长的段落，包含了足够多的文字内容，以便在移动设备上进行滑动选择操作。选中后的内容会以黄色背景高亮显示。

你可以尝试选中这段文字，或者选中其他段落中的部分内容。每一处高亮都会独立保存，可以同时存在多个高亮区域。刷新页面后高亮会消失，因为数据仅保存在内存中。`

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
