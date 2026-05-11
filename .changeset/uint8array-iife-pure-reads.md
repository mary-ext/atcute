---
'@atcute/uint8array': patch
---

silence Rollup `/*#__PURE__*/` warnings

Rollup-based bundlers (Vite, Astro SSR, etc.) used to warn that the package's `/*#__PURE__*/`
annotations sat on plain member reads — a position Rollup ignores. The annotations now apply to IIFE
calls, which Rollup recognizes.
