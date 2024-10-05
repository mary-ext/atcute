# @atcute/cbor

DAG-CBOR codec library, focused on dealing with AT Protocol's HTTP wire format.

- Only JSON types are recognized and almost nothing else, this means:
  - No `Map` objects, it will always be plain objects with string keys
  - No `undefined` values, it will be skipped or will throw an error
- No tagged value support other than CID, which gets converted to a cid-link interface
- Same goes for byte arrays, gets converted to a byte interface

```ts
import { encode } from '@atcute/cbor';

const record = {
	$type: 'app.bsky.feed.post',
	createdAt: '2024-08-18T03:18:24.000Z',
	langs: ['en'],
	text: 'hello world!',
};

const cbor = encode(record);
//    ^? Uint8Array(90) [ ... ]
```

Implementation based on the excellent [`microcbor` library](https://github.com/joeltg/microcbor).
