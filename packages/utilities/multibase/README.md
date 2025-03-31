# @atcute/multibase

provides various base codecs used in atproto ecosystem

- base16
- base32
- base58
- base64 (including base64url and padded variants)

```ts
import { toBase32 } from '@atcute/multibase';

const utf8 = new TextEncoder();
const base32 = toBase32(utf8.encode('lorem ipsum'));
//    ^? "nrxxezlnebuxa43vnu"
```
