# @atcute/cbor

deterministic CBOR codec for AT Protocol.

```sh
npm install @atcute/cbor
```

this library implements DASL's [DRISL][dasl-drisl] format used by AT Protocol for encoding records
and repository data.

[dasl-drisl]: https://dasl.ing/drisl.html

## usage

### encoding

```ts
import { encode } from '@atcute/cbor';

const record = {
	$type: 'app.bsky.feed.post',
	createdAt: '2024-08-18T03:18:24.000Z',
	langs: ['en'],
	text: 'hello world!',
};

const cbor = encode(record);
// -> Uint8Array(90)
```

### decoding

```ts
import { decode } from '@atcute/cbor';

const record = decode(cborBytes);
// -> { $type: 'app.bsky.feed.post', ... }
```

## notes

- `undefined` values are omitted from maps (making it easier to construct objects)
- bytes and CID links use lazy wrappers (`BytesWrapper`, `CidLinkWrapper`) compatible with atproto's
  [lex-json][atproto-data-model] format
- use `toBytes`/`fromBytes` and `toCidLink`/`fromCidLink` to convert between lex-json and raw types
- integers must be within JavaScript's safe integer range (no bigint support)

[atproto-data-model]: https://atproto.com/specs/data-model

based on [`microcbor`](https://github.com/joeltg/microcbor).
