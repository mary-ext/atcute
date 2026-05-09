---
'@atcute/did-plc': major
---

migrate from `@badrap/valita` to `valibot`

exported schemas are now valibot schemas.

```ts
import * as v from 'valibot';
import { operation } from '@atcute/did-plc';

// before
const result = operation.try(input);

// after
const result = v.safeParse(operation, input);
```
