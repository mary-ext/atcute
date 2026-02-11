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
- check `pnpm view <package>` before adding a new dependency

#### root-level tasks

- format via `pnpm run fmt` (oxfmt)
- lint via `pnpm run lint` (oxlint)

#### package-level tasks

run these inside the package directory, e.g. `cd packages/utilities/cbor; pnpm run ...`

- build via `pnpm run build` (tsgo, includes typechecking)
- test via `pnpm run test` (vitest)

### code writing

- new files should be in kebab-case
- use tabs for indentation, spaces allowed for diagrams in comments
- use single quotes and add trailing commas
- prefer arrow functions, but use regular methods in classes unless arrow functions are necessary
  (e.g., when passing the method as a callback that needs `this` binding)
- use braces for control statements, even single-line bodies
- use bare blocks `{ }` to group related code and limit variable scope
- use template literals for user-facing strings and error messages
- use `// #region <name>` and `// #endregion` to denote regions when a file needs to contain a lot
  of code

### documentation

- documentations include README, code comments, commit messages, changesets
- any writing should be in lowercase, except for proper nouns, acronyms and 'I'
- only comment non-trivial code, focusing on _why_ rather than _what_
- write comments and JSDoc in lowercase (except proper nouns, acronyms, and 'I')
- add JSDoc comments to new publicly exported functions, methods, classes, fields, and enums
- JSDoc should include proper annotations:
  - use `@param` for parameters (no dashes after param names)
  - use `@returns` for return values
  - use `@throws` for exceptions when applicable
  - keep descriptions concise but informative

### testing

- Vitest is the standard test runner, though some packages may still be using bun test
- run tests via `pnpm run test`

### working style

- `.research/` directory in the project root serves as a workspace for temporary experiments,
  analysis, and planning materials. create if not present (it's gitignored). this directory may
  contain cloned repositories or other reference materials that can help inform implementation
  decisions
- this document is intentionally incomplete; discover everything else in the repo
- don't make assumptions or speculate about code, plans, or requirements without exploring first;
  pause and ask for clarification when you're still unsure after looking into it
- in plan mode, present the plan for review before exiting to allow for feedback or follow-up
  questions
- when debugging problems, isolate the root cause first before attempting fixes: add logging,
  reproduce the issue, narrow down the scope, and confirm the exact source of the problem

### Claude Code-specific

- Task tool (subagents for exploration, planning, etc.) may not always be accurate; verify subagent
  findings when needed

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
