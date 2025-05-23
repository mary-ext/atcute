---
'@atcute/car': minor
---

add streaming support for `CarReader` and `RepoReader`, which should allow for efficient reading of
CAR archives.

```ts
import { CarReader, RepoReader } from '@atcute/car/v4';

// read AT Protocol repository exports
{
	await using repo = RepoReader.fromStream(stream);

	for await (const entry of repo) {
		entry;
		// ^? RepoEntry { collection: 'app.bsky.feed.post', rkey: '3lprcc55bb222', ... }
	}

	repo.missingBlocks;
	//   ^? []
}

// read generic CAR archives
{
	await using car = CarReader.fromStream(stream);

	const roots = await car.roots();

	for await (const entry of car) {
		entry;
		// ^? CarEntry { cid: CidLink {}, bytes: Uint8Array {}, ... }
	}
}
```

please note that the reference PDS implementation does not yet support the Sync v1.1 proposal, which
would enable more efficient streaming. additionally, some PDSes may send valid but heavily
out-of-order archives that could impact streaming performance.
