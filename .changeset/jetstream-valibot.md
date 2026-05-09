---
'@atcute/jetstream': major
---

migrate from `@badrap/valita` to `valibot`

exported event schemas are now valibot schemas.

```ts
import * as v from 'valibot';
import { commitEventSchema } from '@atcute/jetstream';

// before
const result = commitEventSchema.try(input);

// after
const result = v.safeParse(commitEventSchema, input);
```
