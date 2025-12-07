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
// -> "3l25zusnsfcta"
```

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
