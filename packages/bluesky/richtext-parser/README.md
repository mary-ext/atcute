# @atcute/bluesky-richtext-parser

parse Bluesky's rich text syntax, with added support for emotes, escapes, and Markdown-like links.

```ts
const result = tokenize(`hello @bsky.app! check out my [website](https://example.com)`);

expect(result).toEqual([
	{
		type: 'text',
		raw: 'hello ',
		text: 'hello ',
	},
	{
		type: 'mention',
		raw: '@bsky.app',
		handle: 'bsky.app',
	},
	{
		type: 'text',
		raw: '! check out my ',
		text: '! check out my ',
	},
	{
		type: 'link',
		raw: '[website](https://example.com)',
		text: 'website',
		url: 'https://example.com',
	},
]);
```

whitespace trimming can be done by using the following regular expression before passing to the
tokenizer, and afterwards for text on Markdown-like links:

```ts
/^\s+|\s+$| +(?=\n)|\n(?=(?: *\n){2}) */g;
```

autolink trimming can be done like so:

```ts
const safeUrlParse = (href: string): URL | null => {
	const url = URL.parse(text);

	if (url !== null) {
		const protocol = url.protocol;

		if (protocol === 'https:' || protocol === 'http:') {
			return url;
		}
	}

	return null;
};

const TRIM_HOST_RE = /^www\./;
const PATH_MAX_LENGTH = 16;

const toShortUrl = (href: string): string => {
	const url = safeUrlParse(href);

	if (url !== null) {
		const host =
			(url.username ? url.username + (url.password ? ':' + url.password : '') + '@' : '') +
			url.host.replace(TRIM_HOST_RE, '');

		const path =
			(url.pathname === '/' ? '' : url.pathname) +
			(url.search.length > 1 ? url.search : '') +
			(url.hash.length > 1 ? url.hash : '');

		if (path.length > PATH_MAX_LENGTH) {
			return host + path.slice(0, PATH_MAX_LENGTH - 1) + '…';
		}

		return host + path;
	}

	return href;
};
```
