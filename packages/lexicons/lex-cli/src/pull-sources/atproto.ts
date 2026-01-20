import { getPdsEndpoint, isAtprotoDid } from '@atcute/identity';
import type { DidDocumentResolver } from '@atcute/identity-resolver';
import {
	CompositeDidDocumentResolver,
	CompositeHandleResolver,
	DohJsonHandleResolver,
	PlcDidDocumentResolver,
	WebDidDocumentResolver,
	WellKnownHandleResolver,
} from '@atcute/identity-resolver';
import { refineLexiconDoc, type LexiconDoc } from '@atcute/lexicon-doc';
import { DohJsonLexiconAuthorityResolver, LexiconSchemaResolver } from '@atcute/lexicon-resolver';
import {
	isHandle,
	isNsid,
	parseCanonicalResourceUri,
	type AtprotoDid,
	type Nsid,
} from '@atcute/lexicons/syntax';

import pc from 'picocolors';

import type { AtprotoSourceConfig } from '../config.js';

import type { PullResult, SourceLocation } from './types.js';

/**
 * discovers all published lexicons for an authority by listing records in the
 * com.atproto.lexicon.schema collection
 * @param authority the authority DID
 * @param didResolver DID document resolver
 * @returns array of NSID strings
 */
const discoverLexiconsForAuthority = async (
	authority: AtprotoDid,
	didResolver: DidDocumentResolver,
): Promise<Nsid[]> => {
	// resolve DID to get PDS endpoint
	const didDocument = await didResolver.resolve(authority);
	const pdsEndpoint = getPdsEndpoint(didDocument);

	if (!pdsEndpoint) {
		throw new Error(`no pds service in did document; did=${authority}`);
	}

	// call com.atproto.repo.listRecords to get all lexicon schema records
	const nsids: Nsid[] = [];
	let cursor: string | undefined;

	do {
		const url = new URL('/xrpc/com.atproto.repo.listRecords', pdsEndpoint);
		url.searchParams.set('repo', authority);
		url.searchParams.set('collection', 'com.atproto.lexicon.schema');
		url.searchParams.set('limit', '100');
		if (cursor) {
			url.searchParams.set('cursor', cursor);
		}

		const response = await fetch(url.href, {
			headers: { accept: 'application/json' },
		});

		if (!response.ok) {
			throw new Error(`http ${response.status} when listing records`);
		}

		const data = (await response.json()) as {
			records: Array<{ uri: string; value: unknown }>;
			cursor?: string;
		};

		// extract NSIDs from record keys (the rkey in at://did/collection/rkey)
		for (const record of data.records) {
			const r = parseCanonicalResourceUri(record.uri);
			if (!r.ok) {
				continue;
			}

			const nsid = r.value.rkey;
			if (!isNsid(nsid)) {
				continue;
			}

			nsids.push(nsid);
		}

		cursor = data.cursor;
	} while (cursor);

	return nsids;
};

/**
 * pulls lexicon documents from AT Protocol network resolution
 * @param source atproto source configuration
 * @returns pulled lexicons and ISO timestamp
 */
export const pullAtprotoSource = async (source: AtprotoSourceConfig): Promise<PullResult> => {
	// create resolver instances (reusable across NSIDs)
	const authorityResolver = new DohJsonLexiconAuthorityResolver({
		dohUrl: 'https://cloudflare-dns.com/dns-query',
	});

	const didResolver = new CompositeDidDocumentResolver({
		methods: {
			plc: new PlcDidDocumentResolver(),
			web: new WebDidDocumentResolver(),
		},
	});

	const schemaResolver = new LexiconSchemaResolver({
		didDocumentResolver: didResolver,
	});

	const handleResolver = new CompositeHandleResolver({
		strategy: 'race',
		methods: {
			http: new WellKnownHandleResolver(),
			dns: new DohJsonHandleResolver({
				dohUrl: 'https://cloudflare-dns.com/dns-query',
			}),
		},
	});

	const pulled = new Map<string, { nsid: string; doc: LexiconDoc; location: SourceLocation }>();
	const errors: Array<{ nsid: string; error: Error }> = [];

	let nsids: Nsid[];
	let authorityDid: AtprotoDid | null = null;
	let sourceDesc: string;
	let sourceName: string | null = null;

	if (source.mode === 'nsids') {
		nsids = source.nsids;
		sourceDesc = `atproto (${nsids.length} nsids)`;
	} else {
		// mode 2: authority-based
		// step 2a: resolve authority (handle -> DID if needed)
		let resolvedDid: AtprotoDid;
		const handle = isHandle(source.authority) ? source.authority : null;

		try {
			if (isAtprotoDid(source.authority)) {
				resolvedDid = source.authority;
			} else if (handle) {
				resolvedDid = await handleResolver.resolve(handle);
			} else {
				console.error(pc.bold(pc.red(`invalid authority: ${source.authority}`)));
				console.error(`must be a valid DID or handle`);
				process.exit(1);
			}

			authorityDid = resolvedDid;
			sourceDesc = `atproto (authority: ${authorityDid})`;
			sourceName = handle ?? authorityDid;
		} catch (err) {
			console.error(pc.bold(pc.red(`failed to resolve authority: ${source.authority}`)));
			console.error(err);
			process.exit(1);
		}

		// step 2b: discover all lexicons for this authority
		try {
			nsids = await discoverLexiconsForAuthority(authorityDid, didResolver);
		} catch (err) {
			console.error(pc.bold(pc.red(`failed to discover lexicons for ${sourceName}`)));
			console.error(err);
			process.exit(1);
		}

		// step 2c: filter by pattern if specified
		if (source.pattern) {
			nsids = nsids.filter((nsid) => {
				return source.pattern!.some((pattern) => {
					if (pattern.endsWith('.*')) {
						const prefix = pattern.slice(0, -2);
						return nsid === prefix || nsid.startsWith(prefix + '.');
					}
					return nsid === pattern;
				});
			});
		}

		if (nsids.length === 0) {
			console.warn(pc.yellow(`warning: no lexicons found for ${sourceName}`));
		}
	}

	// fetch each NSID
	let fetchedCount = 0;
	for (const nsid of nsids) {
		try {
			// step 1: resolve authority from NSID (DNS)
			const resolvedAuthority = await authorityResolver.resolve(nsid as Nsid);

			// step 2: cross-verify authority if in authority-based mode
			if (authorityDid && resolvedAuthority !== authorityDid) {
				throw new Error(
					`authority mismatch: NSID ${nsid} claims authority ${resolvedAuthority} but expected ${authorityDid}`,
				);
			}

			// step 3: fetch schema from authority's PDS
			const resolved = await schemaResolver.resolve(resolvedAuthority, nsid as Nsid);

			// step 4: lint the lexicon document
			const issues = refineLexiconDoc(resolved.schema, true);
			if (issues.length > 0) {
				const messages = issues.map((i) => `  ${i.path}: ${i.message}`).join('\n');
				throw new Error(`lint validation failed:\n${messages}`);
			}

			// create in-memory location (no file on disk yet)
			const location: SourceLocation = {
				absolutePath: `<atproto:${nsid}>`,
				relativePath: `${nsid}.json`,
				sourceDescription: sourceDesc,
			};

			pulled.set(nsid, {
				nsid,
				doc: resolved.schema,
				location,
			});
			fetchedCount++;
			console.log(`${pc.green('+')} ${nsid}`);
		} catch (err) {
			// best-effort: collect errors but continue
			errors.push({ nsid, error: err as Error });
		}
	}

	// report all errors at end
	if (errors.length > 0) {
		console.warn(pc.yellow(`\nwarning: failed to fetch ${errors.length} lexicon(s):`));
		for (const { nsid, error } of errors) {
			console.warn(`  - ${nsid}: ${error.message}`);
		}
	}

	const suffix = sourceName ? ` from ${pc.cyan(sourceName)}` : '';
	console.log(`pulled ${pc.cyan(fetchedCount.toString())} lexicons${suffix}`);

	return { pulled };
};
