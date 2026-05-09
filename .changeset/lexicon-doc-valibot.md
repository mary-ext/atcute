---
'@atcute/lexicon-doc': major
---

migrate from `@badrap/valita` to `valibot`

exported schemas are now valibot schemas.

```ts
import * as v from 'valibot';
import { lexiconDoc } from '@atcute/lexicon-doc';

// before
const result = lexiconDoc.try(input);

// after
const result = v.safeParse(lexiconDoc, input);
```
