# @atcute/car

## 3.1.1

### Patch Changes

- bea36b2: allow `RepoReader.fromStream` to work even if `await using` is not supported by host
  environment.

## 3.1.0

### Minor Changes

- 7324d11: reorganized the exported functions, the new exports should be inline with other utility
  packages from atcute.

  normally this would be considered a breaking change, but because the change doesn't exactly change
  any of the API, I've decided to turn this into a minor change.

  to migrate, you'd need to change your imports from `@atcute/car` to `@atcute/car/v4` subpath.

  ```ts
  // before (v3)
  import { readCar, iterateAtpRepo } from '@atcute/car';

  // read AT Protocol repository exports
  for (const entry of iterateAtpRepo(buffer)) {
  	entry;
  	// ^? RepoEntry { ... }
  }

  // read generic CAR archives
  {
  	const car = readCar(buffer);
  	const header = car.header;

  	for (const entry of car.iterate()) {
  		entry;
  		// ^? CarEntry { ... }
  	}
  }
  ```

  ```ts
  // after (v4)
  import { CarReader, RepoReader } from '@atcute/car/v4';

  // alternatively
  import * as CarReader from '@atcute/car/v4/car-reader';
  import * as RepoReader from '@atcute/car/v4/repo-reader';

  // read AT Protocol repository exports
  {
  	for (const entry of RepoReader.fromUint8Array(buffer)) {
  		entry;
  		// ^? RepoEntry { ... }
  	}
  }

  // read generic CAR archives
  {
  	const car = CarReader.fromUint8Array(buffer);
  	const header = car.header;

  	// use for..of on `car` directly, `.iterate()` is deprecated
  	for (const entry of car) {
  		entry;
  		// ^? CarEntry { ... }
  	}
  }
  ```

- 150edc2: add streaming support for `CarReader` and `RepoReader`, which should allow for efficient
  reading of CAR archives.

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

  please note that the reference PDS implementation does not yet support the Sync v1.1 proposal,
  which would enable more efficient streaming. additionally, some PDSes may send valid but heavily
  out-of-order archives that could impact streaming performance.

- 074a818: adds `RepoReader.repoEntryTransform` and `CarReader.carEntryTransform` functions for
  conveniently piping a readable stream into archive entries.

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

## 3.0.5

### Patch Changes

- @atcute/cbor@2.2.4
- @atcute/cid@2.2.3

## 3.0.4

### Patch Changes

- Updated dependencies [e55a918]
- Updated dependencies [b6ea3f3]
  - @atcute/cid@2.2.2
  - @atcute/cbor@2.2.3

## 3.0.3

### Patch Changes

- Updated dependencies [9ea1e46]
- Updated dependencies [fce1e2c]
- Updated dependencies [745e12b]
  - @atcute/cbor@2.2.2

## 3.0.2

### Patch Changes

- Updated dependencies [3972bbf]
  - @atcute/cbor@2.2.1
  - @atcute/cid@2.2.1

## 3.0.1

### Patch Changes

- ec3f93f: incorrect error description for digest type

## 3.0.0

### Major Changes

- 39da00a: return offsets for CAR headers

  CAR reader will now return start and end ranges for the header. Breaking change as we're no longer
  returning `roots` directly.

- f779d63: store CarEntry into BlockMap

  should make it possible to seek to a certain atproto record at a later time.

### Minor Changes

- 3a5c1fc: yield positions of each CAR entries

  `entryStart`, `entryEnd`, `cidStart`, `cidEnd`, `bytesStart` and `bytesEnd` are now yielded by
  `readCar` function, making it possible to seek to a certain offset at a later time.

### Patch Changes

- 377aadf: skip using varint for CID decode
- 3eb22b9: remove redundant bound checking
- 513beb8: allow empty CIDs
- Updated dependencies [4e678dd]
- Updated dependencies [e56e6df]
- Updated dependencies [fdfd8a8]
- Updated dependencies [73a8c32]
- Updated dependencies [e446f57]
- Updated dependencies [c30d2eb]
  - @atcute/cid@2.2.0
  - @atcute/cbor@2.2.0

## 2.1.0

### Minor Changes

- 1468b42: expose more functions as public API
