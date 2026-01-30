import { AppBskyActorGetProfile } from '@atcute/bluesky';
import { Client, ok } from '@atcute/client';
import {
	CompositeDidDocumentResolver,
	CompositeHandleResolver,
	LocalActorResolver,
	PlcDidDocumentResolver,
	WebDidDocumentResolver,
	WellKnownHandleResolver,
} from '@atcute/identity-resolver';
import { NodeDnsHandleResolver } from '@atcute/identity-resolver-node';
import { isActorIdentifier } from '@atcute/lexicons/syntax';
import { MemoryStore, OAuthClient, scope, type StoredState } from '@atcute/oauth-node-client';

const TEN_MINUTES_MS = 10 * 60_000;

// get identifier from command line
const identifier = process.argv[2]?.trim();
if (!identifier) {
	console.error('usage: bun run start <handle-or-did>');
	console.error('  example: bun run start alice.bsky.social');
	console.error('  example: bun run start did:plc:z72i7hdynmk6r22z27h6tvur');
	process.exit(1);
}

if (!isActorIdentifier(identifier)) {
	console.error(`error: invalid identifier "${identifier}"`);
	console.error('expected a handle (e.g. alice.bsky.social) or did (e.g. did:plc:...)');
	process.exit(1);
}

// deferred for callback
const deferred = Promise.withResolvers<URLSearchParams>();

// start callback server on a random port
using server = Bun.serve({
	port: 0,
	fetch(req) {
		const url = new URL(req.url);

		if (url.pathname === '/callback') {
			deferred.resolve(url.searchParams);

			return new Response(
				`<!doctype html>
<html>
<head><title>success</title></head>
<body>
<h1>authenticated!</h1>
<p>you can close this window and return to the terminal.</p>
</body>
</html>`,
				{ headers: { 'content-type': 'text/html' } },
			);
		}

		return new Response('not found', { status: 404 });
	},
});

server.unref();

const port = server.port;
const redirectUri = `http://127.0.0.1:${port}/callback`;

// timeout after 5 minutes
const timeout = setTimeout(() => {
	deferred.reject(new Error('OAuth callback timed out after 5 minutes'));
}, 5 * 60_000);

// create OAuth client with loopback metadata (no client_id needed!)
const oauth = new OAuthClient({
	metadata: {
		redirect_uris: [redirectUri],
		scope: [scope.rpc({ lxm: ['app.bsky.actor.getProfile'], aud: '*' })],
	},

	actorResolver: new LocalActorResolver({
		handleResolver: new CompositeHandleResolver({
			methods: {
				dns: new NodeDnsHandleResolver(),
				http: new WellKnownHandleResolver(),
			},
		}),
		didDocumentResolver: new CompositeDidDocumentResolver({
			methods: {
				plc: new PlcDidDocumentResolver(),
				web: new WebDidDocumentResolver(),
			},
		}),
	}),

	stores: {
		sessions: new MemoryStore({ maxSize: 10 }),
		states: new MemoryStore<string, StoredState>({
			maxSize: 10,
			ttl: TEN_MINUTES_MS,
			ttlAutopurge: true,
		}),
	},
});

// start authorization flow
const { url } = await oauth.authorize({
	target: { type: 'account', identifier },
	redirectUri,
});

console.log(`\nopen this URL in your browser to authorize:\n${url.href}\n`);

const params = await deferred.promise;
clearTimeout(timeout);

const { session } = await oauth.callback(params, { redirectUri });

console.log('authenticated');

console.log(`\nauthenticated as: ${session.did}\n`);

// fetch profile
const rpc = new Client({ handler: session });
const profile = await ok(
	rpc.call(AppBskyActorGetProfile, {
		params: { actor: session.did },
	}),
);

console.log('='.repeat(50));
console.log('profile');
console.log('='.repeat(50));
console.log(`handle:       @${profile.handle}`);
console.log(`did:          ${profile.did}`);
if (profile.displayName) {
	console.log(`display name: ${profile.displayName}`);
}
if (profile.description) {
	console.log(
		`bio:          ${profile.description.split('\n')[0]}${profile.description.includes('\n') ? '...' : ''}`,
	);
}
console.log(`followers:    ${profile.followersCount ?? 0}`);
console.log(`following:    ${profile.followsCount ?? 0}`);
console.log(`posts:        ${profile.postsCount ?? 0}`);
console.log('='.repeat(50));

process.exit(0);
