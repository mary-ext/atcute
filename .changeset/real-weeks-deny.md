---
'@atcute/lex-cli': minor
---

use kempt as the default code formatter

kempt is a small code formatter that only formats whitespaces and leaves everything else exactly as
written. making it a good option for generated code, where the only concern is consistent and
auditable code.

if prettier is still preferred, use you can configure the `formatter` option to use Prettier.

```ts
import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	formatter: { type: 'prettier' },
});
```
