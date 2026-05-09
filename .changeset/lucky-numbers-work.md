---
'@atcute/lexicons': major
---

make at-uri parsing throw

`parseResourceUri` and `parseCanonicalResourceUri` now return the parsed value directly and throw
`SyntaxError` on invalid input, instead of returning a `Result<T, string>`.

```ts
// before
const result = parseResourceUri(input);
if (result.ok) {
	console.log(result.value.repo);
}

// after
try {
	const parsed = parseResourceUri(input);
	console.log(parsed.repo);
} catch (err) {
	// SyntaxError on invalid input
}
```
