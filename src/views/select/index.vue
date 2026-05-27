<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'

const articleRef = ref<HTMLElement | null>(null)
const isApplyingHighlight = ref(false)
const isTouching = ref(false)
let savedSelection: Selection | null = null

function handleTouchStart() {
  console.log('[select] touchstart')
  isTouching.value = true
  savedSelection = null

  // 监听 selectionchange 来捕获选择
  document.addEventListener('selectionchange', handleSelectionChangeOnTouch)
}

function handleSelectionChangeOnTouch() {
  if (!isTouching.value) return

  const selection = window.getSelection()
  console.log('[select] selectionchange during touch:', selection)
  console.log('[select] isCollapsed:', selection?.isCollapsed)

  if (selection && !selection.isCollapsed) {
    savedSelection = selection
    console.log('[select] selection saved during touch')
  }
}

function handleTouchEnd() {
  console.log('[select] touchend')
  isTouching.value = false

  document.removeEventListener('selectionchange', handleSelectionChangeOnTouch)

  // 延迟检查选择
  setTimeout(() => {
    console.log('[select] delayed check')

    const selection = window.getSelection()
    console.log('[select] selection after touch:', selection)
    console.log('[select] isCollapsed:', selection?.isCollapsed)

    // 使用 touch 期间保存的选择
    if (savedSelection) {
      console.log('[select] using saved selection')
      console.log('[select] saved anchorNode:', savedSelection.anchorNode)
      console.log('[select] saved focusNode:', savedSelection.focusNode)

      if (!articleRef.value) return

      const range = savedSelection.getRangeAt(0)
      console.log('[select] saved range:', range)

      if (articleRef.value.contains(range.commonAncestorContainer)) {
        const savedRange = range.cloneRange()
        applyHighlight(savedRange)
      }

      savedSelection = null
    } else if (selection && !selection.isCollapsed) {
      // 回退：尝试当前选择
      console.log('[select] falling back to current selection')
      if (!articleRef.value) return

      const range = selection.getRangeAt(0)
      if (articleRef.value.contains(range.commonAncestorContainer)) {
        applyHighlight(range.cloneRange())
      }
    } else {
      console.log('[select] no selection available')
    }
  }, 300)
}

function applyHighlight(savedRange: Range) {
  if (isApplyingHighlight.value) {
    console.log('[select] already applying')
    return
  }

  isApplyingHighlight.value = true

  // 检查是否已高亮
  let currentNode: Node | null = savedRange.startContainer
  let checkPath = ['startContainer:']
  while (currentNode) {
    checkPath.push(currentNode.nodeName)
    if (currentNode.nodeName === 'MARK') {
      console.log('[select] already marked')
      isApplyingHighlight.value = false
      return
    }
    currentNode = currentNode.parentNode
  }
  console.log('[select] startContainer path:', checkPath.join(' -> '))

  currentNode = savedRange.endContainer
  checkPath = ['endContainer:']
  while (currentNode) {
    checkPath.push(currentNode.nodeName)
    if (currentNode.nodeName === 'MARK') {
      console.log('[select] already marked')
      isApplyingHighlight.value = false
      return
    }
    currentNode = currentNode.parentNode
  }
  console.log('[select] endContainer path:', checkPath.join(' -> '))

  const mark = document.createElement('mark')
  mark.appendChild(savedRange.extractContents())
  savedRange.insertNode(mark)

  const selection = window.getSelection()
  if (selection) {
    selection.removeAllRanges()
  }

  isApplyingHighlight.value = false
  console.log('[select] highlight applied successfully')
}

onMounted(() => {
  document.addEventListener('touchstart', handleTouchStart, { passive: true })
  document.addEventListener('touchend', handleTouchEnd, { passive: true })
})

onUnmounted(() => {
  document.removeEventListener('touchstart', handleTouchStart)
  document.removeEventListener('touchend', handleTouchEnd)
  document.removeEventListener('selectionchange', handleSelectionChangeOnTouch)
})

// 示例文章内容
const sampleText = `这是一段示例文字，用于测试滑动选择功能。用户可以通过手指在屏幕上滑动来选中这段文字中的任意部分。选中的文字会以高亮方式显示，方便用户标记重要内容。

这是一个较长的段落，包含了足够多的文字内容，以便在移动设备上进行滑动选择操作。选中后的内容会以黄色背景高亮显示。

你可以尝试选中这段文字，或者选中其他段落中的部分内容。每一处高亮都会独立保存，可以同时存在多个高亮区域。刷新页面后高亮会消失，因为数据仅保存在内存中。`

const paragraphs = computed(() => {
  return sampleText.split('\n\n')
})
</script>

<template>
  <div class="select-page">
    <article ref="articleRef" class="article-content">
      <p v-for="(paragraph, index) in paragraphs" :key="index" v-html="paragraph" />
    </article>
  </div>
</template>

<style scoped>
.select-page {
  padding: 16px;
  min-height: 100vh;
  box-sizing: border-box;
  background: #fff;
}

.article-content {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
}

.article-content p {
  margin-bottom: 16px;
}

.article-content mark {
  background-color: #fff3cd;
  padding: 0 2px;
  border-radius: 2px;
}
</style>
