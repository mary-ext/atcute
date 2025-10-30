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

### tool management

- tools like Node.js, Bun and pnpm are managed by mise, to run them, use `mise exec -- pnpm ...`

### code writing

- new files should be in kebab-case
- use tabs for indentation, spaces allowed for diagrams in comments
- use single quotes and add trailing commas
- prefer arrow functions
- write blocks for control statements

### documentation

- documentations include README, code comments, commit messages, changesets
- any writing should be in lowercase, except for proper nouns, acronyms and 'I'
- keep comments focused on explaining _why_ rather than _what_
- write comments and JSDoc in lowercase (except proper nouns, acronyms, and 'I')
- keep JSDoc concise: no dashes after @param names
- add JSDoc comments to all new exported functions, methods, classes, fields, and enums

### testing

- Vitest is the standard test runner, though some packages may still be using bun test
- run them via `pnpm run --filter <package> test ...`

### commits

- don't do any commits, but do stop if you think the user should make a git commit/changeset now
- suggest commit messages, the commit messages use Conventional Commit, and is written like
  `[type]([package?]): [message]` where package may be optional.
- suggest changesets for any notable changes, with a brief summary of the change and an optional
  description of why specifically the change was made with example code demonstrating it

### misc

- Claude Code's Bash tool persists directory changes (`cd`) across calls
