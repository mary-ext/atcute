# @atcute/time-ms

high-precision absolute system time in microseconds (messed up the package name!)

```sh
npm install @atcute/time-ms
```

JavaScript doesn't provide a built-in way to get the current wall-clock time with microsecond
precision. `Date.now()` only goes to milliseconds, and the high-resolution alternatives
(`performance.now()`, `process.hrtime()`) are monotonic clocks — great for measuring durations, but
they don't tell you the actual time.

this package calls the platform's real-time clock directly via native bindings or FFI
(`clock_gettime(CLOCK_REALTIME)` on Unix, `GetSystemTimePreciseAsFileTime` on Windows) to return the
current time as microseconds since the Unix epoch. falls back to `Date.now() * 1000` when native
access is unavailable.

## usage

```ts
import { now, hasNative } from '@atcute/time-ms';

const timestamp = now();
//    ^ 1766739339478426
// returns microseconds since unix epoch

hasNative; // whether the native module is available for the current runtime
```
