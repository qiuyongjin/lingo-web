<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{
  content: string
}>()

const emit = defineEmits<{
  selectionEnd: [range: Range | null]
  click: [word: string, range: Range | null, x: number, y: number]
}>()

const paragraphs = computed(() => props.content.split('\n'))

const selectionRange = ref<Range | null>(null)
const startRange = ref<Range | null>(null)
const interactionMode = ref<'idle' | 'selecting' | 'scrolling'>('idle')
const startPos = ref({ x: 0, y: 0 })
const rootEl = ref<HTMLElement | null>(null)

defineExpose({
  getSelection: () => selectionRange.value,
})

function getWordRange(node: Node, offset: number): Range | null {
  const text = node.textContent || ''
  if (!text)
    return null

  let start = offset
  let end = offset

  while (start > 0 && /\w/.test(text[start - 1])) {
    start--
  }
  while (end < text.length && /\w/.test(text[end])) {
    end++
  }

  if (start === end)
    return null

  const range = document.createRange()
  range.setStart(node, start)
  range.setEnd(node, end)
  return range
}

function getWordAtPoint(x: number, y: number): { word: string, range: Range | null } | null {
  const pos = document.caretPositionFromPoint(x, y)
  if (!pos)
    return null

  // Verify the element at point matches the offset node's container
  // This prevents caretPositionFromPoint from returning a position
  // in a different paragraph when clicking in whitespace between them
  const elementAtPoint = document.elementFromPoint(x, y)
  const targetElement = pos.offsetNode.parentElement
  if (elementAtPoint && targetElement && !targetElement.contains(elementAtPoint)) {
    return null
  }

  const range = getWordRange(pos.offsetNode, pos.offset)
  if (!range)
    return null

  return {
    word: range.toString(),
    range,
  }
}

function handleClick(e: MouseEvent) {
  if (selectionRange.value && isPointInRange(e.clientX, e.clientY, selectionRange.value)) {
    return
  }

  const result = getWordAtPoint(e.clientX, e.clientY)
  removeAllRanges()

  if (!result) {
    return
  }

  emit('click', result.word, result.range, e.clientX, e.clientY)
}

// 彻底清除选择内容
function removeAllRanges() {
  window.getSelection()?.removeAllRanges()
  selectionRange.value = null
}

function getRangeFromPoint(x: number, y: number): Range | null {
  const pos = document.caretPositionFromPoint(x, y)
  if (!pos)
    return null
  return getWordRange(pos.offsetNode, pos.offset)
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

  if (!selection.isCollapsed && selectionRange.value) {
    const range = selectionRange.value
    const isInsideRange = isPointInRange(touch.clientX, touch.clientY, range)
    if (isInsideRange) {
      startRange.value = null
    }
  }
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

  if (interactionMode.value === 'idle') {
    const range = getRangeFromPoint(startPos.value.x, startPos.value.y)
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
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
      interactionMode.value = 'scrolling'
      startRange.value = null
      return
    }
  }

  if (interactionMode.value === 'scrolling') {
    return
  }

  if (interactionMode.value === 'selecting') {
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
  if (interactionMode.value === 'scrolling' && selectionRange.value) {
    const selection = window.getSelection()
    if (selection && selection.isCollapsed) {
      selection.removeAllRanges()
      selection.addRange(selectionRange.value)
    }
  }
  if (selectionRange.value) {
    emit('selectionEnd', selectionRange.value)
  }
  startRange.value = null
  interactionMode.value = 'idle'
}

onMounted(() => {
  if (!rootEl.value)
    return

  rootEl.value.addEventListener('touchstart', handleTouchStart, { passive: true })
  rootEl.value.addEventListener('touchmove', handleTouchMove, { passive: false })
  rootEl.value.addEventListener('touchend', handleTouchEnd)
  rootEl.value.addEventListener('touchcancel', handleTouchEnd)
  rootEl.value.addEventListener('click', handleClick)
})

onUnmounted(() => {
  if (!rootEl.value)
    return

  rootEl.value.removeEventListener('touchstart', handleTouchStart)
  rootEl.value.removeEventListener('touchmove', handleTouchMove)
  rootEl.value.removeEventListener('touchend', handleTouchEnd)
  rootEl.value.removeEventListener('touchcancel', handleTouchEnd)
  rootEl.value.removeEventListener('click', handleClick)
})
</script>

<template>
  <div ref="rootEl" class="slide-select">
    <p v-for="(paragraph, index) in paragraphs" :key="index" v-html="paragraph" />
  </div>
</template>

<style scoped>
*::selection,
*::-webkit-selection {
  color: #fff !important;
  background-color: #ff8c286e !important;
}

.slide-select {
  box-sizing: border-box;
  line-height: 1.32;
  user-select: text;
  -webkit-user-select: text;
  cursor: text;
}
</style>
