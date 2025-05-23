---
'@atcute/car': minor
---

adds `RepoReader.repoEntryTransform` and `CarReader.carEntryTransform` functions for conveniently
piping a readable stream into archive entries.

```ts
import { RepoReader } from '@atcute/car/v4';

const response = await fetch('https://example.com/xrpc/com.atproto.sync.getRepo?did=...');

const entries = response.body!.pipeThrough(RepoReader.repoEntryTransform());
for await (const entry of entries) {
	entry;
	// ^? RepoEntry { ... }
}
```

thanks [@nperez0111](https://github.com/nperez0111) for this contribution!
