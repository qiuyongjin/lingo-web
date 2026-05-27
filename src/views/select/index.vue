<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'

const articleRef = ref<HTMLElement | null>(null)
const isApplyingHighlight = ref(false)
const isTouching = ref(false)
let savedRange: Range | null = null

function handleTouchStart() {
  console.log('[select] touchstart')
  isTouching.value = true
  savedRange = null
}

function handleTouchEnd(e: TouchEvent) {
  console.log('[select] touchend')
  isTouching.value = false

  // 尝试立即获取选择
  const selection = window.getSelection()
  console.log('[select] immediate selection:', selection)
  console.log('[select] immediate anchorNode:', selection?.anchorNode)

  // 如果立即获取不到，尝试用 caretRangeFromPoint
  if ((!selection || selection.isCollapsed) && e.changedTouches.length > 0) {
    console.log('[select] trying caretRangeFromPoint')
    const touch = e.changedTouches[0]
    try {
      const range = document.caretRangeFromPoint(touch.clientX, touch.clientY)
      if (range) {
        console.log('[select] caretRangeFromPoint found range:', range)
        console.log('[select] range.startContainer:', range.startContainer)
        console.log('[select] range.endContainer:', range.endContainer)

        if (articleRef.value?.contains(range.commonAncestorContainer)) {
          savedRange = range.cloneRange()
          console.log('[select] saved range from caretRangeFromPoint')
        }
      }
    } catch (err) {
      console.log('[select] caretRangeFromPoint error:', err)
    }
  }

  // 如果还是获取不到，延迟重试
  if (!savedRange) {
    console.log('[select] no range yet, will retry')
    let attempts = 0
    const maxAttempts = 10

    const tryGetSelection = () => {
      attempts++
      const sel = window.getSelection()
      console.log(`[select] retry ${attempts}:`, sel, sel?.isCollapsed)

      if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
        const r = sel.getRangeAt(0)
        if (articleRef.value?.contains(r.commonAncestorContainer)) {
          savedRange = r.cloneRange()
          console.log('[select] got selection on retry')
          return
        }
      }

      if (attempts < maxAttempts) {
        setTimeout(tryGetSelection, 50)
      } else {
        console.log('[select] giving up after 10 attempts')
      }
    }

    setTimeout(tryGetSelection, 50)
  }

  // 最终应用
  setTimeout(() => {
    console.log('[select] final apply, savedRange:', savedRange)
    if (savedRange) {
      applyHighlight(savedRange)
    }
  }, 500)
}

function applyHighlight(rangeToApply: Range) {
  if (isApplyingHighlight.value) return

  if (!articleRef.value) return

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

  const mark = document.createElement('mark')
  mark.appendChild(rangeToApply.extractContents())
  rangeToApply.insertNode(mark)

  const selection = window.getSelection()
  if (selection) {
    selection.removeAllRanges()
  }

  isApplyingHighlight.value = false
  console.log('[select] highlight applied')
}

onMounted(() => {
  document.addEventListener('touchstart', handleTouchStart, { passive: true })
  document.addEventListener('touchend', handleTouchEnd)
})

onUnmounted(() => {
  document.removeEventListener('touchstart', handleTouchStart)
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
