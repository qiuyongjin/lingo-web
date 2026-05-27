<script setup lang="ts">
import { computed, ref } from 'vue'

const articleRef = ref<HTMLElement | null>(null)
const isApplyingHighlight = ref(false)

function handleTouchEnd() {
  console.log('[select] touchend triggered')
  // 给浏览器一点时间完成选择
  setTimeout(() => {
    console.log('[select] touchend - checking selection after delay')
    handleSelectionChange()
  }, 100)
}

function handleSelectionChange() {
  console.log('[select] selectionchange triggered')
  console.log('[select] isApplyingHighlight:', isApplyingHighlight.value)

  // Avoid recursive calls
  if (isApplyingHighlight.value) {
    console.log('[select] skipped - already applying')
    return
  }

  const selection = window.getSelection()
  console.log('[select] selection:', selection)
  console.log('[select] selection.isCollapsed:', selection?.isCollapsed)

  if (!selection || selection.isCollapsed || !articleRef.value) {
    console.log('[select] skipped - no selection or collapsed')
    return
  }

  const range = selection.getRangeAt(0)
  console.log('[select] range:', range)
  console.log('[select] range.commonAncestorContainer:', range.commonAncestorContainer)
  console.log('[select] articleRef.value:', articleRef.value)

  if (!articleRef.value.contains(range.commonAncestorContainer)) {
    console.log('[select] skipped - not in article')
    return
  }

  isApplyingHighlight.value = true
  console.log('[select] applying highlight...')

  // Check if selection is already inside a <mark> element
  let currentNode: Node | null = range.startContainer
  let checkPath = ['startContainer:']
  while (currentNode) {
    checkPath.push(currentNode.nodeName)
    if (currentNode.nodeName === 'MARK') {
      console.log('[select] skipped - already marked (startContainer)')
      isApplyingHighlight.value = false
      return
    }
    currentNode = currentNode.parentNode
  }
  console.log('[select] startContainer path:', checkPath.join(' -> '))

  // Check endContainer as well
  currentNode = range.endContainer
  checkPath = ['endContainer:']
  while (currentNode) {
    checkPath.push(currentNode.nodeName)
    if (currentNode.nodeName === 'MARK') {
      console.log('[select] skipped - already marked (endContainer)')
      isApplyingHighlight.value = false
      return
    }
    currentNode = currentNode.parentNode
  }
  console.log('[select] endContainer path:', checkPath.join(' -> '))

  const mark = document.createElement('mark')
  mark.appendChild(range.extractContents())
  range.insertNode(mark)
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
