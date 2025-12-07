# @atcute/varint

protobuf-style LEB128 varint codec.

```sh
npm install @atcute/varint
```

```ts
import { encode, decode, encodingLength } from '@atcute/varint';

// encoding
const encoded: number[] = [];
const bytesWritten = encode(420, encoded);
// -> encoded: [164, 3]
// -> bytesWritten: 2

// decoding
const [num, bytesRead] = decode(encoded);
// -> num: 420
// -> bytesRead: 2

// check encoding length beforehand
encodingLength(420); // -> 2
encodingLength(16383); // -> 2
encodingLength(16384); // -> 3
```
