---
'@atcute/jetstream': minor
---

add an `onError` option that surfaces validation failures (as a valibot `ValiError`) instead of
silently dropping them.

`updateOptions` no longer reconnects when only `cursor` is passed and matches the current cursor.
filter-only updates still go in-band; cursor changes or other option changes still reconnect.
