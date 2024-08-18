# @atcute/bluesky-threading

create Bluesky threads containing multiple posts with one write.

```ts
import { XRPC } from '@atcute/client';
import { AtpAuth } from '@atcute/client/middlewares/auth';

import RichTextBuilder from '@atcute/bluesky-richtext-builder';
import { publishThread } from '@atcute/bluesky-threading';

const rpc = new XRPC({ service: 'https://bsky.social' });
const auth = new AtpAuth(rpc);

await auth.login({ identifier: '...', password: '...' });

await publishThread(rpc, {
	author: 'did:plc:ia76kvnndjutgedggx2ibrem',
	languages: ['en'],
	posts: [
		{
			content: new RichTextBuilder()
				.addText('Hello, please visit my website! ')
				.addLink('example.com', 'https://example.com'),
		},
		{
			content: {
				text: `Here's the second post!`,
			},
		},
		{
			content: {
				text: `Third post for good measure.`,
			},
		},
	],
});
```
