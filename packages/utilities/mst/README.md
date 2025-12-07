# @atcute/mst

Merkle Search Tree (MST) manipulation utilities for AT Protocol.

```sh
npm install @atcute/mst
```

MST is a key-value tree structure used in atproto repositories to store collections of records. keys
are sorted lexicographically and organized into nodes based on the leading zero bits in their
SHA-256 hash. each node uses prefix compression for efficient storage and has a CID (content
identifier) for content-addressable access.

this is a low-level utility for building tools that need to work directly with repository
structures. for reading repository exports, see `@atcute/repo` instead.

see the [atproto repository specification](https://atproto.com/specs/repository) for more details.
