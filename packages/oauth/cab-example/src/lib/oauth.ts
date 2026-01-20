import { createCabFetcher } from '@atcute/oauth-cab/client';
import {
	CompositeDidDocumentResolver,
	LocalActorResolver,
	PlcDidDocumentResolver,
	WebDidDocumentResolver,
	XrpcHandleResolver,
} from '@atcute/identity-resolver';
import { configureOAuth } from '@atcute/oauth-browser-client';

const CLIENT_ID = import.meta.env.VITE_OAUTH_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_OAUTH_REDIRECT_URI;

configureOAuth({
	metadata: {
		client_id: CLIENT_ID,
		redirect_uri: REDIRECT_URI,
	},
	identityResolver: new LocalActorResolver({
		handleResolver: new XrpcHandleResolver({ serviceUrl: 'https://public.api.bsky.app' }),
		didDocumentResolver: new CompositeDidDocumentResolver({
			methods: {
				plc: new PlcDidDocumentResolver(),
				web: new WebDidDocumentResolver(),
			},
		}),
	}),
	fetchClientAssertion: createCabFetcher(),
});

export { CLIENT_ID, REDIRECT_URI };
