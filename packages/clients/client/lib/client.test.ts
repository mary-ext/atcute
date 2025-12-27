import { assertType, describe, expect, it, vi } from 'vitest';

import * as v from '@atcute/lexicons/validations';

import { Client, ClientValidationError } from './client.js';
import type { FetchHandler } from './fetch-handler.js';

const headersContaining = (expected: Record<string, string>) => ({
	asymmetricMatch(actual: unknown) {
		if (!(actual instanceof Headers)) {
			return false;
		}
		for (const [key, value] of Object.entries(expected)) {
			if (actual.get(key) !== value) {
				return false;
			}
		}
		return true;
	},
	toString() {
		return `Headers containing ${JSON.stringify(expected)}`;
	},
});

describe('params serializer', () => {
	const handler = vi.fn<FetchHandler>(() => Promise.resolve(new Response('hello')));
	const rpc = new Client({ handler });

	it('serializes strings', async () => {
		{
			await rpc.get('com.atproto.sync.getBlob', {
				as: 'blob',
				params: {
					did: 'did:plc:ia76kvnndjutgedggx2ibrem',
					cid: 'bafkreiesgyo7ukzqhs5mmtulvovzrbbru7ztvopwdwfsvllu553qgfmxd4',
				},
			});

			expect(handler).toBeCalledWith(
				expect.stringMatching(/[?&]did=did%3Aplc%3Aia76kvnndjutgedggx2ibrem(?:&|$)/),
				expect.objectContaining({ method: 'get' }),
			);
		}

		{
			await rpc.get('com.atproto.sync.getBlocks', {
				as: 'blob',
				params: {
					did: 'did:plc:ia76kvnndjutgedggx2ibrem',
					cids: ['bafyreibluyqpqno2ixrhdkztquyarpug7k6t4en6ug7g3sw6fonzzmakbq'],
				},
			});

			expect(handler).toBeCalledWith(
				expect.stringMatching(/[?&]cids=bafyreibluyqpqno2ixrhdkztquyarpug7k6t4en6ug7g3sw6fonzzmakbq(?:&|$)/),
				expect.objectContaining({ method: 'get' }),
			);
		}

		{
			await rpc.get('com.atproto.sync.getBlocks', {
				as: 'blob',
				params: {
					did: 'did:plc:ia76kvnndjutgedggx2ibrem',
					cids: [
						'bafyreibluyqpqno2ixrhdkztquyarpug7k6t4en6ug7g3sw6fonzzmakbq',
						'bafyreibyxku6r4rxecexijdmq2v5zogize6giv2ztnrnsx6teu5trmphtq',
					],
				},
			});

			expect(handler).toBeCalledWith(
				expect.stringMatching(
					/[?&]cids=bafyreibluyqpqno2ixrhdkztquyarpug7k6t4en6ug7g3sw6fonzzmakbq&cids=bafyreibyxku6r4rxecexijdmq2v5zogize6giv2ztnrnsx6teu5trmphtq(?:&|$)/,
				),
				expect.objectContaining({ method: 'get' }),
			);
		}
	});

	it('serializes numbers', async () => {
		{
			await rpc.get('com.atproto.repo.listRecords', {
				as: 'bytes',
				params: {
					repo: 'did:plc:ia76kvnndjutgedggx2ibrem',
					collection: 'app.bsky.feed.post',
					limit: 30,
				},
			});

			expect(handler).toBeCalledWith(
				expect.stringMatching(/[?&]limit=30(?:&|$)/),
				expect.objectContaining({ method: 'get' }),
			);
		}
	});

	it('serializes booleans', async () => {
		{
			await rpc.get('com.atproto.repo.listRecords', {
				as: 'bytes',
				params: {
					repo: 'did:plc:ia76kvnndjutgedggx2ibrem',
					collection: 'app.bsky.feed.post',
					reverse: true,
				},
			});

			expect(handler).toBeCalledWith(
				expect.stringMatching(/[?&]reverse=true(?:&|$)/),
				expect.objectContaining({ method: 'get' }),
			);
		}

		{
			await rpc.get('com.atproto.repo.listRecords', {
				as: 'bytes',
				params: {
					repo: 'did:plc:ia76kvnndjutgedggx2ibrem',
					collection: 'app.bsky.feed.post',
					reverse: false,
				},
			});

			expect(handler).toBeCalledWith(
				expect.stringMatching(/[?&]reverse=false(?:&|$)/),
				expect.objectContaining({ method: 'get' }),
			);
		}
	});
});

describe('proxy', () => {
	it('sets the proxy header', async () => {
		const handler = vi.fn<FetchHandler>(() => Promise.resolve(Response.json({})));
		const rpc = new Client({ handler, proxy: { did: 'did:web:api.bsky.chat', serviceId: '#bsky_chat' } });

		await rpc.get('com.atproto.server.describeServer');

		expect(handler).toBeCalledWith(
			'/xrpc/com.atproto.server.describeServer',
			expect.objectContaining({
				method: 'get',
				headers: new Headers({ 'atproto-proxy': 'did:web:api.bsky.chat#bsky_chat' }),
			}),
		);
	});
});

describe('call method with validation', () => {
	it('validates and executes a successful query', async () => {
		const handler = vi.fn<FetchHandler>(() =>
			Promise.resolve(
				Response.json({
					did: 'did:plc:test',
					availableUserDomains: [],
				}),
			),
		);
		const client = new Client({ handler });

		const schema = v.query('com.atproto.server.describeServer', {
			params: null,
			output: {
				type: 'lex',
				schema: v.object({
					did: v.didString(),
					availableUserDomains: v.array(v.string()),
				}),
			},
		});

		const response = await client.call(schema);

		expect(response.ok).toBe(true);
		if (response.ok) {
			expect(response.data.did).toBe('did:plc:test');
			expect(response.data.availableUserDomains).toEqual([]);
		}

		expect(handler).toBeCalledWith(
			'/xrpc/com.atproto.server.describeServer',
			expect.objectContaining({ method: 'get' }),
		);
	});

	it('validates and executes a successful procedure', async () => {
		const handler = vi.fn<FetchHandler>(() =>
			Promise.resolve(
				Response.json({
					handle: 'test.bsky.social',
				}),
			),
		);
		const client = new Client({ handler });

		const schema = v.procedure('com.atproto.identity.resolveHandle', {
			params: v.object({
				handle: v.handleString(),
			}),
			input: null,
			output: {
				type: 'lex',
				schema: v.object({
					handle: v.handleString(),
				}),
			},
		});

		const response = await client.call(schema, {
			params: { handle: 'test.bsky.social' },
		});

		expect(response.ok).toBe(true);
		if (response.ok) {
			expect(response.data.handle).toBe('test.bsky.social');
		}

		expect(handler).toBeCalledWith(
			expect.stringMatching(/handle=test\.bsky\.social/),
			expect.objectContaining({ method: 'post' }),
		);
	});

	it('throws validation error for invalid params', async () => {
		const handler = vi.fn<FetchHandler>(() => Promise.resolve(Response.json({})));
		const client = new Client({ handler });

		const schema = v.query('com.example.test.query', {
			params: v.object({
				limit: v.constrain(v.integer(), [v.integerRange(1, 100)]),
			}),
			output: null,
		});

		await expect(
			client.call(schema, {
				params: { limit: 200 },
			}),
		).rejects.toThrow(ClientValidationError);
	});

	it('throws validation error for invalid input', async () => {
		const handler = vi.fn<FetchHandler>(() => Promise.resolve(Response.json({})));
		const client = new Client({ handler });

		const schema = v.procedure('com.example.test.procedure', {
			params: null,
			input: {
				type: 'lex',
				schema: v.object({
					text: v.constrain(v.string(), [v.stringLength(1, 100)]),
				}),
			},
			output: null,
		});

		await expect(
			client.call(schema, {
				input: { text: '' },
			}),
		).rejects.toThrow(ClientValidationError);
	});

	it('throws validation error for invalid output', async () => {
		const handler = vi.fn<FetchHandler>(() =>
			Promise.resolve(
				Response.json({
					value: 'not a number',
				}),
			),
		);
		const client = new Client({ handler });

		const schema = v.query('com.example.test.query', {
			params: null,
			output: {
				type: 'lex',
				schema: v.object({
					value: v.integer(),
				}),
			},
		});

		await expect(client.call(schema)).rejects.toThrow(ClientValidationError);
	});

	it('respects format override with as option', async () => {
		const blobData = new Blob(['test']);
		const handler = vi.fn<FetchHandler>(() => Promise.resolve(new Response(blobData)));
		const client = new Client({ handler });

		const schema = v.query('com.example.test.query', {
			params: null,
			output: {
				type: 'lex',
				schema: v.object({ data: v.string() }),
			},
		});

		const response = await client.call(schema, { as: 'blob' });

		expect(response.ok).toBe(true);
		if (response.ok) {
			expect(response.data).toBeInstanceOf(Blob);
		}
	});

	it('handles procedure with JSON input', async () => {
		const handler = vi.fn<FetchHandler>(() => Promise.resolve(Response.json({ success: true })));
		const client = new Client({ handler });

		const schema = v.procedure('com.example.test.procedure', {
			params: null,
			input: {
				type: 'lex',
				schema: v.object({
					message: v.string(),
				}),
			},
			output: {
				type: 'lex',
				schema: v.object({
					success: v.boolean(),
				}),
			},
		});

		await client.call(schema, {
			input: { message: 'hello' },
		});

		expect(handler).toBeCalledWith(
			'/xrpc/com.example.test.procedure',
			expect.objectContaining({
				method: 'post',
				body: JSON.stringify({ message: 'hello' }),
				headers: headersContaining({ 'content-type': 'application/json' }),
			}),
		);
	});

	it('supports namespace usage', async () => {
		const handler = vi.fn<FetchHandler>(() => Promise.resolve(Response.json({ value: 42 })));
		const client = new Client({ handler });

		// create a namespace object with mainSchema
		const AppBskyActorGetProfile = {
			mainSchema: v.query('com.example.query', {
				params: v.object({
					actor: v.string(),
				}),
				output: {
					type: 'lex',
					schema: v.object({
						value: v.integer(),
					}),
				},
			}),
		};

		// should accept namespace directly
		const response = await client.call(AppBskyActorGetProfile, { params: { actor: 'test.bsky.social' } });

		expect(response.ok).toBe(true);
		if (response.ok) {
			expect(response.data.value).toBe(42);
		}
	});

	it('has correct types for call method', async () => {
		// query with typed output
		const querySchema = v.query('com.example.query', {
			params: v.object({
				id: v.string(),
			}),
			output: {
				type: 'lex',
				schema: v.object({
					value: v.integer(),
				}),
			},
		});

		const queryHandler = vi.fn<FetchHandler>(() => Promise.resolve(Response.json({ value: 42 })));
		const queryClient = new Client({ handler: queryHandler });

		const queryResponse = await queryClient.call(querySchema, { params: { id: 'test' } });
		if (queryResponse.ok) {
			assertType<number>(queryResponse.data.value);
		}

		// query with format overrides
		const blobHandler = vi.fn<FetchHandler>(() => Promise.resolve(new Response(new Blob(['test']))));
		const blobClient = new Client({ handler: blobHandler });

		const queryBlobResponse = await blobClient.call(querySchema, { params: { id: 'test' }, as: 'blob' });
		if (queryBlobResponse.ok) {
			assertType<Blob>(queryBlobResponse.data);
		}

		const queryBytesResponse = await blobClient.call(querySchema, { params: { id: 'test' }, as: 'bytes' });
		if (queryBytesResponse.ok) {
			assertType<Uint8Array>(queryBytesResponse.data);
		}

		const queryStreamResponse = await blobClient.call(querySchema, { params: { id: 'test' }, as: 'stream' });
		if (queryStreamResponse.ok) {
			assertType<ReadableStream<Uint8Array>>(queryStreamResponse.data);
		}

		const queryNullResponse = await blobClient.call(querySchema, { params: { id: 'test' }, as: null });
		if (queryNullResponse.ok) {
			assertType<null>(queryNullResponse.data);
		}

		// procedure with typed input and output
		const procedureSchema = v.procedure('com.example.procedure', {
			params: null,
			input: {
				type: 'lex',
				schema: v.object({
					message: v.string(),
				}),
			},
			output: {
				type: 'lex',
				schema: v.object({
					success: v.boolean(),
				}),
			},
		});

		const procedureHandler = vi.fn<FetchHandler>(() => Promise.resolve(Response.json({ success: true })));
		const procedureClient = new Client({ handler: procedureHandler });

		const procedureResponse = await procedureClient.call(procedureSchema, { input: { message: 'hello' } });
		if (procedureResponse.ok) {
			assertType<boolean>(procedureResponse.data.success);
		}

		// procedure with no output
		const procedureNoOutput = v.procedure('com.example.procedure2', {
			params: null,
			input: null,
			output: null,
		});

		const noOutputHandler = vi.fn<FetchHandler>(() => Promise.resolve(new Response()));
		const noOutputClient = new Client({ handler: noOutputHandler });

		const noOutputResponse = await noOutputClient.call(procedureNoOutput);
		if (noOutputResponse.ok) {
			assertType<null>(noOutputResponse.data);
		}

		// query with blob output requires `as` to be specified
		const blobOutputSchema = v.query('com.example.blobQuery', {
			params: null,
			output: {
				type: 'blob',
			},
		});

		const blobOutputHandler = vi.fn<FetchHandler>(() => Promise.resolve(new Response(new Blob(['test']))));
		const blobOutputClient = new Client({ handler: blobOutputHandler });

		// @ts-expect-error - `as` is required for blob output
		await expect(blobOutputClient.call(blobOutputSchema)).rejects.toThrow(
			'`as` option is required for endpoints returning blobs',
		);

		// with `as` specified, it works
		const blobOutputResponse = await blobOutputClient.call(blobOutputSchema, { as: 'blob' });
		if (blobOutputResponse.ok) {
			assertType<Blob>(blobOutputResponse.data);
		}

		const bytesOutputResponse = await blobOutputClient.call(blobOutputSchema, { as: 'bytes' });
		if (bytesOutputResponse.ok) {
			assertType<Uint8Array>(bytesOutputResponse.data);
		}
	});
});

expect.addEqualityTesters([
	function areURLSearchParamsEqual(a, b) {
		const aIsSearchParams = a instanceof URLSearchParams;
		const bIsSearchParams = b instanceof URLSearchParams;

		if (aIsSearchParams && bIsSearchParams) {
			return false;
		}

		if (aIsSearchParams === bIsSearchParams) {
			return undefined;
		}

		return false;
	},
	function areHeadersEqual(a, b) {
		const aIsHeaders = a instanceof Headers;
		const bIsHeaders = b instanceof Headers;

		if (aIsHeaders && bIsHeaders) {
			return this.equals(Object.fromEntries(a.entries()), Object.fromEntries(b.entries()));
		}

		if (aIsHeaders === bIsHeaders) {
			return undefined;
		}

		return false;
	},
]);
