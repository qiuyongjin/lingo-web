# Word-Boundary Selection Expansion — Design Spec

## Overview

Add automatic word-boundary expansion to browser text selections in the read view. When a user drags to select text and releases, the selection snaps to the nearest full word boundaries. This is a visual-only enhancement — no data is sent to the native bridge.

## Approach

Use document-level `mouseup`/`touchend` listeners with `Selection.modify()` to expand selections to word boundaries. The existing per-span text node structure (each word in its own `<span>`) means `modify()` naturally expands to the full word within a span.

## Architecture

New file: `src/utils/word-boundary-expand.ts`

Exports:
- `initWordBoundaryExpand(): () => void` — attaches listeners, returns cleanup function

No changes to `src/views/read/index.ts` (composable). No changes to reactive state or native bridge messages.

## Core Logic

### Character classification

`isWordChar(ch)` — matches `[\w'\-]` (letters, digits, underscore, apostrophe, hyphen). Consistent with existing `tokenize()` utility.

### Boundary detection

`isAtWordStart(textNode, offset)` — true when offset is at a word beginning:
- Offset 0 at node start
- Preceding character is not a word character

`isAtWordEnd(textNode, offset)` — true when offset is at a word ending:
- Offset at node end, preceded by a word character
- Current character is not a word character, preceded by a word character

### Selection expansion

`expandSelectionToWord()`:
1. Get current `Selection`, bail if collapsed or no range
2. Save original start/end container + offset
3. If start not at word boundary: `collapse` to start, `modify('extend', 'backward', 'word')`, read new start from `selection.focusNode`/`selection.focusOffset`
4. If end not at word boundary: `collapse` to end, `modify('extend', 'forward', 'word')`, read new end from `selection.focusNode`/`selection.focusOffset`
5. `setBaseAndExtent(newStart, newEnd)` to apply expanded selection

Boundary checks prevent unnecessary `modify()` calls that could accidentally expand to the previous/next word.

### Event listeners

- `mouseup` → `requestAnimationFrame(expandSelectionToWord)`
- `touchend` → `setTimeout(expandSelectionToWord, 50)`

Touch uses a short delay to ensure the browser has finished its native selection rendering.

## Integration

In `src/views/read/index.vue`:
- `onMounted`: call `initWordBoundaryExpand()`, store returned cleanup function
- `onUnmounted`: call cleanup function

No template changes. No reactive state changes.

## Interaction with existing features

- **Single click** (`@click` handler) — creates no browser selection, so `expandSelectionToWord()` sees a collapsed selection and exits immediately. No conflict.
- **Double click** — browser selects the word under cursor. `expandSelectionToWord()` will verify the selection is already at word boundaries (it is) and make no changes. No conflict.
- **Drag to select** — this is the target interaction. Selection expands to word boundaries on release.

## What's out of scope

- No toggle/enable-disable control — always active
- No native bridge messages from this feature
- No Chinese text word-boundary handling (per doc caveat about browser inconsistency)
- No UI indicator showing "selection was expanded"
