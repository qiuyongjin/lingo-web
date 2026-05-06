# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
pnpm dev          # Start dev server with hot reload
pnpm build        # Type-check, compile and minify for production
pnpm preview      # Preview production build locally
pnpm test:unit    # Run unit tests with Vitest
pnpm test:unit -- src/__tests__/tokenize.spec.ts  # Run single test file
pnpm lint         # Lint with ESLint
pnpm lint:fix     # Lint and auto-fix
```

## Architecture

**Framework**: Vue 3 + Vite + TypeScript + Pinia

**Entry point**: `src/main.ts` mounts to `#app` in `index.html`

**Routing**: Single route `/` renders `src/views/read/index.vue`

**Native Bridge**: `window.nativeBridge.send()` communicates with iOS. Always check `if (window.nativeBridge)` before calling.

**Key directories**:
- `src/views/read/` — Main reading interface (click-to-highlight, word selection, playback)
- `src/utils/` — Text tokenization, paragraph splitting
- `src/types/` — TypeScript interfaces (ClickData, Target, ExtractTitle)
- `src/stores/` — Pinia stores

**Global types**: `src/global.d.ts` augments `Window` interface with `nativeBridge` property. `env.d.ts` declares Vite env variables.

**Build**: `vite-plugin-singlefile` bundles everything into a single HTML file at `dist/`.

**Testing**: Vitest with jsdom environment. Test files live in `src/__tests__/`.