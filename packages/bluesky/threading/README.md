# @atcute/bluesky-threading

publish Bluesky threads atomically.

```sh
npm install @atcute/bluesky-threading
```

creates multiple posts as a single atomic write using `com.atproto.repo.applyWrites`, so either all
posts succeed or none do.

## usage

### publishing a thread

```ts
import { XRPC } from '@atcute/client';
import RichTextBuilder from '@atcute/bluesky-richtext-builder';
import { publishThread } from '@atcute/bluesky-threading';

const rpc = new XRPC({ handler: agent });

await publishThread(rpc, {
	author: 'did:plc:ia76kvnndjutgedggx2ibrem',
	languages: ['en'],
	posts: [
		{
			content: new RichTextBuilder()
				.addText('First post of my thread! ')
				.addLink('example.com', 'https://example.com'),
		},
		{
			content: { text: 'Second post continues the story...' },
		},
		{
			content: { text: 'And the thrilling conclusion!' },
		},
	],
});
```

### adding images

```ts
await publishThread(rpc, {
	author: 'did:plc:ia76kvnndjutgedggx2ibrem',
	posts: [
		{
			content: { text: 'Check out this photo!' },
			embed: {
				media: {
					type: 'image',
					images: [
						{
							blob: imageFile, // Web Blob - auto-uploaded
							alt: 'A beautiful sunset',
							aspectRatio: { width: 1200, height: 800 },
						},
					],
				},
			},
		},
	],
});
```

### quote posting

```ts
await publishThread(rpc, {
	author: 'did:plc:ia76kvnndjutgedggx2ibrem',
	posts: [
		{
			content: { text: 'This is such a great post!' },
			embed: {
				record: {
					type: 'quote',
					uri: 'at://did:plc:.../app.bsky.feed.post/...',
				},
			},
		},
	],
});
```

### replying to a post

```ts
await publishThread(rpc, {
	author: 'did:plc:ia76kvnndjutgedggx2ibrem',
	reply: 'at://did:plc:.../app.bsky.feed.post/...', // AT-URI of post to reply to
	posts: [{ content: { text: 'Great thread! Adding my thoughts...' } }],
});
```

### restricting replies with threadgate

```ts
await publishThread(rpc, {
	author: 'did:plc:ia76kvnndjutgedggx2ibrem',
	gate: {
		follows: true, // only followers can reply
		mentions: true, // or users mentioned in the post
	},
	posts: [{ content: { text: 'Only my followers can reply to this thread' } }],
});
```

### creating without publishing

use `createThread` to get the records without publishing - useful for previews or custom handling:

```ts
import { createThread } from '@atcute/bluesky-threading';

const records = await createThread({
	client: rpc,
	author: 'did:plc:ia76kvnndjutgedggx2ibrem',
	posts: [{ content: { text: 'Preview this first' } }],
});

// inspect records, then publish yourself via com.atproto.repo.applyWrites
```
