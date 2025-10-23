import { describe, expect, it, vi } from 'vitest';

import * as v from '@atcute/lexicons/validations';

import { json } from './response.js';
import { defaultNotFoundHandler, XRPCRouter } from './router.js';
import type { WebSocketAdapter } from './types/websocket.js';
import { InvalidRequestError } from './xrpc-error.js';

describe('XRPCRouter', () => {
	describe('routing', () => {
		it('handles non-XRPC routes', async () => {
			const mock = vi.fn(defaultNotFoundHandler);
			const router = new XRPCRouter({ handleNotFound: mock });

			const request = new Request('http://example.com/hello', { method: 'GET' });
			const response = await router.fetch(request);

			expect(mock).toHaveBeenCalledWith(request);
			expect(response.status).toBe(404);
		});

		it('handles undefined XRPC routes', async () => {
			const mock = vi.fn(defaultNotFoundHandler);
			const router = new XRPCRouter({ handleNotFound: mock });

			const request = new Request('http://example.com/xrpc/com.example.query', { method: 'GET' });
			const response = await router.fetch(request);

			expect(mock).toHaveBeenCalledWith(request);
			expect(response.status).toBe(404);
		});

		it('forbids incorrect HTTP method', async () => {
			const querySchema = v.query('com.example.query', {
				params: null,
				output: null,
			});

			const procedureSchema = v.procedure('com.example.procedure', {
				params: null,
				input: null,
				output: null,
			});

			const router = new XRPCRouter();
			router.addQuery(querySchema, { handler: vi.fn() });
			router.addProcedure(procedureSchema, { handler: vi.fn() });

			{
				const request = new Request('https://example.com/xrpc/com.example.query', { method: 'POST' });
				const response = await router.fetch(request);

				expect(response.status).toBe(405);
			}

			{
				const request = new Request('https://example.com/xrpc/com.example.procedure', { method: 'GET' });
				const response = await router.fetch(request);

				expect(response.status).toBe(405);
			}
		});
	});

	describe('query', () => {
		it('handles queries with no params', async () => {
			const querySchema = v.query('com.example.query', {
				params: null,
				output: null,
			});

			const router = new XRPCRouter();
			router.addQuery(querySchema, { handler: vi.fn() });

			{
				const request = new Request('https://example.com/xrpc/com.example.query', { method: 'GET' });
				const response = await router.fetch(request);

				expect(response.status).toBe(200);
			}

			// permits any unknown parameters
			{
				const request = new Request('https://example.com/xrpc/com.example.query?cursor=123', {
					method: 'GET',
				});

				const response = await router.fetch(request);

				expect(response.status).toBe(200);
			}
		});

		it('handles queries with params', async () => {
			const querySchema = v.query('com.example.query', {
				params: v.object({
					repo: v.didString(),
					limit: v.optional(v.integer(), 50),
					reverse: v.optional(v.boolean()),
				}),
				output: null,
			});

			const mock = vi.fn();

			const router = new XRPCRouter();
			router.addQuery(querySchema, { handler: mock });

			{
				const request = new Request('https://example.com/xrpc/com.example.query', { method: 'GET' });
				const response = await router.fetch(request);

				expect(response.status).toBe(400);
				expect(mock).not.toHaveBeenCalled();

				expect(await response.json()).toEqual({
					error: 'InvalidRequest',
					message: 'invalid params: missing_value at .repo (missing value)',
					'net.kelinci.atcute.issues': [{ code: 'missing_value', path: ['repo'] }],
				});
			}

			mock.mockClear();

			{
				const request = new Request('https://example.com/xrpc/com.example.query?repo=did:web:example.com', {
					method: 'GET',
				});
				const response = await router.fetch(request);

				expect(response.status).toBe(200);
				expect(mock).toHaveBeenCalledExactlyOnceWith({
					request,
					params: {
						repo: 'did:web:example.com',
						limit: 50,
					},
				});
			}

			mock.mockClear();

			{
				const request = new Request(
					'https://example.com/xrpc/com.example.query?repo=did:web:example.com&limit=100&reverse=true',
					{ method: 'GET' },
				);
				const response = await router.fetch(request);

				expect(response.status).toBe(200);
				expect(mock).toHaveBeenCalledExactlyOnceWith({
					request,
					params: {
						repo: 'did:web:example.com',
						limit: 100,
						reverse: true,
					},
				});
			}

			mock.mockClear();

			{
				const request = new Request(
					'https://example.com/xrpc/com.example.query?repo=did:web:example.com&limit=invalid&reverse=invalid',
					{ method: 'GET' },
				);
				const response = await router.fetch(request);

				expect(response.status).toBe(400);
				expect(mock).not.toHaveBeenCalled();

				expect(await response.json()).toEqual({
					error: 'InvalidRequest',
					message: 'invalid params: invalid_type at .limit (expected integer) (+1 other issue(s))',
					'net.kelinci.atcute.issues': [
						{ code: 'invalid_type', expected: 'integer', path: ['limit'] },
						{ code: 'invalid_type', expected: 'boolean', path: ['reverse'] },
					],
				});
			}

			mock.mockClear();

			{
				const request = new Request(
					'https://example.com/xrpc/com.example.query?repo=did:web:example.com&limit=100&limit=200',
					{ method: 'GET' },
				);
				const response = await router.fetch(request);

				expect(response.status).toBe(400);
				expect(mock).not.toHaveBeenCalled();

				expect(await response.json()).toEqual({
					error: 'InvalidRequest',
					message: 'invalid params: invalid_type at .limit (expected integer)',
					'net.kelinci.atcute.issues': [{ code: 'invalid_type', expected: 'integer', path: ['limit'] }],
				});
			}
		});

		it('handles queries returning json', async () => {
			const querySchema = v.query('com.example.query', {
				params: null,
				output: {
					type: 'lex',
					schema: v.object({
						did: v.didString(),
					}),
				},
			});

			const router = new XRPCRouter();
			router.addQuery(querySchema, {
				async handler() {
					return json({ did: 'did:web:example.com' });
				},
			});

			const request = new Request('https://example.com/xrpc/com.example.query', { method: 'GET' });
			const response = await router.fetch(request);

			expect(response.status).toBe(200);

			expect(await response.json()).toEqual({
				did: 'did:web:example.com',
			});
		});

		it('handles queries throwing', async () => {
			const querySchema = v.query('com.example.query', {
				params: null,
				output: null,
			});

			const router = new XRPCRouter();

			{
				router.addQuery(querySchema, {
					async handler() {
						throw new InvalidRequestError({ description: 'invalid user' });
					},
				});

				const request = new Request('https://example.com/xrpc/com.example.query', { method: 'GET' });
				const response = await router.fetch(request);

				expect(response.status).toBe(400);

				expect(await response.json()).toEqual({
					error: 'InvalidRequest',
					message: 'invalid user',
				});
			}

			{
				router.addQuery(querySchema, {
					async handler() {
						throw Response.json({ hello: 'world' });
					},
				});

				const request = new Request('https://example.com/xrpc/com.example.query', { method: 'GET' });
				const response = await router.fetch(request);

				expect(response.status).toBe(200);

				expect(await response.json()).toEqual({
					hello: 'world',
				});
			}

			{
				router.addQuery(querySchema, {
					async handler() {
						throw new Error('whoops');
					},
				});

				const request = new Request('https://example.com/xrpc/com.example.query', { method: 'GET' });
				const response = await router.fetch(request);

				expect(response.status).toBe(500);

				expect(await response.json()).toEqual({
					error: 'InternalServerError',
					message: 'an exception happened whilst processing this request',
				});
			}
		});
	});

	describe('procedure', () => {
		it('handles procedures with no params', async () => {
			const procedureSchema = v.procedure('com.example.procedure', {
				params: null,
				input: null,
				output: null,
			});

			const router = new XRPCRouter();
			router.addProcedure(procedureSchema, { handler: vi.fn() });

			{
				const request = new Request('https://example.com/xrpc/com.example.procedure', {
					method: 'POST',
				});

				const response = await router.fetch(request);

				expect(response.status).toBe(200);
			}

			// permits any unknown parameters
			{
				const request = new Request('https://example.com/xrpc/com.example.procedure?cursor=123', {
					method: 'POST',
				});

				const response = await router.fetch(request);

				expect(response.status).toBe(200);
			}
		});

		it('handles procedures with params', async () => {
			const procedureSchema = v.procedure('com.example.procedure', {
				params: v.object({
					dids: v.constrain(v.array(v.didString()), [v.arrayLength(1)]),
					limit: v.optional(v.integer(), 50),
					reverse: v.optional(v.boolean()),
				}),
				input: null,
				output: null,
			});

			const mock = vi.fn();

			const router = new XRPCRouter();
			router.addProcedure(procedureSchema, { handler: mock });

			{
				const request = new Request('https://example.com/xrpc/com.example.procedure', { method: 'POST' });
				const response = await router.fetch(request);

				expect(response.status).toBe(400);
				expect(mock).not.toHaveBeenCalled();

				expect(await response.json()).toEqual({
					error: 'InvalidRequest',
					message: 'invalid params: invalid_array_length at .dids (expected an array at least 1 item(s))',
					'net.kelinci.atcute.issues': [
						{ code: 'invalid_array_length', maxLength: null, minLength: 1, path: ['dids'] },
					],
				});
			}

			mock.mockClear();

			{
				const request = new Request(
					'https://example.com/xrpc/com.example.procedure?dids=did:web:example.com',
					{ method: 'POST' },
				);

				const response = await router.fetch(request);

				expect(response.status).toBe(200);
				expect(mock).toHaveBeenCalledExactlyOnceWith({
					request,
					params: {
						dids: ['did:web:example.com'],
						limit: 50,
					},
				});
			}

			mock.mockClear();

			{
				const request = new Request(
					'https://example.com/xrpc/com.example.procedure?dids=did:web:example.com&limit=100&reverse=true',
					{ method: 'POST' },
				);
				const response = await router.fetch(request);

				expect(response.status).toBe(200);
				expect(mock).toHaveBeenCalledExactlyOnceWith({
					request,
					params: {
						dids: ['did:web:example.com'],
						limit: 100,
						reverse: true,
					},
				});
			}

			mock.mockClear();

			{
				const request = new Request(
					'https://example.com/xrpc/com.example.procedure?dids=did:web:example.com&limit=invalid&reverse=invalid',
					{ method: 'POST' },
				);
				const response = await router.fetch(request);

				expect(response.status).toBe(400);
				expect(mock).not.toHaveBeenCalled();

				expect(await response.json()).toEqual({
					error: 'InvalidRequest',
					message: 'invalid params: invalid_type at .limit (expected integer) (+1 other issue(s))',
					'net.kelinci.atcute.issues': [
						{ code: 'invalid_type', expected: 'integer', path: ['limit'] },
						{ code: 'invalid_type', expected: 'boolean', path: ['reverse'] },
					],
				});
			}

			mock.mockClear();

			{
				const request = new Request(
					'https://example.com/xrpc/com.example.procedure?dids=did:web:example.com&limit=100&limit=200',
					{ method: 'POST' },
				);
				const response = await router.fetch(request);

				expect(response.status).toBe(400);
				expect(mock).not.toHaveBeenCalled();

				expect(await response.json()).toEqual({
					error: 'InvalidRequest',
					message: 'invalid params: invalid_type at .limit (expected integer)',
					'net.kelinci.atcute.issues': [{ code: 'invalid_type', expected: 'integer', path: ['limit'] }],
				});
			}
		});

		it('handles procedures receiving but not accepting input', async () => {
			const procedureSchema = v.procedure('com.example.procedure', {
				params: null,
				input: null,
				output: null,
			});

			const mock = vi.fn();

			const router = new XRPCRouter();
			router.addProcedure(procedureSchema, { handler: mock });

			{
				const request = new Request('https://example.com/xrpc/com.example.procedure', {
					method: 'POST',
				});

				const response = await router.fetch(request);

				expect(response.status).toBe(200);
				expect(mock).toHaveBeenCalledOnce();
			}

			mock.mockClear();

			{
				const request = new Request('https://example.com/xrpc/com.example.procedure', {
					method: 'POST',
					body: Uint8Array.from([1, 2, 3, 4]),
				});

				const response = await router.fetch(request);

				expect(response.status).toBe(400);
				expect(mock).not.toHaveBeenCalled();

				expect(await response.json()).toEqual({
					error: 'InvalidRequest',
					message: 'request body is provided when none was expected',
				});
			}

			mock.mockClear();

			{
				const request = new Request('https://example.com/xrpc/com.example.procedure', {
					method: 'POST',
					body: JSON.stringify({ hello: 'world' }),
				});

				const response = await router.fetch(request);

				expect(response.status).toBe(400);
				expect(mock).not.toHaveBeenCalled();

				expect(await response.json()).toEqual({
					error: 'InvalidRequest',
					message: 'request body is provided when none was expected',
				});
			}
		});

		it('handles procedures accepting json input', async () => {
			const procedureSchema = v.procedure('com.example.procedure', {
				params: null,
				input: {
					type: 'lex',
					schema: v.object({
						did: v.didString(),
					}),
				},
				output: null,
			});

			const mock = vi.fn();

			const router = new XRPCRouter();
			router.addProcedure(procedureSchema, { handler: mock });

			{
				const request = new Request('https://example.com/xrpc/com.example.procedure', { method: 'POST' });

				const response = await router.fetch(request);

				expect(response.status).toBe(400);
				expect(mock).not.toHaveBeenCalled();

				expect(await response.json()).toEqual({
					error: 'InvalidRequest',
					message: 'request body is expected but none was provided',
				});
			}

			mock.mockClear();

			{
				const request = new Request('https://example.com/xrpc/com.example.procedure', {
					method: 'POST',
					body: `{"did":"did:web:example.com"}`,
				});

				const response = await router.fetch(request);

				expect(response.status).toBe(400);
				expect(mock).not.toHaveBeenCalled();

				expect(await response.json()).toEqual({
					error: 'InvalidRequest',
					message: 'invalid input content type (expected application/json)',
				});
			}

			mock.mockClear();

			{
				const request = new Request('https://example.com/xrpc/com.example.procedure', {
					method: 'POST',
					body: new TextEncoder().encode(`{"did":"did:web:example.com"}`),
				});

				const response = await router.fetch(request);

				expect(response.status).toBe(400);
				expect(mock).not.toHaveBeenCalled();

				expect(await response.json()).toEqual({
					error: 'InvalidRequest',
					message: 'missing input content type (expected application/json)',
				});
			}

			mock.mockClear();

			{
				const request = new Request('https://example.com/xrpc/com.example.procedure', {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: `{"did":}`,
				});

				const response = await router.fetch(request);

				expect(response.status).toBe(400);
				expect(mock).not.toHaveBeenCalled();

				expect(await response.json()).toEqual({
					error: 'InvalidRequest',
					message: 'invalid request body (failed to parse json)',
				});
			}

			mock.mockClear();

			{
				const request = new Request('https://example.com/xrpc/com.example.procedure', {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: `{"did":"invalid"}`,
				});

				const response = await router.fetch(request);

				expect(response.status).toBe(400);
				expect(mock).not.toHaveBeenCalled();

				expect(await response.json()).toEqual({
					error: 'InvalidRequest',
					message: 'invalid input: invalid_string_format at .did (expected a did formatted string)',
					'net.kelinci.atcute.issues': [{ code: 'invalid_string_format', expected: 'did', path: ['did'] }],
				});
			}

			mock.mockClear();

			{
				const request = new Request('https://example.com/xrpc/com.example.procedure', {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: `{"did":"did:web:example.com"}`,
				});

				const response = await router.fetch(request);

				expect(response.status).toBe(200);
				expect(mock).toHaveBeenCalledExactlyOnceWith({
					request: request,
					params: {},
					input: {
						did: 'did:web:example.com',
					},
				});
			}
		});

		it('handles procedures accepting any blob input', async () => {
			const procedureSchema = v.procedure('com.example.procedure', {
				params: null,
				input: {
					type: 'blob',
				},
				output: null,
			});

			const mock = vi.fn();

			const router = new XRPCRouter();
			router.addProcedure(procedureSchema, { handler: mock });

			{
				const request = new Request('https://example.com/xrpc/com.example.procedure', { method: 'POST' });

				const response = await router.fetch(request);

				expect(response.status).toBe(400);
				expect(mock).not.toHaveBeenCalled();

				expect(await response.json()).toEqual({
					error: 'InvalidRequest',
					message: 'request body is expected but none was provided',
				});
			}

			mock.mockClear();

			{
				const request = new Request('https://example.com/xrpc/com.example.procedure', {
					method: 'POST',
					headers: { 'content-type': 'application/vnd.ipld.car' },
					body: `hello world`,
				});

				const response = await router.fetch(request);

				expect(response.status).toBe(200);
				expect(mock).toHaveBeenCalledExactlyOnceWith({
					request: request,
					params: {},
					input: undefined,
				});
			}
		});

		it('handles procedures accepting specific blob input', async () => {
			const procedureSchema = v.procedure('com.example.procedure', {
				params: null,
				input: {
					type: 'blob',
					encoding: ['application/vnd.ipld.car'],
				},
				output: null,
			});

			const mock = vi.fn();

			const router = new XRPCRouter();
			router.addProcedure(procedureSchema, { handler: mock });

			{
				const request = new Request('https://example.com/xrpc/com.example.procedure', { method: 'POST' });

				const response = await router.fetch(request);

				expect(response.status).toBe(400);
				expect(mock).not.toHaveBeenCalled();

				expect(await response.json()).toEqual({
					error: 'InvalidRequest',
					message: 'request body is expected but none was provided',
				});
			}

			mock.mockClear();

			{
				const request = new Request('https://example.com/xrpc/com.example.procedure', {
					method: 'POST',
					body: `hello world`,
				});

				const response = await router.fetch(request);

				expect(response.status).toBe(400);
				expect(mock).not.toHaveBeenCalled();

				expect(await response.json()).toEqual({
					error: 'InvalidRequest',
					message: 'invalid input content type (expected application/vnd.ipld.car)',
				});
			}

			mock.mockClear();

			{
				const request = new Request('https://example.com/xrpc/com.example.procedure', {
					method: 'POST',
					body: new TextEncoder().encode(`hello world`),
				});

				const response = await router.fetch(request);

				expect(response.status).toBe(400);
				expect(mock).not.toHaveBeenCalled();

				expect(await response.json()).toEqual({
					error: 'InvalidRequest',
					message: 'missing input content type (expected application/vnd.ipld.car)',
				});
			}

			mock.mockClear();

			{
				const request = new Request('https://example.com/xrpc/com.example.procedure', {
					method: 'POST',
					headers: { 'content-type': 'application/vnd.ipld.car' },
					body: `hello world`,
				});

				const response = await router.fetch(request);

				expect(response.status).toBe(200);
				expect(mock).toHaveBeenCalledExactlyOnceWith({
					request: request,
					params: {},
					input: undefined,
				});
			}
		});

		it('handles procedures returning json', async () => {
			const procedureSchema = v.procedure('com.example.procedure', {
				params: null,
				input: null,
				output: {
					type: 'lex',
					schema: v.object({
						did: v.didString(),
					}),
				},
			});

			const router = new XRPCRouter();
			router.addProcedure(procedureSchema, {
				async handler() {
					return json({ did: 'did:web:example.com' });
				},
			});

			const request = new Request('https://example.com/xrpc/com.example.procedure', { method: 'POST' });
			const response = await router.fetch(request);

			expect(response.status).toBe(200);

			expect(await response.json()).toEqual({
				did: 'did:web:example.com',
			});
		});

		it('handles procedures throwing', async () => {
			const procedureSchema = v.procedure('com.example.procedure', {
				params: null,
				input: null,
				output: null,
			});

			const router = new XRPCRouter();

			{
				router.addProcedure(procedureSchema, {
					async handler() {
						throw new InvalidRequestError({ description: 'invalid user' });
					},
				});

				const request = new Request('https://example.com/xrpc/com.example.procedure', { method: 'POST' });
				const response = await router.fetch(request);

				expect(response.status).toBe(400);

				expect(await response.json()).toEqual({
					error: 'InvalidRequest',
					message: 'invalid user',
				});
			}

			{
				router.addProcedure(procedureSchema, {
					async handler() {
						throw Response.json({ hello: 'world' });
					},
				});

				const request = new Request('https://example.com/xrpc/com.example.procedure', { method: 'POST' });
				const response = await router.fetch(request);

				expect(response.status).toBe(200);

				expect(await response.json()).toEqual({
					hello: 'world',
				});
			}

			{
				router.addProcedure(procedureSchema, {
					async handler() {
						throw new Error('whoops');
					},
				});

				const request = new Request('https://example.com/xrpc/com.example.procedure', { method: 'POST' });
				const response = await router.fetch(request);

				expect(response.status).toBe(500);

				expect(await response.json()).toEqual({
					error: 'InternalServerError',
					message: 'an exception happened whilst processing this request',
				});
			}
		});
	});

	// we won't be testing actual subscriptions here
	describe('subscription', () => {
		const noopAdapter: WebSocketAdapter = {
			async upgrade(_request, _handler) {
				return undefined;
			},
		};

		it('handles defining subscriptions', () => {
			const subscriptionSchema = v.subscription('com.example.subscription', {
				params: null,
				message: v.object({ random: v.integer() }),
			});

			const router = new XRPCRouter({ websocket: noopAdapter });

			router.addSubscription(subscriptionSchema, {
				async *handler() {
					yield { random: 123 };
				},
			});
		});

		it('handles defining subscriptions with variants', () => {
			const subscriptionSchema = v.subscription('com.example.subscription', {
				params: null,
				message: v.variant([
					v.object({ $type: v.literal('foo'), foo: v.string() }),
					v.object({ $type: v.literal('bar'), bar: v.integer() }),
				]),
			});

			const router = new XRPCRouter({ websocket: noopAdapter });

			router.addSubscription(subscriptionSchema, {
				async *handler() {
					yield { $type: 'foo', foo: '123' };
				},
			});
		});
	});
});
