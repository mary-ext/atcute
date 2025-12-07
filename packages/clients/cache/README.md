# @atcute/cache

> [!WARNING]  
> very experimental package

normalized cache store for AT Protocol

```ts
import { NormalizedCache } from '@atcute/cache';
import { AppBskyActorDefs, AppBskyFeedDefs, AppBskyFeedGetTimeline } from '@atcute/bluesky';

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

// normalize API responses
const response = await rpc.get('app.bsky.feed.getTimeline', { params: {} });

const timeline = cache.normalize(AppBskyFeedGetTimeline.mainSchema.output.schema, response.data);

// read entities from cache
const post = cache.get(AppBskyFeedDefs.postViewSchema, 'at://did:plc:.../app.bsky.feed.post/...');
const profile = cache.get(AppBskyActorDefs.profileViewBasicSchema, 'did:plc:...');

// optimistic updates
cache.update(AppBskyFeedDefs.postViewSchema, postUri, (post) => ({
	...post,
	viewer: { ...post.viewer, like: tempLikeUri },
	likeCount: (post.likeCount ?? 0) + 1,
}));

// subscribe to entity changes
const unsubscribe = cache.subscribe(AppBskyFeedDefs.postViewSchema, postUri, (post) => {
	console.log('post changed:', post);
});
```
