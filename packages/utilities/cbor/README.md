# @atcute/cbor

DAG-CBOR codec that deals in AT Protocol's HTTP wire format.

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
