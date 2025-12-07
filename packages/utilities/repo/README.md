# @atcute/repo

read AT Protocol repository exports.

```sh
npm install @atcute/repo
```

AT Protocol stores user data in repositories - Merkle tree structures containing records organized
by collection. this package reads repository CAR exports (from `com.atproto.sync.getRepo` or
account exports) and iterates over the records.

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

### verifying records

verify a record's inclusion in a repository with optional signature verification:

```ts
import { verifyRecord } from '@atcute/repo';

const { cid, record } = await verifyRecord({
	collection: 'app.bsky.feed.post',
	rkey: '3lprcc55bb222',
	carBytes: carBytes,
	// optional: verify commit signature
	publicKey: key,
	// optional: verify DID matches
	did: 'did:plc:...',
});
```

### transform streams

for piping repository data through a transform:

```ts
import { repoEntryTransform } from '@atcute/repo';

const { readable, writable } = repoEntryTransform();

// pipe CAR data in, get RepoEntry objects out
response.body.pipeTo(writable);

for await (const entry of readable) {
	console.log(entry.collection, entry.rkey);
}
```
