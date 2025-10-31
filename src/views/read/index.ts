import type { ClickData, Target } from '@/types'
import { computed, ref } from 'vue'
import { extractTitle, getAppHeight, sentMessage } from '@/utils'

export const sentence = ref('')
export const target = ref<Target[]>([])

export const useSentence = computed(() => {
  return extractTitle(sentence.value)
})

export function handleGetSelection(e: ClickData) {
  const { word, line, wordIndex } = e
  const base: string[] = Object.assign([], useSentence.value.body[line])
  base[wordIndex] = `{${word}}`
  return {
    word,
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
