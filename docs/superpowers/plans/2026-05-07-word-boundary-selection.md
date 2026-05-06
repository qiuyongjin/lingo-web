# Word-Boundary Selection Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add automatic word-boundary expansion to browser text selections in the read view so that drag-to-select snaps to full word boundaries on mouseup/touchend.

**Architecture:** New utility module `src/utils/word-boundary-expand.ts` with `isWordChar`, `isAtWordStart`, `isAtWordEnd`, and `expandSelectionToWord` functions, exposed via `initWordBoundaryExpand()` which attaches event listeners and returns a cleanup function. The read view (`src/views/read/index.vue`) initializes it in `onMounted` and cleans up in `onUnmounted`.

**Tech Stack:** Vue 3, TypeScript, Vitest with jsdom, browser Selection API

---

## File Structure

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/utils/word-boundary-expand.ts` | Core word-boundary logic and event listener setup |
| Create | `src/__tests__/word-boundary-expand.spec.ts` | Unit tests for boundary detection and expansion |
| Modify | `src/views/read/index.vue` | Initialize and cleanup word-boundary expansion |

---

### Task 1: isWordChar and isAtWordStart/isAtWordEnd

**Files:**
- Create: `src/utils/word-boundary-expand.ts`
- Create: `src/__tests__/word-boundary-expand.spec.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// src/__tests__/word-boundary-expand.spec.ts
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
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test:unit -- src/__tests__/word-boundary-expand.spec.ts`
Expected: FAIL — module does not exist

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/utils/word-boundary-expand.ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test:unit -- src/__tests__/word-boundary-expand.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/word-boundary-expand.ts src/__tests__/word-boundary-expand.spec.ts
git commit -m "feat: add isWordChar, isAtWordStart, isAtWordEnd for word-boundary detection"
```

---

### Task 2: expandSelectionToWord and initWordBoundaryExpand

**Files:**
- Modify: `src/utils/word-boundary-expand.ts`
- Modify: `src/__tests__/word-boundary-expand.spec.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// Append to src/__tests__/word-boundary-expand.spec.ts
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { initWordBoundaryExpand } from '@/utils/word-boundary-expand'

describe('expandSelectionToWord', () => {
  it('does nothing when selection is collapsed', () => {
    // jsdom doesn't fully support Selection.modify, so we test the guard clause
    const selection = window.getSelection()
    if (!selection)
      return
    selection.removeAllRanges()
    const range = document.createRange()
    range.collapse(true)
    selection.addRange(range)
    // Should not throw
    expect(() => {
      document.dispatchEvent(new MouseEvent('mouseup'))
    }).not.toThrow()
  })

  it('initWordBoundaryExpand returns a cleanup function', () => {
    const cleanup = initWordBoundaryExpand()
    expect(typeof cleanup).toBe('function')
    cleanup()
  })
})

describe('initWordBoundaryExpand event listeners', () => {
  let cleanup: () => void

  beforeEach(() => {
    cleanup = initWordBoundaryExpand()
  })

  afterEach(() => {
    cleanup()
  })

  it('attaches mouseup listener that calls expandSelectionToWord', () => {
    const spy = vi.spyOn(window, 'requestAnimationFrame')
    document.dispatchEvent(new MouseEvent('mouseup'))
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('cleanup removes event listeners', () => {
    cleanup()
    const spy = vi.spyOn(window, 'requestAnimationFrame')
    document.dispatchEvent(new MouseEvent('mouseup'))
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test:unit -- src/__tests__/word-boundary-expand.spec.ts`
Expected: FAIL — `initWordBoundaryExpand` is not exported

- [ ] **Step 3: Write minimal implementation**

Append to `src/utils/word-boundary-expand.ts`:

```typescript
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test:unit -- src/__tests__/word-boundary-expand.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/word-boundary-expand.ts src/__tests__/word-boundary-expand.spec.ts
git commit -m "feat: add expandSelectionToWord and initWordBoundaryExpand"
```

---

### Task 3: Integrate into read view

**Files:**
- Modify: `src/views/read/index.vue`

- [ ] **Step 1: Add import and lifecycle hooks**

In `src/views/read/index.vue`, add the import at the top of the `<script setup>` block and initialize in `onMounted`/`onUnmounted`:

Replace the existing `onMounted` block (lines 84-90):

```typescript
// Before (existing):
onMounted(() => {
//   sentence.value = `Test
// We had a picnic on the bank of the river.
// He broke the record in the 100-meter race.
// The news broke yesterday.`
  // updateHeight(100)
})
```

With:

```typescript
import { initWordBoundaryExpand } from '@/utils/word-boundary-expand'

let cleanupExpand: (() => void) | null = null

onMounted(() => {
  cleanupExpand = initWordBoundaryExpand()
})

onUnmounted(() => {
  cleanupExpand?.()
  cleanupExpand = null
})
```

Note: The `onUnmounted` import must be added to the existing import from `vue`. Change line 3 from:

```typescript
import { onMounted, ref } from 'vue'
```

to:

```typescript
import { onMounted, onUnmounted, ref } from 'vue'
```

- [ ] **Step 2: Run linter**

Run: `pnpm lint`
Expected: No errors

- [ ] **Step 3: Verify dev server starts**

Run: `pnpm dev`
Expected: Dev server starts without errors

- [ ] **Step 4: Commit**

```bash
git add src/views/read/index.vue
git commit -m "feat: integrate word-boundary selection expansion into read view"
```

---

### Task 4: Manual browser verification

- [ ] **Step 1: Start dev server and test in browser**

Run: `pnpm dev`

Open the page in a browser. Verify:

1. **Drag partial word**: Drag-select "progr" from "programming" → release → selection should expand to "programming"
2. **Single click**: Click a word → no selection expansion, existing click behavior unchanged
3. **Double click**: Double-click a word → word selected, no unexpected expansion
4. **Drag across multiple words**: Drag across partial words at start and end → both ends snap to word boundaries
5. **Punctuation**: Drag into a punctuation span → should not expand the selection into adjacent punctuation

- [ ] **Step 2: Run full test suite**

Run: `pnpm test:unit`
Expected: All tests pass
