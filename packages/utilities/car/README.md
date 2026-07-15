# @atcute/car

content-addressable archive (CAR) codec for AT Protocol.

```sh
npm install @atcute/car
```

this library implements DASL's [CAR][dasl-car] format used by AT Protocol to store and transfer
repository data.

[dasl-car]: https://dasl.ing/car.html

## usage

### streaming usage

```ts
import { fromStream } from '@atcute/car';

const stream = new ReadableStream({/* ... */});

await using car = fromStream(stream);

const roots = await car.roots();

for await (const entry of car) {
	entry;
	// ^? CarEntry { cid: CidLink {}, bytes: Uint8Array {}, ... }
}
```

### streaming usage (for runtimes without `await using` yet)

```ts
const car = fromStream(stream);

try {
	for await (const entry of car) {
		entry;
		// ^? CarEntry { ... }
	}
} finally {
	await car.dispose();
}
```

### sync usage

```ts
const buffer = Uint8Array.from([/* ... */]);

// read generic CAR archives
const car = fromUint8Array(buffer);

const roots = car.roots;

for (const entry of car) {
	entry;
	// ^? CarEntry { cid: CidLink {}, bytes: Uint8Array {}, ... }
}
```

### writing

```ts
import { writeCarStream } from '@atcute/car';

const blocks = async function* () {
	yield { cid: commitCid.bytes, data: commitBytes };
	yield { cid: nodeCid.bytes, data: nodeBytes };
};

for await (const chunk of writeCarStream([rootCid], blocks())) {
	stream.write(chunk);
}
```
