import { toBase16, toBase58Btc, toBase64Url } from '@atcute/multibase';
import { signAsync, verify, getPublicKey, utils, ProjectivePoint } from '@noble/secp256k1';

import type { PrivateKey, PrivateKeyExportable, PublicKey, VerifyOptions } from '../../types.web.js';
import { concatBuffers, toSha256, checkUnreachable } from '../../utils.js';

// Reference: https://atproto.com/specs/cryptography#public-key-encoding
export const SECP256K1_PUBLIC_PREFIX = Uint8Array.from([0xe7, 0x01]);
export const SECP256K1_PRIVATE_PREFIX = Uint8Array.from([0x81, 0x26]);

function toJsonWebKey(publicKey: Uint8Array, privateKey?: Uint8Array): JsonWebKey {
	// Reference: [1] RFC 7517 JSON Web Key -- https://datatracker.ietf.org/doc/html/rfc7517
	//            [2] RFC 7518 JSON Web Algorithms, § 6.2. Parameters for Elliptic Curve Keys -- https://datatracker.ietf.org/doc/html/rfc7518#section-6.2
	//            [3] RFC 8812 [...] JOSE Registrations for WebAuthn Algorithms, § 3. Using secp256k1 with JOSE and COSE -- https://datatracker.ietf.org/doc/html/rfc8812#section-3.1
	//            [4] RFC 9053 CBOR Object Signing and Encryption (COSE): Initial Algorithms, § 7.1.1. Double Coordinate Curves -- https://datatracker.ietf.org/doc/html/rfc9053#section-7.1.1

	// Decompress point so we can encode both x and y.
	// Could just make it a bool, but it's not recommended [4] and poorly supported.
	const point = ProjectivePoint.fromHex(publicKey).toRawBytes(false)

	const key = {
		kty: 'EC', // [2]; [3] § 3.1.
		crv: 'secp256k1', // [2] § 6.2.1.1.; [3] § 3.1.
		alg: 'ES256K', // [1] § 4.4.; [3] § 3.2.
		x: toBase64Url(point.subarray(1, 33)), // [2] § 6.2.1.2.
		y: toBase64Url(point.subarray(33, 65)), // [2] § 6.2.1.3.
		key_ops: ['verify', 'sign'] // [1] § 4.3.
	}

	if (privateKey) {
		// Private parameters
		Object.assign(key, {
			d: toBase64Url(privateKey), // [2] § 6.2.2.1.
		})
	}

	return key
}

export class Secp256k1PublicKey implements PublicKey {
	readonly type = 'secp256k1';

	/** @internal */
	protected _publicKey: Uint8Array;

	constructor(publicKey: Uint8Array) {
		this._publicKey = publicKey;
	}

	async did(): Promise<`did:key:${string}`> {
		const multikey = await this.exportPublicKey('multikey');
		return `did:key:${multikey}`;
	}

	async verify(sig: Uint8Array, data: Uint8Array, options?: VerifyOptions): Promise<boolean> {
		if (sig.length !== 64) {
			// Invalid signature: must be exactly 64 bits
			// @noble/secp256k1 throws in this case, so we handle it gracefully here instead
			return false;
		}

		const allowMalleable = options?.allowMalleableSig ?? false;
		const hashed = await toSha256(data);

		return verify(sig, hashed, this._publicKey, { lowS: !allowMalleable });
	}

	exportPublicKey(format: 'raw'): Promise<Uint8Array>;
	exportPublicKey(format: 'rawHex'): Promise<string>;
	exportPublicKey(format: 'multikey'): Promise<string>;
	exportPublicKey(format: 'jwk'): Promise<JsonWebKey>;
	async exportPublicKey(format: 'raw' | 'rawHex' | 'multikey' | 'jwk'): Promise<Uint8Array | string | JsonWebKey> {
		if (format === 'jwk') {
			return toJsonWebKey(this._publicKey)
		}

		switch (format) {
			case 'raw': {
				return this._publicKey
			}
			case 'rawHex': {
				return toBase16(this._publicKey)
			}
			case 'multikey': {
				const encoded = toBase58Btc(concatBuffers([SECP256K1_PUBLIC_PREFIX, this._publicKey]));
				return `z${encoded}`;
			}
		}

		checkUnreachable(format, `unknown "${format}" export format`);
	}
}

export class Secp256k1PrivateKey extends Secp256k1PublicKey implements PrivateKey {
	/** @internal */
	protected _privateKey: Uint8Array;

	constructor(privateKey: Uint8Array) {
		const publicKey = getPublicKey(privateKey);

		super(publicKey);
		this._privateKey = privateKey;
	}

	async sign(data: Uint8Array): Promise<Uint8Array> {
		const hashed = await toSha256(data);
		const sig = await signAsync(hashed, this._privateKey, { lowS: true });

		// return raw 64 byte sig not DER-encoded
		return sig.toCompactRawBytes();
	}
}

export class Secp256k1PrivateKeyExportable extends Secp256k1PrivateKey implements PrivateKeyExportable {
	exportPrivateKey(format: 'raw'): Promise<Uint8Array>;
	exportPrivateKey(format: 'rawHex'): Promise<string>;
	exportPrivateKey(format: 'multikey'): Promise<string>;
	exportPrivateKey(format: 'jwk'): Promise<JsonWebKey>;
	async exportPrivateKey(format: 'raw' | 'rawHex' | 'multikey' | 'jwk'): Promise<Uint8Array | string | JsonWebKey> {
		if (format === 'jwk') {
			return toJsonWebKey(this._publicKey, this._privateKey)
		}

		switch (format) {
			case 'raw': {
				return this._privateKey
			}
			case 'rawHex': {
				return toBase16(this._privateKey)
			}
			case 'multikey': {
				const encoded = toBase58Btc(concatBuffers([SECP256K1_PRIVATE_PREFIX, this._privateKey]));
				return `z${encoded}`;
			}
		}

		checkUnreachable(format, `unknown "${format}" export format`);
	}
}

export const createSecp256k1Keypair = (): Secp256k1PrivateKeyExportable => {
	const privateKey = utils.randomPrivateKey();
	return new Secp256k1PrivateKeyExportable(privateKey);
};
