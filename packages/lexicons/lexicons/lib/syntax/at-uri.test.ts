import { describe, expect, it } from 'vitest';

import {
	isCanonicalResourceUri,
	isResourceUri,
	parseCanonicalResourceUri,
	parseResourceUri,
} from './at-uri.ts';

describe('resourceUri validation', () => {
	it('validates at-uri', () => {
		const validCases = [
			// enforces spec basics
			'at://did:plc:asdf123',
			'at://user.bsky.social',
			'at://did:plc:asdf123/com.atproto.feed.post',
			'at://did:plc:asdf123/com.atproto.feed.post/record',

			// very long: 'at://did:plc:asdf123/com.atproto.feed.post/' + 'o'.repeat(512)
			'at://did:plc:asdf123/com.atproto.feed.post/' + 'o'.repeat(512),

			// enforces no trailing slashes
			'at://did:plc:asdf123',
			'at://user.bsky.social',
			'at://did:plc:asdf123/com.atproto.feed.post',
			'at://did:plc:asdf123/com.atproto.feed.post/record',

			// enforces strict paths
			'at://did:plc:asdf123/com.atproto.feed.post/asdf123',

			// is very permissive about record keys
			'at://did:plc:asdf123/com.atproto.feed.post/asdf123',
			'at://did:plc:asdf123/com.atproto.feed.post/a',

			'at://did:plc:asdf123/com.atproto.feed.post/asdf-123',
			'at://did:abc:123',
			'at://did:abc:123/io.nsid.someFunc/record-key',

			'at://did:abc:123/io.nsid.someFunc/self.',
			'at://did:abc:123/io.nsid.someFunc/lang:',
			'at://did:abc:123/io.nsid.someFunc/:',
			'at://did:abc:123/io.nsid.someFunc/-',
			'at://did:abc:123/io.nsid.someFunc/_',
			'at://did:abc:123/io.nsid.someFunc/~',
			'at://did:abc:123/io.nsid.someFunc/...',
			'at://did:plc:asdf123/com.atproto.feed.postV2',
		];
		for (const str of validCases) {
			expect(isResourceUri(str), str).toBe(true);
			expect(() => parseResourceUri(str), str).not.toThrow();
		}

		const invalidCases = [
			// enforces spec basics
			'a://did:plc:asdf123',
			'at//did:plc:asdf123',
			'at:/a/did:plc:asdf123',
			'at:/did:plc:asdf123',
			'AT://did:plc:asdf123',
			'http://did:plc:asdf123',
			'://did:plc:asdf123',
			'at:did:plc:asdf123',
			'at:/did:plc:asdf123',
			'at:///did:plc:asdf123',
			'at://:/did:plc:asdf123',
			'at:/ /did:plc:asdf123',
			'at://did:plc:asdf123 ',
			'at://did:plc:asdf123/ ',
			' at://did:plc:asdf123',
			'at://did:plc:asdf123/com.atproto.feed.post ',
			'at://did:plc:asdf123/com.atproto.feed.post# ',
			'at://did:plc:asdf123/com.atproto.feed.post#/ ',
			'at://did:plc:asdf123/com.atproto.feed.post#/frag ',
			'at://did:plc:asdf123/com.atproto.feed.post#fr ag',
			'//did:plc:asdf123',
			'at://name',
			'at://name.0',
			'at://diD:plc:asdf123',
			'at://did:plc:asdf123/com.atproto.feed.p@st',
			'at://did:plc:asdf123/com.atproto.feed.p$st',
			'at://did:plc:asdf123/com.atproto.feed.p%st',
			'at://did:plc:asdf123/com.atproto.feed.p&st',
			'at://did:plc:asdf123/com.atproto.feed.p()t',
			'at://did:plc:asdf123/com.atproto.feed_post',
			'at://did:plc:asdf123/-com.atproto.feed.post',
			'at://did:plc:asdf@123/com.atproto.feed.post',
			'at://DID:plc:asdf123',
			'at://user.bsky.123',
			'at://bsky',
			'at://did:plc:',
			'at://frag',
			// too long: 'at://did:plc:asdf123/com.atproto.feed.post/' + 'o'.repeat(8200)
			'at://did:plc:asdf123/com.atproto.feed.post/' + 'o'.repeat(8200),
			// enforces no trailing slashes
			'at://did:plc:asdf123/',
			'at://user.bsky.social/',
			'at://did:plc:asdf123/com.atproto.feed.post/',
			'at://did:plc:asdf123/com.atproto.feed.post/record/',
			'at://did:plc:asdf123/com.atproto.feed.post/record/#/frag',
			// disallow dot / double-dot
			'at://did:plc:asdf123/com.atproto.feed.post/.',
			'at://did:plc:asdf123/com.atproto.feed.post/..',

			'at://did::',
		];
		for (const str of invalidCases) {
			expect(isResourceUri(str), str).toBe(false);
			expect(() => parseResourceUri(str), str).toThrow();
		}

		expect(isResourceUri(null)).toBe(false);
	});

	it('parses valid at-uris', () => {
		const result = parseResourceUri('at://did:plc:asdf123/com.atproto.feed.post/record');

		expect(result).toEqual({
			repo: 'did:plc:asdf123',
			collection: 'com.atproto.feed.post',
			rkey: 'record',
			fragment: undefined,
		});
	});

	it('parses at-uri with fragment', () => {
		const result = parseResourceUri('at://did:plc:asdf123/com.atproto.feed.post/record#/fragment');

		expect(result).toEqual({
			repo: 'did:plc:asdf123',
			collection: 'com.atproto.feed.post',
			rkey: 'record',
			fragment: '/fragment',
		});
	});

	it('returns error for invalid at-uri', () => {
		expect(() => parseResourceUri('invalid-uri')).toThrowErrorMatchingInlineSnapshot(
			`[SyntaxError: invalid at-uri: invalid-uri]`,
		);
	});
});

describe('canonicalResourceUri validation', () => {
	it('validates canonical at-uri', () => {
		const validCases = [
			'at://did:plc:asdf123/com.atproto.feed.post/record',
			'at://did:web:example.com/com.example.test/key123',
		];
		for (const str of validCases) {
			expect(isCanonicalResourceUri(str), str).toBe(true);

			expect(() => parseCanonicalResourceUri(str), str).not.toThrow();
		}

		const invalidCases = [
			'invalid',
			'at://user.bsky.social/com.atproto.feed.post/record', // handle instead of DID
			'at://did:plc:asdf123/com.atproto.feed.post', // missing rkey
			'at://did:plc:asdf123', // missing collection and rkey
			'at://did:plc:asdf123/com.atproto.feed.post/record#', // fragments are not canonical
			'at://did:plc:asdf123/com.atproto.feed.post/record#/frag',
			'at://did:plc:asdf123/com.atproto.feed.post/record#bad',
		];
		for (const str of invalidCases) {
			expect(isCanonicalResourceUri(str), str).toBe(false);

			expect(() => parseCanonicalResourceUri(str), str).toThrow();
		}

		expect(isCanonicalResourceUri(null)).toBe(false);
	});

	it('parses valid canonical at-uris', () => {
		const result = parseCanonicalResourceUri('at://did:plc:asdf123/com.atproto.feed.post/record');

		expect(result).toEqual({
			repo: 'did:plc:asdf123',
			collection: 'com.atproto.feed.post',
			rkey: 'record',
		});
	});

	it('returns error for invalid canonical at-uri', () => {
		expect(() => {
			return parseCanonicalResourceUri('at://user.bsky.social/com.atproto.feed.post/record');
		}).toThrowErrorMatchingInlineSnapshot(
			`[SyntaxError: invalid repo in canonical-at-uri: user.bsky.social]`,
		);
	});
});
