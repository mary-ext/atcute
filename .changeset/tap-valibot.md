---
'@atcute/tap': major
---

migrate from `@badrap/valita` to `valibot`

exported schemas are now valibot schemas.

```ts
import * as v from 'valibot';
import { tapEventWireSchema } from '@atcute/tap';

// before
const result = tapEventWireSchema.try(input);

// after
const result = v.safeParse(tapEventWireSchema, input);
```
