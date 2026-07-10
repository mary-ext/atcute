import { describe, expect, it } from 'vitest';

import { extractEcPrivateScalar } from './utils.ts';

const OID_PRIME256V1 = [0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07];
const OID_SECP256K1 = [0x06, 0x05, 0x2b, 0x81, 0x04, 0x00, 0x0a];
const OID_EC_PUBLIC_KEY = [0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01];

const encodeLength = (n: number): number[] => {
	if (n < 0x80) {
		return [n];
	}

	const octets: number[] = [];
	for (let v = n; v > 0; v >>>= 8) {
		octets.unshift(v & 0xff);
	}

	return [0x80 + octets.length, ...octets];
};

const tlv = (tag: number, ...content: number[][]): number[] => {
	const body = content.flat();
	return [tag, ...encodeLength(body.length), ...body];
};

interface Shape {
	parameters: boolean;
	publicKey: boolean;
}

const buildPkcs8 = (curveOid: number[], scalar: Uint8Array, shape: Shape): Uint8Array<ArrayBuffer> => {
	const point = new Uint8Array(65).fill(0xcc);
	point[0] = 0x04;

	const ecPrivateKey = tlv(
		0x30,
		[0x02, 0x01, 0x01],
		tlv(0x04, [...scalar]),
		...(shape.parameters ? [tlv(0xa0, curveOid)] : []),
		...(shape.publicKey ? [tlv(0xa1, tlv(0x03, [0x00], [...point]))] : []),
	);

	return Uint8Array.from(
		tlv(0x30, [0x02, 0x01, 0x00], tlv(0x30, OID_EC_PUBLIC_KEY, curveOid), tlv(0x04, ecPrivateKey)),
	);
};

const SCALAR = Uint8Array.from({ length: 32 }, (_, i) => i + 1);

const indexOfSequence = (haystack: Uint8Array, needle: Uint8Array): number => {
	for (let i = 0; i <= haystack.length - needle.length; i++) {
		if (needle.every((byte, j) => haystack[i + j] === byte)) {
			return i;
		}
	}

	return -1;
};

describe('extractEcPrivateScalar()', () => {
	// the optional fields trail the scalar, but their presence widens the enclosing length prefixes
	const SHAPES: [name: string, shape: Shape][] = [
		['neither optional field', { parameters: false, publicKey: false }],
		['parameters only', { parameters: true, publicKey: false }],
		['public key only', { parameters: false, publicKey: true }],
		['both optional fields', { parameters: true, publicKey: true }],
	];

	for (const [curve, oid] of [
		['p256', OID_PRIME256V1],
		['secp256k1', OID_SECP256K1],
	] as const) {
		for (const [name, shape] of SHAPES) {
			it(`extracts the ${curve} scalar with ${name}`, () => {
				expect(extractEcPrivateScalar(buildPkcs8(oid, SCALAR, shape), 32)).toEqual(SCALAR);
			});
		}
	}

	it('returns a view, so wiping the scalar also wipes the input', () => {
		const pkcs8 = buildPkcs8(OID_PRIME256V1, SCALAR, { parameters: false, publicKey: true });

		const scalar = extractEcPrivateScalar(pkcs8, 32);
		expect(scalar.buffer).toBe(pkcs8.buffer);
		expect(indexOfSequence(pkcs8, SCALAR)).not.toBe(-1);

		scalar.fill(0);

		expect(indexOfSequence(pkcs8, SCALAR)).toBe(-1);
	});

	it('throws on an unexpected scalar length', () => {
		// trailing fields keep 32 bytes readable, so only the declared length catches this
		const pkcs8 = buildPkcs8(OID_PRIME256V1, SCALAR.subarray(0, 31), { parameters: true, publicKey: true });

		expect(() => extractEcPrivateScalar(pkcs8, 32)).toThrow(SyntaxError);
	});

	it('throws on a truncated key', () => {
		const pkcs8 = buildPkcs8(OID_PRIME256V1, SCALAR, { parameters: false, publicKey: false });

		expect(() => extractEcPrivateScalar(pkcs8.subarray(0, 50), 32)).toThrow(SyntaxError);
	});
});
