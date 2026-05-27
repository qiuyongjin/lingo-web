<script setup lang="ts">
import { computed, ref } from 'vue'

const articleRef = ref<HTMLElement | null>(null)
const isApplyingHighlight = ref(false)

function handleTouchEnd() {
  console.log('[select] touchend triggered')

  const selection = window.getSelection()
  console.log('[select] immediate selection:', selection)
  console.log('[select] immediate isCollapsed:', selection?.isCollapsed)

  if (!selection || selection.isCollapsed) {
    console.log('[select] no valid selection on touchend')
    return
  }

  if (!articleRef.value) {
    console.log('[select] no articleRef')
    return
  }

  const range = selection.getRangeAt(0)
  console.log('[select] immediate range:', range)

  if (!articleRef.value.contains(range.commonAncestorContainer)) {
    console.log('[select] selection not in article')
    return
  }

  // 立即保存 range 数据
  const savedRange = range.cloneRange()
  console.log('[select] savedRange saved')

  // 延迟应用高亮
  setTimeout(() => {
    applyHighlightFromSavedRange(savedRange)
  }, 100)
}

function applyHighlightFromSavedRange(savedRange: Range) {
  console.log('[select] applying highlight from saved range')

  if (isApplyingHighlight.value) {
    console.log('[select] already applying')
    return
  }

  // 重新获取 selection 验证
  const selection = window.getSelection()
  if (!selection || selection.isCollapsed) {
    console.log('[select] selection cleared before apply')
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
  selection.removeAllRanges()

  isApplyingHighlight.value = false
  console.log('[select] highlight applied successfully')
}

// 示例文章内容
const sampleText = `这是一段示例文字，用于测试滑动选择功能。用户可以通过手指在屏幕上滑动来选中这段文字中的任意部分。选中的文字会以高亮方式显示，方便用户标记重要内容。

这是一个较长的段落，包含了足够多的文字内容，以便在移动设备上进行滑动选择操作。选中后的内容会以黄色背景高亮显示。

你可以尝试选中这段文字，或者选中其他段落中的部分内容。每一处高亮都会独立保存，可以同时存在多个高亮区域。刷新页面后高亮会消失，因为数据仅保存在内存中。`

const paragraphs = computed(() => {
  return sampleText.split('\n\n')
})
</script>

<template>
  <div class="select-page" @touchend="handleTouchEnd">
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
