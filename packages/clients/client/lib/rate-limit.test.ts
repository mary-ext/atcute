import { describe, expect, it, vi } from 'vitest';

import type { FetchHandler } from './fetch-handler.ts';
import { parseRateLimitHeaders, retryFetchHandler } from './rate-limit.ts';

describe('parseRateLimitHeaders', () => {
	it('parses well-formed headers', () => {
		const headers = new Headers({
			'ratelimit-limit': '3000',
			'ratelimit-remaining': '2999',
			'ratelimit-reset': '1700000000',
			'ratelimit-policy': '3000;w=300',
		});

		expect(parseRateLimitHeaders(headers)).toEqual({
			limit: 3000,
			remaining: 2999,
			reset: new Date(1700000000 * 1000),
			policy: '3000;w=300',
		});
	});

	it('returns null policy when absent', () => {
		const headers = new Headers({
			'ratelimit-limit': '3000',
			'ratelimit-remaining': '0',
			'ratelimit-reset': '1700000000',
		});

		expect(parseRateLimitHeaders(headers)?.policy).toBeNull();
	});

	it('returns null when a required header is missing', () => {
		const headers = new Headers({
			'ratelimit-limit': '3000',
			'ratelimit-remaining': '2999',
		});

		expect(parseRateLimitHeaders(headers)).toBeNull();
	});

	it('returns null on malformed values', () => {
		const headers = new Headers({
			'ratelimit-limit': 'lots',
			'ratelimit-remaining': '2999',
			'ratelimit-reset': '1700000000',
		});

		expect(parseRateLimitHeaders(headers)).toBeNull();
	});
});

const rateLimited = () => new Response('rate limited', { status: 429, headers: { 'retry-after': '0' } });
const ok = () => new Response('ok', { status: 200 });

describe('retryFetchHandler', () => {
	it('retries 429 responses and returns the eventual success', async () => {
		const inner = vi
			.fn<FetchHandler>()
			.mockResolvedValueOnce(rateLimited())
			.mockResolvedValueOnce(rateLimited())
			.mockResolvedValueOnce(ok());

		const handler = retryFetchHandler({ handler: inner });
		const response = await handler('/xrpc/com.atproto.repo.createRecord', { method: 'post' });

		expect(response.status).toBe(200);
		expect(inner).toHaveBeenCalledTimes(3);
	});

	it('gives up after maxRetries and returns the last response', async () => {
		const inner = vi.fn<FetchHandler>().mockResolvedValue(rateLimited());

		const handler = retryFetchHandler({ handler: inner, maxRetries: 2 });
		const response = await handler('/xrpc/com.atproto.repo.createRecord', { method: 'post' });

		expect(response.status).toBe(429);
		expect(inner).toHaveBeenCalledTimes(3);
	});

	it('does not retry successful responses', async () => {
		const inner = vi.fn<FetchHandler>().mockResolvedValue(ok());

		const handler = retryFetchHandler({ handler: inner });
		await handler('/xrpc/com.atproto.repo.getRecord', { method: 'get' });

		expect(inner).toHaveBeenCalledTimes(1);
	});

	it('does not retry requests with a streamed body', async () => {
		const inner = vi.fn<FetchHandler>().mockResolvedValue(rateLimited());

		const handler = retryFetchHandler({ handler: inner });
		const body = new ReadableStream<Uint8Array>();
		const response = await handler('/xrpc/com.atproto.repo.uploadBlob', { method: 'post', body });

		expect(response.status).toBe(429);
		expect(inner).toHaveBeenCalledTimes(1);
	});

	it('does not retry without a timing signal when fallbackDelay is null', async () => {
		const inner = vi.fn<FetchHandler>().mockResolvedValue(new Response('rate limited', { status: 429 }));

		const handler = retryFetchHandler({ handler: inner, fallbackDelay: null });
		const response = await handler('/xrpc/com.atproto.repo.getRecord', { method: 'get' });

		expect(response.status).toBe(429);
		expect(inner).toHaveBeenCalledTimes(1);
	});

	it('still retries on a timing signal when fallbackDelay is null', async () => {
		const inner = vi
			.fn<FetchHandler>()
			.mockResolvedValueOnce(new Response('rate limited', { status: 429, headers: { 'retry-after': '0' } }))
			.mockResolvedValueOnce(ok());

		const handler = retryFetchHandler({ handler: inner, fallbackDelay: null });
		const response = await handler('/xrpc/com.atproto.repo.getRecord', { method: 'get' });

		expect(response.status).toBe(200);
		expect(inner).toHaveBeenCalledTimes(2);
	});

	it('gives up when an authoritative delay exceeds maxDelay', async () => {
		const inner = vi
			.fn<FetchHandler>()
			.mockResolvedValue(new Response('rate limited', { status: 429, headers: { 'retry-after': '300' } }));

		const handler = retryFetchHandler({ handler: inner, maxDelay: 60_000 });
		const response = await handler('/xrpc/com.atproto.repo.getRecord', { method: 'get' });

		expect(response.status).toBe(429);
		expect(inner).toHaveBeenCalledTimes(1);
	});

	it('honors a custom shouldRetry predicate', async () => {
		const inner = vi
			.fn<FetchHandler>()
			.mockResolvedValueOnce(new Response('unavailable', { status: 503, headers: { 'retry-after': '0' } }))
			.mockResolvedValueOnce(ok());

		const handler = retryFetchHandler({
			handler: inner,
			shouldRetry: (response) => response.status === 503,
		});
		const response = await handler('/xrpc/com.atproto.repo.getRecord', { method: 'get' });

		expect(response.status).toBe(200);
		expect(inner).toHaveBeenCalledTimes(2);
	});

	it('reports the delay through onRetry', async () => {
		const inner = vi.fn<FetchHandler>().mockResolvedValueOnce(rateLimited()).mockResolvedValueOnce(ok());

		const onRetry = vi.fn();
		const handler = retryFetchHandler({ handler: inner, onRetry });
		await handler('/xrpc/com.atproto.repo.getRecord', { method: 'get' });

		expect(onRetry).toHaveBeenCalledTimes(1);
		expect(onRetry).toHaveBeenCalledWith(expect.any(Response), 0, 0);
	});

	it('aborts a pending retry when the signal fires', async () => {
		const inner = vi
			.fn<FetchHandler>()
			.mockResolvedValue(new Response('rate limited', { status: 429, headers: { 'retry-after': '30' } }));

		const controller = new AbortController();
		const handler = retryFetchHandler({ handler: inner });
		const promise = handler('/xrpc/com.atproto.repo.getRecord', { method: 'get', signal: controller.signal });

		controller.abort(new Error('aborted'));

		await expect(promise).rejects.toThrow('aborted');
		expect(inner).toHaveBeenCalledTimes(1);
	});
});
