import { encode } from '@atcute/cbor';
import type { XRPCSubprotocol } from '@atcute/lexicons/validations';
import { concat } from '@atcute/uint8array';

import { describe, expect, it } from 'vitest';

import { createFrameDecoder } from './frame-decoder.ts';

const nsid = 'com.example.subscribeEvents';

const payload = {
	$type: 'com.example.subscribeEvents#event',
	value: 42,
};

const getFrameDecoder = (subprotocol: XRPCSubprotocol) => createFrameDecoder({ nsid, subprotocol });

const encodeFrame = (value: unknown): ArrayBuffer => {
	return encode(value).slice().buffer;
};

describe('frame decoder', () => {
	it('expands the relative discriminator on xrpc.v0.cbor message frames', () => {
		const decodeFrame = getFrameDecoder('xrpc.v0.cbor');

		expect(
			decodeFrame(concat([encode({ op: 1, t: '#event' }), encode({ value: 42 })]).slice().buffer),
		).toEqual({
			type: 'message',
			body: payload,
		});
	});

	it('keeps an already-qualified discriminator as-is', () => {
		const decodeFrame = getFrameDecoder('xrpc.v0.cbor');

		expect(
			decodeFrame(
				concat([encode({ op: 1, t: 'com.example.other#event' }), encode({ value: 42 })]).slice().buffer,
			),
		).toEqual({
			type: 'message',
			body: { $type: 'com.example.other#event', value: 42 },
		});
	});

	it('leaves the body untouched when the header carries no discriminator', () => {
		const decodeFrame = getFrameDecoder('xrpc.v0.cbor');

		expect(decodeFrame(concat([encode({ op: 1 }), encode({ value: 42 })]).slice().buffer)).toEqual({
			type: 'message',
			body: { value: 42 },
		});
	});

	it('decodes xrpc.v0.cbor error frames', () => {
		const decodeFrame = getFrameDecoder('xrpc.v0.cbor');

		expect(
			decodeFrame(
				concat([encode({ op: -1 }), encode({ error: 'FutureCursor', message: 'too new' })]).slice().buffer,
			),
		).toEqual({
			type: 'error',
			error: 'FutureCursor',
			message: 'too new',
		});
	});

	it('rejects malformed xrpc.v0.cbor frames', () => {
		const decodeFrame = getFrameDecoder('xrpc.v0.cbor');

		expect(() => decodeFrame(encodeFrame(1))).toThrow('invalid v0 frame header');

		expect(() => decodeFrame(concat([encode({ op: 1, t: '#event' }), encode(42)]).slice().buffer)).toThrow(
			'invalid v0 message frame',
		);
		expect(() => decodeFrame(concat([encode({ op: 1 }), encode(null)]).slice().buffer)).toThrow(
			'invalid v0 message frame',
		);
	});

	it.each(['xrpc.v1.cbor', 'xrpc.v1.json'] as const)(
		'passes %s payloads through without touching $type',
		(subprotocol) => {
			const decodeFrame = getFrameDecoder(subprotocol);
			const frame = { $type: 'message', payload };

			expect(
				decodeFrame(subprotocol === 'xrpc.v1.json' ? JSON.stringify(frame) : encodeFrame(frame)),
			).toEqual({
				type: 'message',
				body: payload,
			});
		},
	);

	it('accepts binary frames delivered as a typed array view', () => {
		const decodeFrame = getFrameDecoder('xrpc.v1.cbor');

		expect(decodeFrame(encode({ $type: 'message', payload }))).toEqual({
			type: 'message',
			body: payload,
		});
	});

	it.each([
		['xrpc.v1.cbor', encodeFrame({ $type: 'error', error: 'FutureCursor', message: 'too new' })],
		['xrpc.v1.json', JSON.stringify({ $type: 'error', error: 'FutureCursor', message: 'too new' })],
	] as const)('decodes %s error frames', (subprotocol, frame) => {
		const decodeFrame = getFrameDecoder(subprotocol);

		expect(decodeFrame(frame)).toEqual({
			type: 'error',
			error: 'FutureCursor',
			message: 'too new',
		});
	});

	it('rejects invalid v1 envelopes', () => {
		const decodeFrame = getFrameDecoder('xrpc.v1.json');

		expect(() => decodeFrame(JSON.stringify({ $type: 'message' }))).toThrow('invalid v1 message frame');
		expect(() => decodeFrame(JSON.stringify({ $type: 'message', payload: null }))).toThrow(
			'invalid v1 message frame',
		);
		expect(() => decodeFrame(JSON.stringify({ $type: 'unknown' }))).toThrow('invalid v1 frame type');
	});

	it('rejects frames with the wrong websocket message type', () => {
		expect(() => getFrameDecoder('xrpc.v1.json')(encode({ $type: 'message', payload }))).toThrow(
			'expected a text websocket message',
		);
		expect(() => getFrameDecoder('xrpc.v1.cbor')(JSON.stringify({ $type: 'message', payload }))).toThrow(
			'expected a binary websocket message',
		);
	});
});
