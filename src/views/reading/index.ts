import type { Target } from '@/types'
import { computed, ref } from 'vue'
import { getAppHeight, splitIntoParagraphs } from '@/utils'

export const sentence = ref(
  '',
  // 'hello world\nI like a cute cat, especially a Persian cat, which is really adorable and has soft fur.',
)
export const target = ref<Target[]>([])

// 把文章以段落拆分
export const sentences = computed(() => {
  return splitIntoParagraphs(sentence.value.trim())
})

export const useSentence = computed(() => {
  const result = { title: '', body: sentence.value }

  if (sentences.value.length > 1) {
    result.title = sentences.value[0]
    result.body = sentences.value.slice(1).join('\n')
  }

  return result
})

/**
 * 更新高度
 * @param delay
 */
export function updateHeight(delay = 0) {
  setTimeout(() => {
    if (!window.nativeBridge)
      return
    window.nativeBridge.send({ type: 'updateHeight', payload: { height: getAppHeight() } })
  }, delay)
}

export function buildSentenceWithHighlight(word: string, range: Range | null): string | null {
  if (!range)
    return null
  const slideSelect = document.querySelector('.slide-select')
  if (!slideSelect)
    return null
  let offset = 0
  const walker = document.createTreeWalker(slideSelect, NodeFilter.SHOW_TEXT, null)
  while (walker.nextNode()) {
    const node = walker.currentNode as Text
    if (node === range.startContainer) {
      offset += range.startOffset
      break
    }
    offset += node.textContent?.length || 0
  }
  const content = (slideSelect as HTMLElement).textContent || ''
  const before = content.substring(0, offset)
  const after = content.substring(offset + word.length)
  return `${before}{${word}}${after}`
}
