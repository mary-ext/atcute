---
'@atcute/identity': major
'@atcute/identity-resolver': major
---

migrate from `@badrap/valita` to `valibot`

exported schemas are now valibot schemas.

```ts
import * as v from 'valibot';
import { defs } from '@atcute/identity';

// before
const result = defs.didDocument.try(input);

// after
const result = v.safeParse(defs.didDocument, input);
```
