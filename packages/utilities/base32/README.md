# @atcute/base32

base32 codec library

```ts
import { encode } from '@atcute/base32';

const utf8 = new TextEncoder();
const base32 = encode(utf8.encode('lorem ipsum'));
//    ^? "nrxxezlnebuxa43vnu"
```
