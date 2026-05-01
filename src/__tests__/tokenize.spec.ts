import { describe, expect, it } from 'vitest'
import { tokenize } from '@/utils'

describe('jS 词元拆分（按单词为单位，处理缩写/省略/时间等边界）', () => {
  it('测试时间格式', () => {
    expect(tokenize(`It's 7 o'clock now.`))
      .toEqual(['It\'s', '7', 'o\'clock', 'now', '.'])
    expect(tokenize(`It's 7:00 o'clock now`))
      .toEqual(['It\'s', '7:00', 'o\'clock', 'now'])
  })
  it('测试连字符', () => {
    expect(tokenize(`John's book — state-of-the-art design.`))
      .toEqual(['John\'s', 'book', '—', 'state-of-the-art', 'design', '.'])
    expect(tokenize(`I had a moment of self-reflection.`))
      .toEqual(['I', 'had', 'a', 'moment', 'of', 'self-reflection', '.'])
  })
})
