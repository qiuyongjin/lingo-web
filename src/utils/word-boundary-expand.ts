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

function expandSelectionToWord(): void {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed)
    return

  const range = selection.getRangeAt(0)
  const origStart = { node: range.startContainer as Text, offset: range.startOffset }
  const origEnd = { node: range.endContainer as Text, offset: range.endOffset }

  let newStart = origStart
  let newEnd = origEnd

  if (!isAtWordStart(origStart.node, origStart.offset)) {
    selection.collapse(origStart.node, origStart.offset)
    selection.modify('extend', 'backward', 'word')
    newStart = { node: selection.focusNode as Text, offset: selection.focusOffset }
  }

  if (!isAtWordEnd(origEnd.node, origEnd.offset)) {
    selection.collapse(origEnd.node, origEnd.offset)
    selection.modify('extend', 'forward', 'word')
    newEnd = { node: selection.focusNode as Text, offset: selection.focusOffset }
  }

  selection.setBaseAndExtent(
    newStart.node,
    newStart.offset,
    newEnd.node,
    newEnd.offset,
  )
}

export function initWordBoundaryExpand(): () => void {
  function onMouseUp() {
    requestAnimationFrame(expandSelectionToWord)
  }

  function onTouchEnd() {
    setTimeout(expandSelectionToWord, 50)
  }

  document.addEventListener('mouseup', onMouseUp)
  document.addEventListener('touchend', onTouchEnd)

  return () => {
    document.removeEventListener('mouseup', onMouseUp)
    document.removeEventListener('touchend', onTouchEnd)
  }
}
