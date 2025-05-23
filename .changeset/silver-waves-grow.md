---
'@atcute/car': minor
---

reorganized the exported functions, the new exports should be inline with other utility packages
from atcute.

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
