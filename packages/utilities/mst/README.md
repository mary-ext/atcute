# @atcute/mst

atproto MST (Merkle Search Tree) manipulation utilities

MST is a key-value tree structure used in atproto repositories to store collections of records. keys
are sorted lexicographically and organized into nodes based on the leading zero bits in their
SHA-256 hash. each node uses prefix compression for efficient storage and has a CID (content
identifier) for content-addressable access.

see the [atproto repository specification](https://atproto.com/specs/repository) for more details.
