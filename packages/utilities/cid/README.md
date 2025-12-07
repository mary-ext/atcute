# @atcute/cid

content identifier (CID) codec for AT Protocol.

```sh
npm install @atcute/cid
```

this library implements DASL's [CID][dasl-cid] format used by AT Protocol to address resources by
their contents.

[dasl-cid]: https://dasl.ing/cid.html

## usage

### creating CIDs

```ts
import * as CID from '@atcute/cid';

// create a CID from DAG-CBOR data
const cid = await CID.create(0x71, cborBytes);
// -> { version: 1, codec: 113, digest: { ... }, bytes: Uint8Array(36) }

// create from raw data
const rawCid = await CID.create(0x55, rawBytes);

// create an empty CID (zero-length digest)
const empty = CID.createEmpty(0x71);
```

### parsing CIDs

```ts
import * as CID from '@atcute/cid';

// parse from base32 string
const cid = CID.fromString('bafyreihffx5a2e7k5uwrmmgofbvzujc5cmw5h4espouwuxt3liqoflx3ee');

// parse from binary (with 0x00 prefix)
const cid = CID.fromBinary(bytes);

// parse from raw CID bytes
const cid = CID.decode(cidBytes);
```

### serializing CIDs

```ts
import * as CID from '@atcute/cid';

// to base32 string
CID.toString(cid);
// -> "bafyreihffx5a2e7k5uwrmmgofbvzujc5cmw5h4espouwuxt3liqoflx3ee"

// to binary (with 0x00 prefix)
CID.toBinary(cid);
// -> Uint8Array(37)
```

### comparing CIDs

```ts
import * as CID from '@atcute/cid';

CID.equals(cidA, cidB); // true if same content hash
```

### CidLink wrapper

for JSON serialization compatible with atproto's data model:

```ts
import { toCidLink, fromCidLink, isCidLink } from '@atcute/cid';

// convert Cid to CidLink (has $link property)
const link = toCidLink(cid);
// -> { $link: "bafyrei..." }

// convert back to Cid
const cid = fromCidLink(link);

// type guard
if (isCidLink(value)) {
	console.log(value.$link);
}
```
