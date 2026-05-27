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
const interactionMode = ref<'idle' | 'selecting' | 'scrolling'>('idle')
const startPos = ref({ x: 0, y: 0 })

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

  startPos.value = { x: touch.clientX, y: touch.clientY }
  interactionMode.value = 'idle'

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
    }
  }

  // 点击在选区外：只记录位置，等待 touchmove 判断方向
  // 不立即创建选择，让首次 move 时再决定是选择还是滚动
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
  if (e.touches.length !== 1)
    return

  const touch = e.touches[0]
  const deltaX = touch.clientX - startPos.value.x
  const deltaY = touch.clientY - startPos.value.y

  // 首次移动时判断方向
  if (interactionMode.value === 'idle') {
    const range = getRangeFromPoint(startPos.value.x, startPos.value.y)
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // 水平滑动，进入选择模式
      interactionMode.value = 'selecting'
      if (range) {
        startRange.value = range
        selectionRange.value = range
        const selection = window.getSelection()
        if (selection) {
          selection.removeAllRanges()
          selection.addRange(range)
        }
      }
    }
    else {
      // 垂直滑动，进入滚动模式，保留已有选区
      interactionMode.value = 'scrolling'
      startRange.value = null
      return
    }
  }

  // 滚动模式：不拦截，让页面自然滚动
  if (interactionMode.value === 'scrolling') {
    return
  }

  // 选择模式
  if (interactionMode.value === 'selecting') {
    // 如果移动方向变为垂直，切换到滚动模式（保留选区）
    if (Math.abs(deltaY) > Math.abs(deltaX) * 1.5) {
      interactionMode.value = 'scrolling'
      startRange.value = null
      return
    }

    if (!startRange.value)
      return
    e.preventDefault()

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
    const isSameContainer = startContainer === endContainer
    const isForward = isSameContainer
      ? startOffset <= endOffset
      : Boolean(startContainer.compareDocumentPosition(endContainer) & Node.DOCUMENT_POSITION_FOLLOWING)

    if (isForward) {
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
}

function handleTouchEnd() {
  // 滚动结束后，如果有保存的选区但 DOM selection 已消失，恢复选区
  if (interactionMode.value === 'scrolling' && selectionRange.value) {
    const selection = window.getSelection()
    if (selection && selection.isCollapsed) {
      selection.removeAllRanges()
      selection.addRange(selectionRange.value)
    }
  }
  startRange.value = null
  interactionMode.value = 'idle'
}

function handleSelectionChange() {
  const selection = window.getSelection()
  if (!selection || selection.isCollapsed) {
    // DOM selection 被清除（可能是滚动导致）
    // 如果我们有保存的 selectionRange 且当前是滚动模式，保留它等待恢复
    return
  }
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
  font-size: 30px;
  line-height: 1.6;
}

.select-page p {
  margin: 30px 0;
}

.select-page ::selection {
  background: rgb(255, 200, 0);
}
</style>
