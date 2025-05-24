# @atcute/car

lightweight [DASL CAR (content-addressable archives)][dasl-car] and atproto repository decoder
library for AT Protocol.

[dasl-car]: https://dasl.ing/car.html

## usage

### streaming usage

```ts
import { CarReader, RepoReader } from '@atcute/car/v4';

const stream = new ReadableStream({
	/* ... */
});

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

### streaming usage (for runtimes without `await using` yet)

```ts
const repo = RepoReader.fromStream(stream);

try {
	for await (const entry of repo) {
		entry;
		// ^? RepoEntry
	}
} finally {
	await repo.dispose();
}
```

### sync usage

```ts
const buffer = Uint8Array.from([
	/* ... */
]);

// read AT Protocol repository exports
{
	const repo = RepoReader.fromUint8Array(buffer);

	for (const entry of repo) {
		entry;
		// ^? RepoEntry { collection: 'app.bsky.feed.post', rkey: '3lprcc55bb222', ... }
	}

	repo.missingBlocks;
	//   ^? []
}

// read generic CAR archives
{
	const car = CarReader.fromUint8Array(buffer);

	const roots = car.roots;

	for (const entry of car) {
		entry;
		// ^? CarEntry { cid: CidLink {}, bytes: Uint8Array {}, ... }
	}
}
```
