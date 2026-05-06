export function isWordChar(ch: string | null | undefined): boolean {
  return !!ch && ch.length === 1 && /[\w'\-]/.test(ch)
}

export function isAtWordStart(textNode: Text, offset: number): boolean {
  const text = textNode.textContent
  if (!text || offset < 0 || offset > text.length)
    return true
  if (offset < text.length && !isWordChar(text[offset]))
    return true
  if (offset === 0)
    return true
  return !isWordChar(text[offset - 1])
}

export function isAtWordEnd(textNode: Text, offset: number): boolean {
  const text = textNode.textContent
  if (!text || offset < 0 || offset > text.length)
    return true
  if (offset === 0)
    return false
  if (!isWordChar(text[offset - 1]))
    return false
  if (offset >= text.length)
    return true
  return !isWordChar(text[offset])
}
