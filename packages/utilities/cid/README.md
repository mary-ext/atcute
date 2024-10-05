# @atcute/cid

CIDv1 codec library.

```ts
const parsed = parse('bafyreihffx5a2e7k5uwrmmgofbvzujc5cmw5h4espouwuxt3liqoflx3ee');
//    ^? { version: 1, code: 113, digest: { ... }, bytes: Uint8Array(36) }

// Creating a CID containing CBOR data
const cid = await create(0x71, buffer);

// Serializing CID into string
format(cid); // -> bafyrei...
```
