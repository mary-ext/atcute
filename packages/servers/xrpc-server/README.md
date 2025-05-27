# @atcute/xrpc-server

```ts
import { parseCanonicalResourceUri, type Nsid } from '@atcute/lexicons';

import { AuthRequiredError, InvalidRequestError, XRPCRouter, json } from '@atcute/xrpc-server';
import { ServiceJwtVerifier, type VerifiedJwt } from '@atcute/xrpc-server/auth';

import {
	CompositeDidDocumentResolver,
	PlcDidDocumentResolver,
	WebDidDocumentResolver,
} from '@atcute/identity-resolver';

import { AppBskyFeedGetFeedSkeleton } from '@atcute/bluesky';

const SERVICE_DID = 'did:web:feedgen.example.com';

const router = new XRPCRouter();
const jwtVerifier = new ServiceJwtVerifier({
	serviceDid: SERVICE_DID,
	resolver: new CompositeDidDocumentResolver({
		methods: {
			plc: new PlcDidDocumentResolver(),
			web: new WebDidDocumentResolver(),
		},
	}),
});

const requireAuth = async (request: Request, lxm: Nsid): Promise<VerifiedJwt> => {
	const auth = request.headers.get('authorization');
	if (auth === null) {
		throw new AuthRequiredError({ description: `missing authorization header` });
	}
	if (!auth.startsWith('Bearer ')) {
		throw new AuthRequiredError({ description: `invalid authorization scheme` });
	}

	const jwtString = auth.slice('Bearer '.length).trim();

	const result = await jwtVerifier.verify(jwtString, { lxm });
	if (!result.ok) {
		throw new AuthRequiredError(result.error);
	}

	return result.value;
};

router.add(AppBskyFeedGetFeedSkeleton.mainSchema, {
	async handler({ params: { feed }, request }) {
		await requireAuth(request, 'app.bsky.feed.getFeedSkeleton');

		const feedUri = parseCanonicalResourceUri(feed);

		if (
			!feedUri.ok ||
			feedUri.value.collection !== 'app.bsky.feed.generator' ||
			feedUri.value.repo !== SERVICE_DID ||
			feedUri.value.rkey !== 'feed'
		) {
			throw new InvalidRequestError({
				error: 'InvalidFeed',
				description: `invalid feed`,
			});
		}

		return json({
			feed: [
				{ post: 'at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.post/3l6oveex3ii2l' },
				{ post: 'at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.post/3lpk2lf7k6k2t' },
			],
		});
	},
});

export default router;
```
