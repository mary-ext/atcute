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

- manage tools like Node.js, Bun, and pnpm with mise
- Node.js can run TypeScript files directly (`node index.ts`, strip types is unflagged)
- check `pnpm view <package>` before adding a new dependency

#### root-level tasks

- format via `pnpm run fmt` (oxfmt)
- lint via `pnpm run lint` (oxlint)

#### package-level tasks

run these inside the package directory, e.g. `cd packages/utilities/cbor; pnpm run ...`

- build via `pnpm run build` (tsc)
- test via `pnpm run test` (vitest)

### code writing

#### formatting

- name new files in kebab-case
- indent with tabs (spaces allowed for diagrams in comments)
- use single quotes for strings; reserve template literals for localization (user-facing strings,
  error messages)
- add trailing commas
- order type/object fields in the way you'd introduce a thing to someone, typically this would be:
  discriminant → identifiers → names → description → classification/status → data/values →
  metadata/references → methods

#### control flow and structure

- use braces for control statements, even single-line bodies
- group related code and limit variable scope with bare blocks `{ }`
- use `switch` over `if`/`else if` chains when branching on a single discriminant value
- use `if` over ternaries for complex statements
- delimit sections of larger files with `// #region <name>` and `// #endregion`
- prefer direct imports over barrel modules unless their tree-shaking behavior is understood and
  their impact on bundle size is negligible or absent

#### functions and methods

- prefer arrow functions; use method shorthand for object/class methods
- make parameters optional only when callers both pass and omit them. remove unused defaults;
  require always-passed parameters. use separate functions when presence/absence selects distinct
  behavior
- prefer an options object for boolean flags, confusable same-typed parameters, or 2+
  optional/defaulted parameters. split boolean-selected behaviors into separate functions.
  otherwise, positional parameters are fine when their types and order are clear

#### types

- use `as Type` or `as const` only to resolve TypeScript errors when no cleaner solution exists

#### mutation

- do not mutate arguments or values reachable through them; copy first. mutation is fine for owned
  values (locals, clones, new objects), or when the function's name and JSDoc explicitly promise it

### commit workflow

- one logical change per commit; choose the type for the whole change, not each file category
- accepted types:
  - `feat`: additions to the public API
  - `fix`: bug fixes
  - `refactor`: restructuring without behavior changes
  - `docs`: Markdown documentation
  - `chore`: build, tooling, dependencies, mass-autofixes, or standalone tests/comments/JSDoc
- ship related tests and comments with their feature or fix
- mark breaking changes with `!`: `feat!: ...`

for scoping:

- optional scope is the package name, e.g. `refactor(package-a):`
- omit the scope when the change does not involve any specific package, or when it touches most/all
  packages
- never list multiple packages in the scope (e.g. `refactor(package-a,package-b)` is forbidden)
- append `!` after the type/scope to mark breaking changes, e.g. `feat(package-a)!:` or `refactor!:`

scope selection when multiple packages are involved:

- if the change primarily involves `package-a` over `package-b`, pick `package-a`
- if changes in `package-a` and `package-b` hinge on `package-c` (even if `package-c` itself was not
  modified), pick `package-c`

### documentation

- use lowercase in READMEs, comments, JSDoc, and commit messages, except for proper nouns, acronyms,
  and 'I'. public-facing interfaces (web UI) are exempt
- omit boilerplate and obvious restatements in documentation and user-facing messages. keep shared
  explanations in one place; link instead of repeating
- comment only non-trivial code; explain why
- add JSDoc to new publicly exported functions, methods, classes, fields, and enums:
  - `@param` for parameters (no dashes after param names)
  - `@returns` for return values
  - `@throws` for exceptions when applicable
  - describe the caller-facing contract, including preconditions. put implementation details and
    rationale in regular comments unless they constrain callers

### agentic coding

- use root `.research/` for experiments, analysis, plans, and reference materials like cloned Git
  repositories; create it if absent. it is local and disposable: committed code, documentation, and
  commit messages must not reference paths inside it or depend on its contents
