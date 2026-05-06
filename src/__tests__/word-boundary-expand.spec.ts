import { describe, expect, it } from 'vitest'
import { isWordChar, isAtWordStart, isAtWordEnd } from '@/utils/word-boundary-expand'

describe('isWordChar', () => {
  it('returns true for letters', () => {
    expect(isWordChar('a')).toBe(true)
    expect(isWordChar('Z')).toBe(true)
  })
  it('returns true for digits', () => {
    expect(isWordChar('5')).toBe(true)
  })
  it('returns true for apostrophe and hyphen', () => {
    expect(isWordChar("'")).toBe(true)
    expect(isWordChar('-')).toBe(true)
  })
  it('returns false for punctuation and spaces', () => {
    expect(isWordChar('.')).toBe(false)
    expect(isWordChar(' ')).toBe(false)
    expect(isWordChar(',')).toBe(false)
  })
  it('returns true for underscore', () => {
    expect(isWordChar('_')).toBe(true)
  })
  it('returns false for null and undefined', () => {
    expect(isWordChar(null)).toBe(false)
    expect(isWordChar(undefined)).toBe(false)
  })
  it('returns false for empty or multi-char strings', () => {
    expect(isWordChar('')).toBe(false)
    expect(isWordChar('ab')).toBe(false)
  })
})

describe('isAtWordStart', () => {
  it('returns true at offset 0 when text starts with word char', () => {
    const node = document.createTextNode('hello')
    expect(isAtWordStart(node, 0)).toBe(true)
  })
  it('returns true when preceded by non-word char', () => {
    const node = document.createTextNode(' hello')
    expect(isAtWordStart(node, 1)).toBe(true)
  })
  it('returns false when in the middle of a word', () => {
    const node = document.createTextNode('hello')
    expect(isAtWordStart(node, 2)).toBe(false)
  })
  it('returns true at offset 0 when text starts with non-word char', () => {
    const node = document.createTextNode('.hello')
    expect(isAtWordStart(node, 0)).toBe(true)
  })
  it('returns true for out-of-bounds offset', () => {
    const node = document.createTextNode('hello')
    expect(isAtWordStart(node, -1)).toBe(true)
    expect(isAtWordStart(node, 100)).toBe(true)
  })
})

describe('isAtWordEnd', () => {
  it('returns true at text end after word char', () => {
    const node = document.createTextNode('hello')
    expect(isAtWordEnd(node, 5)).toBe(true)
  })
  it('returns true when next char is non-word', () => {
    const node = document.createTextNode('hello ')
    expect(isAtWordEnd(node, 5)).toBe(true)
  })
  it('returns false when in the middle of a word', () => {
    const node = document.createTextNode('hello')
    expect(isAtWordEnd(node, 2)).toBe(false)
  })
  it('returns false at offset 0', () => {
    const node = document.createTextNode('hello')
    expect(isAtWordEnd(node, 0)).toBe(false)
  })
  it('returns true for out-of-bounds offset', () => {
    const node = document.createTextNode('hello')
    expect(isAtWordEnd(node, -1)).toBe(true)
    expect(isAtWordEnd(node, 100)).toBe(true)
  })
})
