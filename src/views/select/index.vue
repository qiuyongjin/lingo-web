<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'

const articleRef = ref<HTMLElement | null>(null)
const isApplyingHighlight = ref(false)
let savedRange: Range | null = null

function handleSelectionChange() {
  const selection = window.getSelection()
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return

  const range = selection.getRangeAt(0)
  if (articleRef.value?.contains(range.commonAncestorContainer)) {
    savedRange = range.cloneRange()
    console.log('[select] selection changed, saved:', range.startOffset, '->', range.endOffset)
  }
}

function handleTouchEnd(e: TouchEvent) {
  console.log('[select] touchend')
  console.log('[select] savedRange before apply:', savedRange)

  // 如果没有在 touchmove 中获取到，尝试用 rangeFromPoint
  if (!savedRange && e.changedTouches.length > 0) {
    const touch = e.changedTouches[0]
    console.log('[select] touch end position:', touch.clientX, touch.clientY)

    // 使用 document.caretRangeFromPoint 获取点击位置
    try {
      const range = document.caretRangeFromPoint(touch.clientX, touch.clientY)
      if (range) {
        console.log('[select] range from point:', range.startOffset, '->', range.endOffset)
        console.log('[select] range collapsed:', range.collapsed)
        if (!range.collapsed && articleRef.value?.contains(range.commonAncestorContainer)) {
          savedRange = range.cloneRange()
          console.log('[select] saved range from caretRangeFromPoint')
        }
      }
    } catch (err) {
      console.log('[select] caretRangeFromPoint error:', err)
    }
  }

  // 延迟应用
  setTimeout(() => {
    console.log('[select] applying, savedRange:', savedRange)
    if (savedRange) {
      applyHighlight(savedRange)
    } else {
      console.log('[select] no range to apply')
    }
  }, 100)
}

function applyHighlight(rangeToApply: Range) {
  if (isApplyingHighlight.value) {
    console.log('[select] already applying')
    return
  }

  if (!articleRef.value) {
    console.log('[select] no articleRef')
    return
  }

  // 检查是否已高亮
  let currentNode: Node | null = rangeToApply.startContainer
  while (currentNode) {
    if (currentNode.nodeName === 'MARK') {
      console.log('[select] already marked, skip')
      return
    }
    currentNode = currentNode.parentNode
  }

  currentNode = rangeToApply.endContainer
  while (currentNode) {
    if (currentNode.nodeName === 'MARK') {
      console.log('[select] already marked, skip')
      return
    }
    currentNode = currentNode.parentNode
  }

  isApplyingHighlight.value = true

  console.log('[select] extracting contents, start:', rangeToApply.startOffset, 'end:', rangeToApply.endOffset)
  console.log('[select] startContainer text:', rangeToApply.startContainer.textContent?.substring(0, 20))
  console.log('[select] endContainer text:', rangeToApply.endContainer.textContent?.substring(0, 20))
  console.log('[select] same container:', rangeToApply.startContainer === rangeToApply.endContainer)

  const mark = document.createElement('mark')
  const extracted = rangeToApply.extractContents()
  console.log('[select] extracted content:', extracted.textContent?.substring(0, 50))
  console.log('[select] extracted children count:', extracted.childNodes.length)

  mark.appendChild(extracted)
  rangeToApply.insertNode(mark)

  console.log('[select] mark inserted, mark content:', mark.textContent?.substring(0, 50))

  const selection = window.getSelection()
  if (selection) {
    selection.removeAllRanges()
  }

  isApplyingHighlight.value = false
  console.log('[select] highlight applied')
}

onMounted(() => {
  document.addEventListener('selectionchange', handleSelectionChange)
  document.addEventListener('touchend', handleTouchEnd)
})

onUnmounted(() => {
  document.removeEventListener('selectionchange', handleSelectionChange)
  document.removeEventListener('touchend', handleTouchEnd)
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
