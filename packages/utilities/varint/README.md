# @atcute/varint

codec for Protobuf-style varint bytes

```ts
import { encode } from '@atcute/varint';

const encoded: number[] = [];
const encodedLength = encode(420, encoded);

console.log(encoded, encodedLength);
// -> encoded: Array(2) [164, 3]
// -> encodedLength: 2
```
