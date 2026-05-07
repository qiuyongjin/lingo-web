const WORD_CHAR_RE = /[\w'\-]/

interface TextPoint {
  node: Text
  offset: number
}

export function isWordChar(ch: string | null | undefined): boolean {
  return !!ch && ch.length === 1 && WORD_CHAR_RE.test(ch)
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

function toTextPoint(node: Node | null, offset: number): TextPoint | null {
  if (!node || node.nodeType !== Node.TEXT_NODE)
    return null
  return { node: node as Text, offset }
}

function expandSelectionToWord(): void {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed)
    return

  const range = selection.getRangeAt(0)
  const origStart = toTextPoint(range.startContainer, range.startOffset)
  const origEnd = toTextPoint(range.endContainer, range.endOffset)
  if (!origStart || !origEnd)
    return

  let newStart = origStart
  let newEnd = origEnd

  if (!isAtWordStart(origStart.node, origStart.offset)) {
    selection.collapse(origStart.node, origStart.offset)
    selection.modify('extend', 'backward', 'word')
    const expanded = toTextPoint(selection.focusNode, selection.focusOffset)
    if (expanded)
      newStart = expanded
  }

  if (!isAtWordEnd(origEnd.node, origEnd.offset)) {
    selection.collapse(origEnd.node, origEnd.offset)
    selection.modify('extend', 'forward', 'word')
    const expanded = toTextPoint(selection.focusNode, selection.focusOffset)
    if (expanded)
      newEnd = expanded
  }

  selection.setBaseAndExtent(
    newStart.node,
    newStart.offset,
    newEnd.node,
    newEnd.offset,
  )
}

export function initWordBoundaryExpand(): () => void {
  let touchTimer: ReturnType<typeof setTimeout> | null = null

  function onMouseUp() {
    if (touchTimer) {
      clearTimeout(touchTimer)
      touchTimer = null
      return
    }
    requestAnimationFrame(expandSelectionToWord)
  }

  function onTouchEnd() {
    touchTimer = setTimeout(() => {
      expandSelectionToWord()
      touchTimer = null
    }, 50)
  }

  document.addEventListener('mouseup', onMouseUp)
  document.addEventListener('touchend', onTouchEnd)

  return () => {
    document.removeEventListener('mouseup', onMouseUp)
    document.removeEventListener('touchend', onTouchEnd)
    if (touchTimer) {
      clearTimeout(touchTimer)
      touchTimer = null
    }
  }
}
