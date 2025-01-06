# @atcute/cbor

lightweight [DASL dCBOR42 (deterministic CBOR with tag 42)][dasl-dcbor42] codec library for AT
Protocol.

the specific profile being implemented is [IPLD DAG-CBOR][ipld-dag-cbor], with some additional notes
to keep in mind:

- `undefined` types are still forbidden, except for when they are in a `map` type, where fields will
  be omitted instead, which makes it easier to construct objects to then pass to the encoder.
- `byte` and `link` types are represented by atproto's [lex-json][atproto-data-model] interfaces,
  but because these involve string codec and parsing, they are done lazily by `BytesWrapper` and
  `CidLinkWrapper` instances.
  - use `fromBytes` and `fromCidLink` to convert them to Uint8Array or CID interface respectively,
    without hitting the string conversion path.
  - use `toBytes` and `toCidLink` for the other direction.
- integers can't exceed JavaScript's safe integer range, no bigint conversions will occur as they
  will be thrown instead if encountered.

[atproto-data-model]: https://atproto.com/specs/data-model
[dasl-dcbor42]: https://dasl.ing/dcbor42.html
[ipld-dag-cbor]: https://ipld.io/specs/codecs/dag-cbor/spec

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
