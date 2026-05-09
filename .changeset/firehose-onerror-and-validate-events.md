---
'@atcute/firehose': major
---

rename `validateMessages` to `validateEvents`. `onError` is now `(err: unknown) => void`: atproto
error frames are surfaced as the new `FirehoseError`, and validation failures are surfaced as the
`ValidationError` from `@atcute/lexicons` instead of being silently dropped.
