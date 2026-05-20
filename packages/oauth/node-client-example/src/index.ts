import { ComAtprotoServerGetSession } from '@atcute/atproto';
import { Client } from '@atcute/client';
import {
	CompositeDidDocumentResolver,
	CompositeHandleResolver,
	LocalActorResolver,
	PlcDidDocumentResolver,
	WebDidDocumentResolver,
	WellKnownHandleResolver,
} from '@atcute/identity-resolver';
import { NodeDnsHandleResolver } from '@atcute/identity-resolver-node';
import { type Did, isActorIdentifier, isDid } from '@atcute/lexicons/syntax';
import {
	type AuthorizeTarget,
	type ClientAssertionPrivateJwk,
	MemoryStore,
	OAuthCallbackError,
	OAuthClient,
	type StoredState,
} from '@atcute/oauth-node-client';

import { type Context, Hono } from 'hono';
import { deleteCookie, getSignedCookie, setSignedCookie } from 'hono/cookie';

const SESSION_COOKIE = 'atcute_oauth_did';

const ONE_MINUTE_MS = 60_000;
const TEN_MINUTES_MS = 10 * ONE_MINUTE_MS;

const isProbablyUrl = (input: string): boolean => {
	try {
		const url = new URL(input);
		return url.protocol === 'https:' || url.protocol === 'http:';
	} catch {
		return false;
	}
};

const escapeHtml = (input: string): string => {
	return input.replace(/[&<>"']/g, (ch) => {
		switch (ch) {
			case '&':
				return '&amp;';
			case '<':
				return '&lt;';
			case '>':
				return '&gt;';
			case '"':
				return '&quot;';
			case "'":
				return '&#39;';
			default:
				return ch;
		}
	});
};

const renderPage = (title: string, body: string): string => {
	return `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>${escapeHtml(title)}</title>
	<style>
		:root { color-scheme: light dark; }
		body { font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; margin: 2rem; line-height: 1.4; }
		main { max-width: 58rem; }
		input { padding: 0.6rem 0.8rem; width: min(34rem, 100%); }
		button { padding: 0.6rem 0.8rem; }
		code, pre { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.95em; }
		pre { padding: 1rem; border: 1px solid color-mix(in oklab, currentColor 22%, transparent); overflow-x: auto; }
		hr { border: 0; border-top: 1px solid color-mix(in oklab, currentColor 22%, transparent); margin: 1.5rem 0; }
		.row { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; }
		.muted { opacity: 0.75; }
	</style>
</head>
<body>
<main>
	<h1>${escapeHtml(title)}</h1>
	${body}
</main>
</body>
</html>`;
};

const publicUrlRaw = process.env.PUBLIC_URL;
if (!publicUrlRaw) {
	throw new Error(`missing env var: PUBLIC_URL`);
}

const publicUrl = new URL(publicUrlRaw);

const privateKeyJwk = process.env.PRIVATE_KEY_JWK;
if (!privateKeyJwk) {
	throw new Error(`missing env var: PRIVATE_KEY_JWK`);
}

const cookieSecret = process.env.COOKIE_SECRET;
if (!cookieSecret) {
	throw new Error(`missing env var: COOKIE_SECRET`);
}

const oauth = new OAuthClient({
	metadata: {
		client_id: new URL('/oauth-client-metadata.json', publicUrl).href,
		client_name: 'atcute oauth node client example',
		redirect_uris: [new URL('/oauth/callback', publicUrl).href],
		scope: 'atproto',
		jwks_uri: new URL('/jwks.json', publicUrl).href,
	},

	keyset: [JSON.parse(privateKeyJwk) as ClientAssertionPrivateJwk],

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
		sessions: new MemoryStore({
			maxSize: 10_000,
		}),
		states: new MemoryStore<string, StoredState>({
			maxSize: 10_000,
			ttl: TEN_MINUTES_MS,
			ttlAutopurge: true,
		}),
	},
});

const getSessionDid = async (c: Context): Promise<Did | null> => {
	const did = await getSignedCookie(c, cookieSecret, SESSION_COOKIE);

	if (isDid(did)) {
		return did;
	}

	return null;
};

const setSessionDid = async (c: Context, did: Did, secure: boolean): Promise<void> => {
	await setSignedCookie(c, SESSION_COOKIE, did, cookieSecret, {
		httpOnly: true,
		secure,
		sameSite: 'Lax',
		path: '/',
	});
};

const clearSessionDid = (c: Context, secure: boolean): void => {
	deleteCookie(c, SESSION_COOKIE, {
		httpOnly: true,
		secure,
		sameSite: 'Lax',
		path: '/',
	});
};

const renderError = (title: string, err: unknown): string => {
	let message = 'unknown error';
	if (err instanceof Error) {
		message = err.message;
	}

	let extra = '';
	if (err instanceof OAuthCallbackError) {
		extra = `\nerror: ${err.error}\nstate: ${err.state ?? '(missing)'}`;
	}

	return renderPage(
		title,
		`<p class="muted">something went wrong.</p>
<pre>${escapeHtml(`${message}${extra}`)}</pre>
<p><a href="/">back home</a></p>`,
	);
};

/** example hono app showcasing `@atcute/oauth-node-client`. */
const app = new Hono();

app.get('/', async (c) => {
	const secure = publicUrl.protocol === 'https:';
	const did = await getSessionDid(c);

	let sessionInfoHtml = `<p class="muted">not signed in.</p>`;
	if (did) {
		try {
			const session = await oauth.restore(did, { refresh: 'auto' });
			const tokenInfo = await session.getTokenInfo('auto');

			sessionInfoHtml = `<p>signed in as <code>${escapeHtml(session.did)}</code></p>
<pre>${escapeHtml(JSON.stringify(tokenInfo, null, 2))}</pre>
<div class="row">
	<a href="/protected">open protected page</a>
	<a href="/logout">logout</a>
</div>`;
		} catch {
			clearSessionDid(c, secure);
		}
	}

	return c.html(
		renderPage(
			'atcute oauth node client example',
			`${sessionInfoHtml}
<hr />
<form method="post" action="/oauth/login">
	<div class="row">
		<input name="identifier" placeholder="handle (alice.bsky.social) or did (did:plc:...)" required />
		<button type="submit">login</button>
	</div>
</form>
<hr />
<p class="muted">debug endpoints: <a href="/oauth-client-metadata.json">oauth-client-metadata.json</a>, <a href="/jwks.json">jwks.json</a></p>`,
		),
	);
});

app.post('/oauth/login', async (c) => {
	try {
		const body = await c.req.parseBody();

		const identifier = (typeof body.identifier === 'string' ? body.identifier : '').trim();
		if (!identifier) {
			return c.html(
				renderPage('login', `<p class="muted">missing identifier.</p><p><a href="/">back</a></p>`),
				400,
			);
		}

		let target: AuthorizeTarget;
		if (isProbablyUrl(identifier)) {
			target = { type: 'pds', serviceUrl: identifier };
		} else if (isActorIdentifier(identifier)) {
			target = { type: 'account', identifier: identifier };
		} else {
			return c.html(
				renderPage(
					'login',
					`<p class="muted">invalid identifier. expected a handle (e.g. <code>alice.bsky.social</code>) or a did (e.g. <code>did:plc:...</code>).</p>
<p><a href="/">back</a></p>`,
				),
				400,
			);
		}

		const { url } = await oauth.authorize({
			target,
			scope: 'atproto',
			state: { startedAt: Date.now() },
		});

		return c.redirect(url.href, 302);
	} catch (err) {
		return c.html(renderError('login', err), 500);
	}
});

app.get('/oauth/callback', async (c) => {
	try {
		const params = new URL(c.req.url).searchParams;

		const { session } = await oauth.callback(params);
		await setSessionDid(c, session.did, publicUrl.protocol === 'https:');

		return c.redirect('/protected', 302);
	} catch (err) {
		return c.html(renderError('callback', err), 500);
	}
});

app.get('/protected', async (c) => {
	try {
		const secure = publicUrl.protocol === 'https:';

		const did = await getSessionDid(c);
		if (!did) {
			return c.redirect('/', 302);
		}

		let session;
		try {
			session = await oauth.restore(did, { refresh: 'auto' });
		} catch {
			clearSessionDid(c, secure);
			return c.redirect('/', 302);
		}

		const rpc = new Client({ handler: session });
		const tokenInfo = await session.getTokenInfo('auto');

		const sessionResponse = await rpc.call(ComAtprotoServerGetSession, {});
		const sessionBody = sessionResponse.ok ? sessionResponse.data : { status: sessionResponse.status };

		return c.html(
			renderPage(
				'protected',
				`<p>this page calls <code>com.atproto.server.getSession</code> using the oauth session.</p>
<div class="row">
	<a href="/">home</a>
	<a href="/logout">logout</a>
</div>
<hr />
<h2>token</h2>
<pre>${escapeHtml(JSON.stringify(tokenInfo, null, 2))}</pre>
<h2>pds session</h2>
<pre>${escapeHtml(JSON.stringify(sessionBody, null, 2))}</pre>`,
			),
		);
	} catch (err) {
		return c.html(renderError('protected', err), 500);
	}
});

app.get('/logout', async (c) => {
	try {
		const secure = publicUrl.protocol === 'https:';

		const did = await getSessionDid(c);
		if (did) {
			try {
				await oauth.revoke(did);
			} catch {
				// ignore errors, we still clear local session
			}
		}

		clearSessionDid(c, secure);
		return c.redirect('/', 302);
	} catch (err) {
		return c.html(renderError('logout', err), 500);
	}
});

app.get('/oauth-client-metadata.json', async (c) => {
	return c.json(oauth.metadata);
});

app.get('/jwks.json', async (c) => {
	return c.json(oauth.jwks);
});

export default app;
