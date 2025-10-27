atcute is a monorepository, a collection of lightweight and high-quality TypeScript libraries for AT
Protocol (the protocol powering Bluesky.)

the packages are organized into categories under `packages/`:

- `clients/`: API client implementations
- `servers/`: XRPC server framework and runtime adapters
- `oauth/`: OAuth implementations
- `lexicons/`: lexicon schema tooling
- `definitions/`: generated schema definitions for various AT Protocol services
- `identity/`: DID document and handle resolutions, and did:plc validation
- `utilities/`: DASL codecs, data encoding and atproto primitives
- `misc/`: general-purpose utilities
- `bluesky/`: Bluesky-specific helpers
- `internal/`: non-public development packages

## development notes

- tools like Node.js, Bun and pnpm are managed by mise, to run them, use `mise exec -- pnpm ...`
- the Bash tool maintains a persistent shell session; `cd` changes persist across calls
- keep comments focused on explaining _why_ rather than _what_
- write comments and JSDoc in lowercase (except proper nouns, acronyms, and 'I')
- keep JSDoc concise: no dashes after @param names, omit articles like "a"/"the" when possible
- add JSDoc comments to all new exported functions, methods, classes, fields, and enums
