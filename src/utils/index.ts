import type { ExtractTitle, SentMessageData } from '@/types'

/**
 * 将字符串按段落分割成数组
 * - 每段尾部不会有换行符或空格
 * - 段落由一个或多个空行分隔
 * @param {string} text - 输入字符串
 * @returns {string[]} - 段落数组
 */
export function splitIntoParagraphs(text: string): string[] {
  if (!text)
    return []

  return text
    .split(/\n/) // 两个换行符以上视为段落分隔
    .map(p => p.replace(/[\r\n]+$/g, '').trim()) // 去掉尾部换行符 + 首尾空格
    .filter(p => p.length > 0) // 去掉空段落
}

/**
 * 匹配带连字符的单词，普通单词，或单个标点符号
 * @param text
 * @return {RegExpMatchArray|*[]}
 */
export function splitIntoWords(text: any): RegExpMatchArray | [] {
  if (!text || typeof text !== 'string')
    return []
  return text.match(/\w+(?:-\w+)*|[^\s\w]/g) || []
}

/**
 * 从文本中提取标题（第一行）和正文。
 * 若只有一行，则返回 null 标题。
 */
export function extractTitle(texts: string[]): ExtractTitle {
  if (texts.length <= 1) {
    return { title: [], body: [texts] }
  }
  const title = splitIntoWords(texts[0])
  const body = texts.slice(1).map(p => splitIntoWords(p))
  return { title, body }
}

export function sentMessage(data: SentMessageData) {
  try {
    (window as any).webkit.messageHandlers.bridge.postMessage(data)
  }
  catch {
  }
}

export function getAppHeight() {
  const app = document.getElementById('app')
  return app?.clientHeight
}

/**
 * 匹配标点符号
 * @param text
 * @return {boolean}
 */
export function matchPunctuation(text: any): boolean {
  return !/^[a-z0-9]/i.test(text)
}
