atcute is a monorepository, a collection of lightweight and high-quality TypeScript libraries for AT
Protocol (the protocol powering Bluesky.)

the packages are organized into categories under `packages/`:

- `clients/`: API client implementations
- `servers/`: XRPC server framework and runtime adapters
- `oauth/`: OAuth implementations
- `lexicons/`: lexicon schema tooling
- `definitions/`: generated validation and type definitions for various AT Protocol services
- `identity/`: DID document and handle resolutions, and did:plc validation
- `utilities/`: DASL codecs, data encoding and atproto primitives
- `misc/`: general-purpose utilities
- `bluesky/`: Bluesky-specific helpers
- `internal/`: non-public development packages

## development notes

### project management

- tools like Node.js, Bun and pnpm are managed by mise
- Node.js can run TypeScript files directly (`node index.ts`, strip types is unflagged)
- check `pnpm view <package>` before adding a new dependency

#### root-level tasks

- format via `pnpm run fmt` (oxfmt)
- lint via `pnpm run lint` (oxlint)

#### package-level tasks

run these inside the package directory, e.g. `cd packages/utilities/cbor; pnpm run ...`

- build via `pnpm run build` (tsgo, includes typechecking)
- test via `pnpm run test` (vitest)

### code writing

#### formatting

- name new files in kebab-case
- indent with tabs (spaces allowed for diagrams in comments)
- use single quotes for strings; reserve template literals for localization (user-facing strings,
  error messages)
- add trailing commas
- order list-like constructs (arrays, object keys, union/intersection members, enum variants,
  imports, etc.) alphabetically. reserve other orderings for cases where order carries meaning —
  semantic precedence, an external spec, or similar. if you encounter an unordered list while
  editing nearby code, reorder it as part of the change; avoid drive-by reorders of unrelated lists

#### control flow and structure

- use braces for control statements, even single-line bodies
- group related code and limit variable scope with bare blocks `{ }`
- use `switch` over `if`/`else if` chains when branching on a single discriminant value
- use `if` over ternaries for complex statements
- delimit sections of larger files with `// #region <name>` and `// #endregion`
- import directly from source; barrel files (index modules that re-export) are out

#### functions and methods

- prefer arrow functions; use method shorthand for object/class methods
- make a parameter optional only when callers genuinely split between passing a value and relying on
  the default. drop unused defaults; promote always-passed params to required; split into a separate
  function when presence/absence flips behavior
- prefer an options object when the function takes a boolean flag (split into two functions if the
  flag selects between distinct behaviors), when two same-typed params could be swapped at the call
  site, or when there are already 2+ optional/defaulted params. positional is fine at any count when
  each param has a distinct type and a clear semantic order

#### types

- write code that satisfies the type system naturally; reach for `as Type` or `as const` only when
  TypeScript errors and no cleaner solution exists

#### mutation

- treat function arguments as immutable; callers expect their inputs to come back unchanged.
  in-place operations like `array.sort()` or `Object.assign(target, ...)` are fine on values the
  function owns — locals, clones, freshly constructed objects — but copy first (`array.toSorted()`,
  `{ ...obj, ...patch }`) before touching anything reachable through a parameter. the exception is a
  function whose documented purpose is to mutate its argument; the name and JSDoc should make that
  intent obvious

### commit workflow

we use conventional commits with these rules:

- accepted types: `feat`, `fix`, `refactor`, `docs`, `chore`
  - feat
    - new additions to public API surface
  - docs
    - Markdown document changes (README.md and similar)
  - chore
    - build/tooling/dependency changes
    - code comment-only changes (incl. JSDoc)
    - test-only changes
    - mass-autofixes from linters and formatters
- optional scope is the package name, e.g. `refactor(package-a):`
- omit the scope when the change does not involve any specific package, or when it touches most/all
  packages
- never list multiple packages in the scope (e.g. `refactor(package-a,package-b)` is forbidden)
- append `!` after the type/scope to mark breaking changes, e.g. `feat(package-a)!:` or `refactor!:`

scope selection when multiple packages are involved:

- if the change primarily involves `package-a` over `package-b`, pick `package-a`
- if changes in `package-a` and `package-b` hinge on `package-c` (even if `package-c` itself was not
  modified), pick `package-c`

granularity — each commit represents one logical change:

- split distinct changes into separate commits rather than bundling them
- pair each changeset with the single commit it describes, so the changeset's git hash maps to the
  right change; do not write one changeset covering multiple commits
- pair each README update with the commit it documents, rather than batching doc updates across
  multiple changes

### documentation

"documentation" here means READMEs, code comments, and commit messages.

- write in lowercase, except for proper nouns, acronyms, and 'I'. public-facing interfaces (web UI)
  are exempt
- comment non-trivial code only, focusing on _why_ rather than _what_
- add JSDoc to new publicly exported functions, methods, classes, fields, and enums:
  - `@param` for parameters (no dashes after param names)
  - `@returns` for return values
  - `@throws` for exceptions when applicable
  - describe _what_, not _why_, unless the rationale affects how callers use the API (e.g. a
    constraint). put other _why_ explanations in regular code comments next to the implementation
  - keep descriptions concise but informative

### agentic coding

- `.research/` in the project root is an ephemeral workspace for experiments, analysis, and planning
  materials, and may contain cloned repositories or other reference materials that inform
  implementation decisions. create if not present. its contents are local to a single working copy
  and may be wiped or absent in any future session, so committed source code (including comments,
  docstrings, commit messages, READMEs, or other docs) must not reference paths under `.research/`
  or rely on its contents existing
- this document is intentionally incomplete; discover everything else by exploring the repo
- explore the code first when unsure about plans, requirements, or existing behavior. ask for
  clarification when exploration leaves the question unresolved
- when debugging, isolate the root cause before attempting fixes: add logging, reproduce the issue,
  narrow down the scope, and confirm the exact source of the problem
- subagent/subtask exploration results may be inaccurate; verify findings as needed
- read files directly rather than using subagents/subtasks as file I/O proxies

### external repository research

use `@oomfware/cgr` to ask questions about external repositories:

```
npx @oomfware/cgr ask [options] <repo>[#branch] <question>

options:
  -m, --model <model>   model to use: opus, sonnet, haiku (default: haiku)
  -d, --deep            clone full history (enables git log/blame/show)
  -w, --with <repo>     additional repository to include, supports #branch (repeatable)
```

useful repositories for development:

- `github.com/bluesky-social/atproto` for AT Protocol reference implementation, lexicons, XRPC
- `github.com/bluesky-social/social-app` for Bluesky app patterns, API usage examples
- `github.com/bluesky-social/feed-generator` for feed generator architecture
- `github.com/bluesky-social/indigo` for Go implementation, alternative design approaches
- `github.com/bluesky-social/ozone` for moderation service patterns
- `github.com/bluesky-social/proposals` for AT Protocol proposals and specifications
- `github.com/bluesky-social/atproto-website` for AT Protocol spec documentation
- `github.com/DavidBuchanan314/atmst` for MST implementation in Python (@atcute/mst is derived from
  this)
- `github.com/DavidBuchanan314/millipds` for practical atmst usage patterns (Python)
- `github.com/darobin/dasl.ing` for DASL specification
- `github.com/did-method-plc/did-method-plc` for DID PLC implementation reference

broad questions work for getting oriented; detailed questions get precise answers. include
file/folder paths when you know them, and reference details from previous answers in follow-ups.

run `npx @oomfware/cgr --help` for more options.
