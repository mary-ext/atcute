import { promisify } from 'node:util';
import {
	type KeyObject,
	getHashes,
	getCurves,
	generateKeyPair as generateKeyPairCb,
	createPublicKey,
	createPrivateKey,
	sign,
	verify,
} from 'node:crypto';
import {
	Secp256k1PublicKey as PureJsSecp256k1PublicKey,
	Secp256k1PrivateKey as PureJsSecp256k1PrivateKey,
} from './secp256k1.js';
import type { DidKeyString, PrivateKey, PrivateKeyExportable, PublicKey, VerifyOptions } from '../types.js';
import {
	assertUnreachable,
	compressPoint,
	isSignatureNormalized,
	normalizeSignature,
	toMultikey,
} from '../utils.js';
import { toBase16 } from '@atcute/multibase';

const generateKeyPair = promisify(generateKeyPairCb);

// Bun is not very
const IS_NATIVE_CRYPTO_AVAILABLE = !globalThis.Bun && getHashes().includes('sha256') && getCurves().includes('secp256k1');

// SEC 2, ver. 2.0, § 2.4.1 Recommended Parameters secp256k1
const SECP256K1_CURVE_ORDER = 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n;

const ASN1_ALGORITHM_IDENTIFIER = Uint8Array.from([
	...[/* SEQ */ 0x30, /* len */ 0x10], // AlgorithmIdentifier
	/**/ ...[/* OID */ 0x06, /* len */ 0x07], // {iso(1) member-body(2) us(840) ansi-x962(10045) keyType(2) ecPublicKey(1)} -- https://datatracker.ietf.org/doc/html/rfc5753#section-7.1.2
	/******/ ...[/* 1.2.840.10045.2.1 (ecPublicKey) */ 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01],
	/**/ ...[/* OID */ 0x06, /* len */ 0x05], // {iso(1) identified-organization(3) certicom(132) curve(0) ansip256k1(10)} -- SEC 2, ver. 2.0, § A.2 https://www.secg.org/sec2-v2.pdf
	/******/ ...[/* 1.3.132.0.10 (ansip256k1) */ 0x2b, 0x81, 0x04, 0x00, 0x0a],
]);

// @see p256.ts
const PKCS8_PRIVATE_KEY_PREFIX = Uint8Array.from([
	...[/* SEQ */ 0x30, /* len */ 0x3e], // PrivateKeyInfo
	/**/ ...[/* INT */ 0x02, /* len */ 0x01, /* 0 */ 0x00], // Version
	/**/ ...ASN1_ALGORITHM_IDENTIFIER, // AlgorithmIdentifier
	/**/ ...[/* OCT_STR */ 0x04, /* len */ 0x27], // PrivateKey
	/******/ ...[/* SEQ */ 0x30, /* len */ 0x25],
	/**********/ ...[/* INT */ 0x02, /* len */ 0x01, /* 1 */ 0x01],
	/**********/ ...[/* OCT_STR */ 0x04, /* len: 32 */ 0x20 /* ... */],
]);

const SPKI_PREFIX = Uint8Array.from([
	...[/* SEQ */ 0x30, /* len */ 0x36], // SubjectPublicKeyInfo
	/**/ ...ASN1_ALGORITHM_IDENTIFIER, // AlgorithmIdentifier
	/**/ ...[/* BIT_STR */ 0x03, /* len: 33 */ 0x22, 0x00 /* ... */], // PublicKey
]);

// Reference: https://atproto.com/specs/cryptography#public-key-encoding
export const SECP256K1_PUBLIC_PREFIX = Uint8Array.from([0xe7, 0x01]);
export const SECP256K1_PRIVATE_PREFIX = Uint8Array.from([0x81, 0x26]);

class NodeNativeSecp256k1PublicKey implements PublicKey {
	readonly type = 'secp256k1';

	/** @internal */
	#publicKey: KeyObject;

	/** @internal */
	protected constructor(publicKey: KeyObject) {
		this.#publicKey = publicKey;
	}

	static async importRaw(publicKeyBytes: Uint8Array): Promise<NodeNativeSecp256k1PublicKey> {
		const buf = Buffer.concat([SPKI_PREFIX, publicKeyBytes]);
		const keyObject = createPublicKey({ key: buf, format: 'der', type: 'spki' });
		return new NodeNativeSecp256k1PublicKey(keyObject);
	}

	async verify(sig: Uint8Array, data: Uint8Array, options?: VerifyOptions): Promise<boolean> {
		if (!options?.allowMalleableSig && !isSignatureNormalized(sig, SECP256K1_CURVE_ORDER)) {
			// Invalid signature: not low-S normalized
			return false;
		}

		return verify('SHA256', data, { key: this.#publicKey, dsaEncoding: 'ieee-p1363' }, sig);
	}

	exportPublicKey(format: 'did'): Promise<DidKeyString>;
	exportPublicKey(format: 'jwk'): Promise<JsonWebKey>;
	exportPublicKey(format: 'multikey'): Promise<string>;
	exportPublicKey(format: 'raw'): Promise<Uint8Array>;
	exportPublicKey(format: 'rawHex'): Promise<string>;
	async exportPublicKey(
		format: 'did' | 'jwk' | 'multikey' | 'raw' | 'rawHex',
	): Promise<DidKeyString | JsonWebKey | Uint8Array | string> {
		if (format === 'jwk') {
			return this.#publicKey.export({ format: 'jwk' });
		}

		const publicKeySpki = this.#publicKey.export({ format: 'der', type: 'spki' });
		const rawPublicKey = new Uint8Array(publicKeySpki.buffer, SPKI_PREFIX.length);
		const publicKeyBytes = rawPublicKey[0] === 0x04 ? compressPoint(rawPublicKey) : rawPublicKey;

		switch (format) {
			case 'did': {
				return `did:key:${toMultikey(SECP256K1_PUBLIC_PREFIX, publicKeyBytes)}`;
			}
			case 'multikey': {
				return toMultikey(SECP256K1_PUBLIC_PREFIX, publicKeyBytes);
			}
			case 'raw': {
				return publicKeyBytes;
			}
			case 'rawHex': {
				return toBase16(publicKeyBytes);
			}
		}

		assertUnreachable(format, `unknown "${format}" export format`);
	}
}

class NodeNativeSecp256k1PrivateKey extends NodeNativeSecp256k1PublicKey implements PrivateKey {
	readonly #privateKey: KeyObject;

	/** @internal */
	protected constructor(privateKeyBytes: KeyObject, publicKeyBytes: KeyObject) {
		super(publicKeyBytes);
		this.#privateKey = privateKeyBytes;
	}

	static override async importRaw(privateKeyBytes: Uint8Array): Promise<NodeNativeSecp256k1PrivateKey> {
		const priateKeyObject = createPrivateKey({
			key: Buffer.concat([PKCS8_PRIVATE_KEY_PREFIX, privateKeyBytes]),
			format: 'der',
			type: 'pkcs8',
		});

		const publicKeyObject = createPublicKey(priateKeyObject);
		return new NodeNativeSecp256k1PrivateKey(priateKeyObject, publicKeyObject);
	}

	async sign(data: Uint8Array): Promise<Uint8Array> {
		const sig = sign('SHA256', data, { key: this.#privateKey, dsaEncoding: 'ieee-p1363' });

		return normalizeSignature(new Uint8Array(sig), SECP256K1_CURVE_ORDER);
	}

	static async createKeypair(): Promise<Secp256k1PrivateKey.Exportable> {
		const keypair = await generateKeyPair('ec', { namedCurve: 'secp256k1' });
		return new this.#Exportable(keypair.privateKey, keypair.publicKey);
	}

	static #Exportable = class extends NodeNativeSecp256k1PrivateKey implements PrivateKeyExportable {
		exportPrivateKey(format: 'jwk'): Promise<JsonWebKey>;
		exportPrivateKey(format: 'multikey'): Promise<string>;
		exportPrivateKey(format: 'raw'): Promise<Uint8Array>;
		exportPrivateKey(format: 'rawHex'): Promise<string>;
		async exportPrivateKey(
			format: 'raw' | 'rawHex' | 'multikey' | 'jwk',
		): Promise<Uint8Array | string | JsonWebKey> {
			if (format === 'jwk') {
				return this.#privateKey.export({ format: 'jwk' });
			}

			const privateKeyPkcs8 = this.#privateKey.export({ format: 'der', type: 'pkcs8' });
			const privateKeyBytes = new Uint8Array(privateKeyPkcs8.buffer, PKCS8_PRIVATE_KEY_PREFIX.length + 1, 32);

			switch (format) {
				case 'multikey': {
					return toMultikey(SECP256K1_PRIVATE_PREFIX, privateKeyBytes);
				}
				case 'raw': {
					return privateKeyBytes;
				}
				case 'rawHex': {
					return toBase16(privateKeyBytes);
				}
			}

			assertUnreachable(format, `unknown "${format}" export format`);
		}
	};
}

export const Secp256k1PublicKey = IS_NATIVE_CRYPTO_AVAILABLE
	? NodeNativeSecp256k1PublicKey
	: PureJsSecp256k1PublicKey;

export const Secp256k1PrivateKey = IS_NATIVE_CRYPTO_AVAILABLE
	? NodeNativeSecp256k1PrivateKey
	: PureJsSecp256k1PrivateKey;

namespace Secp256k1PrivateKey {
	export interface Exportable extends PrivateKeyExportable {}
}
