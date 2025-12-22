import { describe, expect, it, vi } from 'vitest';

import * as v from '@atcute/lexicons/validations';

import { createXrpcHandler } from './xrpc-handler.js';

describe('createXrpcHandler', () => {
	it('handles query requests', async () => {
		const querySchema = v.query('com.example.query', {
			params: v.object({
				repo: v.didString(),
				limit: v.optional(v.integer(), 50),
			}),
			output: null,
		});

		const mock = vi.fn();

		const fetch = createXrpcHandler({
			lxm: querySchema,
			handler: mock,
		});

		const request = new Request(
			'https://example.com/xrpc/com.example.query?repo=did:web:example.com&limit=10',
			{ method: 'GET' },
		);
		const response = await fetch(request);

		expect(response.status).toBe(200);
		expect(mock).toHaveBeenCalledExactlyOnceWith({
			request,
			params: {
				repo: 'did:web:example.com',
				limit: 10,
			},
		});
	});

	it('handles namespaced query schemas', async () => {
		const querySchema = v.query('com.example.query', {
			params: v.object({
				repo: v.didString(),
				limit: v.optional(v.integer(), 50),
			}),
			output: null,
		});

		const mock = vi.fn();

		const fetch = createXrpcHandler({
			lxm: { mainSchema: querySchema },
			handler: mock,
		});

		const request = new Request(
			'https://example.com/xrpc/com.example.query?repo=did:web:example.com&limit=10',
			{ method: 'GET' },
		);
		const response = await fetch(request);

		expect(response.status).toBe(200);
		expect(mock).toHaveBeenCalledExactlyOnceWith({
			request,
			params: {
				repo: 'did:web:example.com',
				limit: 10,
			},
		});
	});

	it('handles procedure requests', async () => {
		const procedureSchema = v.procedure('com.example.procedure', {
			params: null,
			input: {
				type: 'lex',
				schema: v.object({
					text: v.string(),
				}),
			},
			output: null,
		});

		const mock = vi.fn();

		const fetch = createXrpcHandler({
			lxm: procedureSchema,
			handler: mock,
		});

		const request = new Request('https://example.com/xrpc/com.example.procedure', {
			method: 'POST',
			body: JSON.stringify({ text: 'hello' }),
			headers: {
				'content-type': 'application/json',
			},
		});
		const response = await fetch(request);

		expect(response.status).toBe(200);
		expect(mock).toHaveBeenCalledExactlyOnceWith({
			request,
			params: {},
			input: { text: 'hello' },
		});
	});

	it('rejects procedures with missing bodies', async () => {
		const procedureSchema = v.procedure('com.example.procedure', {
			params: null,
			input: {
				type: 'lex',
				schema: v.object({
					text: v.string(),
				}),
			},
			output: null,
		});

		const mock = vi.fn();

		const fetch = createXrpcHandler({
			lxm: procedureSchema,
			handler: mock,
		});

		const request = new Request('https://example.com/xrpc/com.example.procedure', {
			method: 'POST',
		});
		const response = await fetch(request);

		expect(response.status).toBe(400);
		expect(mock).not.toHaveBeenCalled();
	});
});
