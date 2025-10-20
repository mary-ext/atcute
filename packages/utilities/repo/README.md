# @atcute/repo

read AT Protocol repository exports

## usage

### streaming usage

```ts
import { fromStream } from '@atcute/repo';

const stream = new ReadableStream({
	/* ... */
});

await using repo = fromStream(stream);

for await (const entry of repo) {
	entry;
	// ^? RepoEntry { collection: 'app.bsky.feed.post', rkey: '3lprcc55bb222', ... }
}

repo.missingBlocks;
//   ^? []
```

### streaming usage (for runtimes without `await using` yet)

```ts
const repo = fromStream(stream);

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

const repo = fromUint8Array(buffer);

for (const entry of repo) {
	entry;
	// ^? RepoEntry { collection: 'app.bsky.feed.post', rkey: '3lprcc55bb222', ... }
}

repo.missingBlocks;
//   ^? []
```
