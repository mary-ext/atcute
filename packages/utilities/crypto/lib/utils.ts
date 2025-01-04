import { toBase58Btc } from '@atcute/multibase';
import { concat } from '@atcute/uint8array';

import type { PrivateKey } from './types.js';

// -- Cryptographic commons --

const getSignatureS = (sig: Uint8Array): bigint => {
	// Low-level signature operation; you likely want to use `normalizeSignature` and `isSignatureNormalized` instead.

	// Reference: [1] RFC 7518 JSON Web Algorithms (JWA), § 3.4. Digital Signature with ECDSA -- https://datatracker.ietf.org/doc/html/rfc7518#section-3.4
	// Trivia:    This format is also known as IEEE P1363, however the standard is paid (and inactive).
	// We want the upper-half of the sig, which contains s according to [1]
	let len: number;
	let s = 0n;
	for (let i = 1; i <= (len = sig.length) >> 1; i++) {
		// s is encoded as big-endian; c.f. [1] Point 2.
		s |= BigInt(sig[len - i]) << BigInt(8 * (i - 1));
	}

	return s;
};

const setSignatureS = (sig: Uint8Array, s: bigint): void => {
	// Low-level signature operation; you likely want to use `normalizeSignature` and `isSignatureNormalized` instead.

	// Reference: see getSignatureS
	// We target the upper-half of the sig, which contains s according to [1]
	let len: number;
	for (let i = 1; i <= (len = sig.length) >> 1; i++) {
		// s is encoded as big-endian; c.f. [1] Point 2.
		sig[len - i] = Number((s >> BigInt(8 * (i - 1))) & 0xffn);
	}
};

export const isSignatureNormalized = (sig: Uint8Array, curveOrder: bigint): boolean => {
	// Reference: Bitcoin BIP 0146 -- https://github.com/bitcoin/bips/blob/665712c/bip-0146.mediawiki#low_s
	// Note: Upper bound is inclusive.
	return getSignatureS(sig) <= curveOrder >> 1n;
};

export const normalizeSignature = (sig: Uint8Array, curveOrder: bigint): Uint8Array => {
	// Reference: [1] Bitcoin BIP 0146 -- https://github.com/bitcoin/bips/blob/665712c/bip-0146.mediawiki#low_s
	//            [2] SEC 1, ver. 2.0, § 4.1.3 Signing Operation -- https://www.secg.org/sec1-v2.pdf

	// 1. Retrieve the s value of the (r, s) pair.
	const s = getSignatureS(sig);

	// 2. Check if s is greater than half of the curve order.
	//    IF it is (sig is high-S as defined in [1]), then normalize it to low-S as defined in [1].
	// Note: Upper bound is inclusive.
	if (s > curveOrder >> 1n) {
		// [2] "The signer may replace (r, s) with (r, −s mod n), because this is an equivalent signature."
		// Stmt: Given `s > N / 2`, s is valid; then `-s mod N` is trivially equivalent to `N - s`.
		setSignatureS(sig, curveOrder - s);
	}

	// Return the signature to save the need for an extra reference when calling this function.
	return sig;
};

export const compressPoint = (coords: Uint8Array): Uint8Array => {
	// Reference: [1] SEC 1, ver. 2.0, § 2.3.3 Elliptic-Curve-Point-to-Octet-String Conversion -- https://www.secg.org/sec1-v2.pdf
	// This function creates a copy of the point. If it is already compressed, a TypeError will be thrown.

	// 1. Check if the point is already compressed.
	//    Value 0x04 comes from [1] Action 3.3.
	assertType(coords[0] === 0x04, 'unexpected compressed point');

	// 2. Recover the value of N.
	//    Given that coords is "0x04 || X || Y" ([1] Action 3.3.), N is equal to `(len(coords) - 1) / 2`.
	//    For the sake of code minification, also store `len(coords) - 1` to get the LSB of Y.
	const maxIdx = coords.length - 1;
	const n = maxIdx >> 1;

	// 3. Create a copy of the point.
	//    Compressed point is N + 1 bytes (c.f. [1] Action 2.1.).
	//    It so happens the 1st byte here is garbage, and the following n bytes are X already.
	//    Note: slice does make a full copy. https://tc39.es/ecma262/#sec-%typedarray%.prototype.slice
	const compressed = coords.slice(0, n + 1);

	// 4. Compress the Y coordinate, according to [1] Action 2.
	compressed[0] = 2 + (coords[maxIdx] & 1); // [1] Action 2.3.

	// Done. Return the compressed point.
	return compressed;
};

export const deriveEcPublicKeyFromPrivateKey = async (
	privateKey: CryptoKey,
	usages: KeyUsage[],
): Promise<CryptoKey> => {
	// Getting the public key from just the private key is tricky, and has unfortunate side effects.
	// The only way to get the WebCrypto API to expose raw public components is to export the key as a Json Web Key (JWK).
	// From there we can discard the private part and import back "just" the public part.
	//
	// Unfortunately, this means allocating a DOMString that holds the private key material on it.
	// As strings are immutable, we cannot alter the string in any way, including to wipe it off (zeroize it).
	// Even if the string will live for a few microseconds, it will stay in memory for an unknown amount of time before being overwritten.
	//
	// There is unfortunately no other way, without implementing low level cryptographic primitives, which would
	// be unsafe as there is no way to truly ensure constant-time execution (even via WASM).

	// 1. Export the private key in JWK format.
	const jwk = await crypto.subtle.exportKey('jwk', privateKey);

	// 2. Drop private key material.
	//    Reference: RFC 7518 JSON Web Algorithms, § 6.2.2. Parameters for Elliptic Curve Private Keys -- https://datatracker.ietf.org/doc/html/rfc7518#section-6.2.2
	delete jwk.d;

	// 3. Update allowed key operations
	//    Reference: RFC 7517 JSON Web Key, § 4.3. "key_ops" (Key Operations) Parameter
	jwk.key_ops = usages;

	// 4. Import back the key.
	//    We only ever use extractable public keys here. There is also little point in non-extractable public keys.
	const publicKey = await crypto.subtle.importKey('jwk', jwk, privateKey.algorithm, true, usages);

	// Done. Return the public key.
	return publicKey;
};

const CHALLENGE = new Uint8Array([0x62, 0x6e, 0x75, 0x79, 0x20, 0x72, 0x20, 0x71, 0x74, 0x20, 0x3a, 0x33]);
export const checkKeypairRelationship = async (keypair: PrivateKey): Promise<void> => {
	try {
		// Sign and verify an arbitrary message to verify the keys are indeed related to each other.
		const sig = await keypair.sign(CHALLENGE);
		const res = await keypair.verify(sig, CHALLENGE);

		if (res) {
			return;
		}
	} catch {
		// Do nothing
	}

	assertType(false, `private and public keys are not related to each other`);
};

export const toMultikey = (prefix: Uint8Array, keyBytes: Uint8Array): string => {
	const encoded = toBase58Btc(concat([prefix, keyBytes]));
	return `z${encoded}`;
};

// -- Checks --
// Shorter than writing "if (!...) throw new (...)" every time

// Gotcha: https://github.com/microsoft/TypeScript/issues/53450
type CheckFn = (condition: boolean, message: string) => asserts condition;

export const assertType: CheckFn = (condition, message) => {
	if (!condition) {
		throw new TypeError(message);
	}
};

export const assertSyntax: CheckFn = (condition, message) => {
	if (!condition) {
		throw new SyntaxError(message);
	}
};

export const assertUnreachable = (_: never, message: string): never => {
	throw new Error(message);
};
