# @atcute/cache

> [!WARNING]
> experimental package - API may change

normalized cache store for AT Protocol.

```sh
npm install @atcute/cache
```

stores entities by their unique keys and automatically deduplicates nested references. when an
entity appears in multiple API responses (e.g., a profile in a post author and in followers), they
share the same object reference in memory.

## usage

### setting up the cache

```ts
import { NormalizedCache } from '@atcute/cache';
import { AppBskyActorDefs, AppBskyFeedDefs } from '@atcute/bluesky';

const cache = new NormalizedCache();

// register entity types with key extractors
cache.define({
	schema: AppBskyFeedDefs.postViewSchema,
	key: (post) => post.uri,
});

cache.define({
	schema: AppBskyActorDefs.profileViewBasicSchema,
	key: (profile) => profile.did,
});
```

### normalizing API responses

```ts
import { AppBskyFeedGetTimeline } from '@atcute/bluesky';

const response = await rpc.get('app.bsky.feed.getTimeline', { params: {} });

// walks the response, extracts entities, and stores them
const timeline = cache.normalize(AppBskyFeedGetTimeline.mainSchema.output.schema, response.data);
```

### reading from cache

```ts
const post = cache.get(AppBskyFeedDefs.postViewSchema, 'at://did:plc:.../app.bsky.feed.post/...');
const profile = cache.get(AppBskyActorDefs.profileViewBasicSchema, 'did:plc:...');

// check if entity exists
if (cache.has(AppBskyFeedDefs.postViewSchema, postUri)) {
	// ...
}

// get all cached entities of a type
const allPosts = cache.getAll(AppBskyFeedDefs.postViewSchema);
```

### optimistic updates

```ts
// update a post's like count immediately, before the API responds
cache.update(AppBskyFeedDefs.postViewSchema, postUri, (post) => ({
	...post,
	viewer: { ...post.viewer, like: tempLikeUri },
	likeCount: (post.likeCount ?? 0) + 1,
}));
```

### subscribing to changes

```ts
// subscribe to a specific entity
const unsubscribe = cache.subscribe(AppBskyFeedDefs.postViewSchema, postUri, (post) => {
	console.log('post changed:', post);
});

// subscribe to all entities of a type
const unsubscribeType = cache.subscribeType(AppBskyActorDefs.profileViewBasicSchema, (key, profile) => {
	console.log(`profile ${key} changed:`, profile);
});

// clean up when done
unsubscribe();
unsubscribeType();
```

### custom merge logic

```ts
cache.define({
	schema: AppBskyActorDefs.profileViewBasicSchema,
	key: (profile) => profile.did,
	// custom merge: prefer existing avatar if new one is missing
	merge: (existing, incoming) => ({
		...incoming,
		avatar: incoming.avatar ?? existing.avatar,
	}),
});
```
