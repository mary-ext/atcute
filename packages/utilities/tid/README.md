# @atcute/tid

timestamp identifier (TID) codec for AT Protocol.

```sh
npm install @atcute/tid
```

this library implements atproto's TID codec used to generate compact and unique record keys that can
be sorted chronologically.

## usage

### generating TIDs

```ts
import * as TID from '@atcute/tid';

// generate a TID for the current time
const tid = TID.now();
// -> "3l25zusnsfctk"

// create from specific timestamp (microseconds) and clock ID
const custom = TID.create(1724171495793000, 512);
// -> "3l25zusnsfck2"
```

on Node.js, `TID.now()` relies on the system's real-time clock for microsecond precision where
available, falling back to millisecond precision otherwise.

`TID.now()` is not monotonic — TIDs must track wall clock time, so if the clock is adjusted
backward, the generated TIDs will follow. within a single process, rapid successive calls that
observe the same timestamp will increment instead of reusing it to avoid collisions.

### parsing TIDs

```ts
import * as TID from '@atcute/tid';

const { timestamp, clockid } = TID.parse('3l25zusnsfctk');
// timestamp: 1724171495793000 (microseconds since epoch)
// clockid: 816
```

### validating TIDs

```ts
import * as TID from '@atcute/tid';

TID.validate('3l25zusnsfctk'); // true
TID.validate('invalid'); // false
```
