import type { ExtractTitle } from '@/types'

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
 * 从文本中提取标题（第一行）和正文。
 * 若只有一行，则返回 null 标题。
 */
export function extractTitle(texts: string[]): ExtractTitle {
  if (texts.length <= 1) {
    return { title: [], body: [texts] }
  }
  const title = tokenize(texts[0] ?? '')
  const body = texts.slice(1).map(p => tokenize(p))
  return { title, body }
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

/**
 * 将英文句子拆分为单词 token（保留缩写、带撇号的词、带连字符的词、时间格式等）
 * @param text
 */
export function tokenize(text: string) {
  if (!text)
    return []

  // 匹配规则说明：
  // 1. 时间：7:00, 07:30:15
  // 2. 数字（含小数）：123, 3.14
  // 3. 单词：支持缩写、连字符、撇号，如 it's, o'clock, rock'n'roll
  // 4. 标点符号：.,!?;:"'()[]{}—-
  // const re = /\d+:\d{2}(?::\d{2})?|\d+(?:\.\d+)?|[A-Z]+(?:[-'][A-Z]+)*|[.,!?;:"'(){}[\]—-]/gi
  const re = /\w+(?:[-']\w+)*|[^\w\s]+\s*/g

  return text.match(re) || []
}

export function tokenizeV1(text: string): string[] {
  if (!text)
    return []

  // 规则：
  // 1. 时间数字，如 7:00、07:30:15
  // 2. 纯数字（包括小数、序号等）
  // 3. 单词，允许内部撇号或连字符（例如 it's、o'clock、state-of-the-art）
  const re = /\d+:\d{2}(?::\d{2})?|\d+(?:\.\d+)?|[A-Z]+(?:[-'][A-Z]+)*/gi

  return text.match(re) || []
}
