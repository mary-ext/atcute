---
'@atcute/util-fetch': major
---

migrate from `@badrap/valita` to `valibot`

`validateJsonWith` now takes a valibot schema (`v.GenericSchema<unknown, T>`); the `mode` option is
gone — encode passthrough into the schema with `v.looseObject` if needed. the exported
`dohJsonTxtResult` schema is also valibot now.

```ts
import * as v from 'valibot';
import { dohJsonTxtResult, validateJsonWith } from '@atcute/util-fetch';

// before
const data = await validateJsonWith(response, schema, { mode: 'passthrough' });
const result = dohJsonTxtResult.try(input);

// after
const data = await validateJsonWith(
	response,
	v.looseObject({
		/* ... */
	}),
);
const result = v.safeParse(dohJsonTxtResult, input);
```
