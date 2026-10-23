# @atcute/star

streaming archive (STAR) codec for AT Protocol.

```sh
npm install @atcute/star
```

this library implements [STAR-lite v1][star-v1] format (revision `eb0c078`, 2026-10-20) used by AT
Protocol to store and transfer private repository data.

[star-v1]: https://tangled.org/microcosm.blue/star/tree/main/v1-star

## usage

### streaming usage

```ts
import { fromStream } from '@atcute/star';

const stream = new ReadableStream({/* ... */});

await using star = fromStream(stream, { maxValueLength: 1024 * 1024 });

const meta = await star.meta();
// ^? StarMeta { $type: 'atproto-space-repo', ... }

for await (const entry of star) {
	entry;
	// ^? StarEntry { key: Uint8Array {}, value: Uint8Array {}, ... }
}
```

### streaming usage (for runtimes without `await using` yet)

```ts
const star = fromStream(stream);

try {
	for await (const entry of star) {
		entry;
		// ^? StarEntry { ... }
	}
} finally {
	await star.dispose();
}
```

### sync usage

```ts
import { fromUint8Array } from '@atcute/star';

const buffer = Uint8Array.from([/* ... */]);

const star = fromUint8Array(buffer);

const meta = star.meta;

for (const entry of star) {
	entry;
	// ^? StarEntry { key: Uint8Array {}, value: Uint8Array {}, ... }
}
```

### writing

```ts
import { writeStarStream } from '@atcute/star';
import { encodeUtf8 } from '@atcute/uint8array';

const pairs = async function* () {
	yield { key: encodeUtf8('app.bsky.feed.post/3kabc'), value: recordBytes };
};

for await (const chunk of writeStarStream({ $type: 'atproto-space-repo', ...commit }, pairs())) {
	stream.write(chunk);
}
```
