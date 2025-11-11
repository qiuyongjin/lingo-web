import type { ClickData, Target } from '@/types'
import { computed, ref } from 'vue'
import { extractTitle, getAppHeight, sentMessage, splitIntoParagraphs } from '@/utils'

export const sentence = ref('')
export const target = ref<Target[]>([])

// 把文章以段落拆分
export const sentences = computed(() => {
  return splitIntoParagraphs(sentence.value.trim())
})
export const useSentence = computed(() => {
  return extractTitle(sentences.value)
})

export function handleGetSelection(e: ClickData) {
  const { word, line, wordIndex } = e
  const base: string[] = Object.assign([], useSentence.value.body[line])
  base[wordIndex] = `{${word}}`
  return {
    ...e,
    sentence: base.join(' ').replace(/ , /g, ', '),
  }
}

/**
 * 更新高度
 * @param delay
 */
export function updateHeight(delay = 0) {
  setTimeout(() => {
    sentMessage({ action: 'updateHeight', data: { a: 1, height: getAppHeight() } })
  }, delay)
}
