# @atcute/cid

content identifier (CID) codec for AT Protocol.

```sh
npm install @atcute/cid
```

this library implements DASL's [CID][dasl-cid] format used by AT Protocol to address resources by
their contents.

[dasl-cid]: https://dasl.ing/cid.html

## usage

```ts
import * as CID from '@atcute/cid';
import { toCidLink, fromCidLink, isCidLink } from '@atcute/cid';

// create a CID by hashing data (0x71 for DAG-CBOR, 0x55 for raw)
const cid = await CID.create(0x71, cborBytes);
// -> { version: 1, codec: 113, digest: { codec: 18, contents: Uint8Array(32) }, bytes: Uint8Array(36) }

// parse from base32 string
const parsed = CID.fromString('bafyreihffx5a2e7k5uwrmmgofbvzujc5cmw5h4espouwuxt3liqoflx3ee');

// parse from binary (with 0x00 prefix) or raw CID bytes
const fromBin = CID.fromBinary(binaryBytes);
const fromRaw = CID.decode(cidBytes);

// serialize to base32 string or binary format
CID.toString(cid); // -> "bafyreihffx5a2e7k5uwrmmgofbvzujc5cmw5h4espouwuxt3liqoflx3ee"
CID.toBinary(cid); // -> Uint8Array(37) with 0x00 prefix

// compare two CIDs
CID.equals(cidA, cidB); // -> true if identical

// convert to CidLink for JSON serialization (atproto data model)
const link = toCidLink(cid); // -> { $link: "bafyrei..." }
const back = fromCidLink(link);

// type guard for CidLink
if (isCidLink(value)) {
	console.log(value.$link);
}
```
