---
'@atcute/client': minor
---

add `retryFetchHandler`, a middleware that retries rate-limited (429) responses with backoff, and
`parseRateLimitHeaders` for reading the server's `RateLimit-*` headers
