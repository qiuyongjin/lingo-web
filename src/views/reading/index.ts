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

function getTextNodesInParagraph(paragraphEl: Element): Text[] {
  const textNodes: Text[] = []
  const walker = document.createTreeWalker(paragraphEl, NodeFilter.SHOW_TEXT, null)
  let node: Text | null = walker.nextNode() as Text | null
  while (node) {
    textNodes.push(node)
    node = walker.nextNode() as Text | null
  }
  return textNodes
}

export function buildSentenceWithClickedWord(paragraphEl: Element | null, clickedWord: string, range: Range | null): string {
  if (!paragraphEl || !range || !clickedWord)
    return ''

  const fullText = paragraphEl.textContent || ''
  if (!fullText)
    return ''

  // Find the position of clickedWord in the paragraph
  // Use the range to get precise position
  const wordLength = clickedWord.length
  let charIndex = 0
  let foundNode: Text | null = null
  let foundOffset = 0

  // Walk through all text nodes to find the range's position
  const textNodes = getTextNodesInParagraph(paragraphEl)
  for (const node of textNodes) {
    if (node === range.startContainer) {
      foundNode = node
      foundOffset = charIndex + range.startOffset
      break
    }
    charIndex += node.textContent?.length || 0
  }

  if (!foundNode) {
    // Fallback: find first occurrence in full text
    const pos = fullText.indexOf(clickedWord)
    if (pos === -1)
      return fullText
    return `${fullText.slice(0, pos)}{${clickedWord}}${fullText.slice(pos + wordLength)}`
  }

  // Build sentence with {} around the clicked word
  const before = fullText.slice(0, foundOffset)
  const after = fullText.slice(foundOffset + wordLength)
  return `${before}{${clickedWord}}${after}`
}
