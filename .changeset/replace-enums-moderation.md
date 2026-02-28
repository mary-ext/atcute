---
'@atcute/bluesky-moderation': major
---

replace enums with plain objects

exported enums are now `as const` objects with companion type aliases. enum member values are
unchanged, so runtime behavior is identical. the main type-level difference is that string enums are
no longer nominal — raw string literals are now assignable where enum types were previously
required.
