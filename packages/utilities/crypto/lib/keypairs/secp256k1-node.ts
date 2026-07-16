// oxlint-disable no-useless-spread

import {
	type KeyObject,
	createPrivateKey,
	createPublicKey,
	generateKeyPair as generateKeyPairCb,
	sign,
	verify,
} from 'node:crypto';
import { promisify } from 'node:util';

import { toBase16 } from '@atcute/multibase';

import type { DidKeyString, PrivateKey, PrivateKeyExportable, PublicKey, VerifyOptions } from '../types.ts';
import {
	assertUnreachable,
	checkKeypairRelationship,
	compressPoint,
	extractEcPrivateScalar,
	isSignatureNormalized,
	normalizeSignature,
	toMultikey,
} from '../utils.ts';

// Reference: https://atproto.com/specs/cryptography#public-key-encoding
export const SECP256K1_PUBLIC_PREFIX = Uint8Array.from([0xe7, 0x01]);
export const SECP256K1_PRIVATE_PREFIX = Uint8Array.from([0x81, 0x26]);

const generateKeyPair = /*#__PURE__*/ promisify(generateKeyPairCb);

// `Buffer` methods like `subarray` return `Buffer`, and reading `.buffer` alone would drop its offset
// into the (possibly pooled) backing store.
const toUint8Array = (buffer: Buffer<ArrayBuffer>): Uint8Array<ArrayBuffer> => {
	return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
};

// @types/node@26 dropped `KeyObject` from `createPublicKey`'s accepted inputs, but passing a private
// key to derive its public counterpart is still supported at runtime.
const derivePublicKey = createPublicKey as unknown as (privateKey: KeyObject) => KeyObject;

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
/** @internal */
export const PKCS8_PRIVATE_KEY_PREFIX = Uint8Array.from([
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

class NodeSecp256k1PublicKey implements PublicKey {
	readonly type = 'secp256k1';
	readonly jwtAlg = 'ES256K';

	/** @internal */
	protected _publicKey: KeyObject;

	/** @internal */
	protected constructor(publicKey: KeyObject) {
		this._publicKey = publicKey;
	}

	static async importRaw(publicKeyBytes: Uint8Array): Promise<NodeSecp256k1PublicKey> {
		const publicKey = createPublicKey({
			key: Buffer.concat([SPKI_PREFIX, publicKeyBytes]),
			format: 'der',
			type: 'spki',
		});

		return new NodeSecp256k1PublicKey(publicKey);
	}

	async verify(sig: Uint8Array, data: Uint8Array, options?: VerifyOptions): Promise<boolean> {
		if (!options?.allowMalleableSig && !isSignatureNormalized(sig, SECP256K1_CURVE_ORDER)) {
			// Invalid signature: not low-S normalized
			return false;
		}

		return verify('SHA256', data, { key: this._publicKey, dsaEncoding: 'ieee-p1363' }, sig);
	}

	exportPublicKey(format: 'did'): Promise<DidKeyString>;
	exportPublicKey(format: 'jwk'): Promise<JsonWebKey>;
	exportPublicKey(format: 'multikey'): Promise<string>;
	exportPublicKey(format: 'raw'): Promise<Uint8Array<ArrayBuffer>>;
	exportPublicKey(format: 'rawHex'): Promise<string>;
	async exportPublicKey(
		format: 'did' | 'jwk' | 'multikey' | 'raw' | 'rawHex',
	): Promise<DidKeyString | JsonWebKey | Uint8Array<ArrayBuffer> | string> {
		const publicKey = this._publicKey;

		if (format === 'jwk') {
			return publicKey.export({ format: 'jwk' });
		}

		const publicKeySpki = publicKey.export({ format: 'der', type: 'spki' });
		const rawPublicKey = new Uint8Array(publicKeySpki.buffer, SPKI_PREFIX.length);

		const publicKeyBytes = compressPoint(rawPublicKey);

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

class NodeSecp256k1PrivateKey extends NodeSecp256k1PublicKey implements PrivateKey {
	/** @internal */
	protected _privateKey: KeyObject;

	/** @internal */
	protected constructor(privateKey: KeyObject, publicKey: KeyObject) {
		super(publicKey);
		this._privateKey = privateKey;
	}

	static override async importRaw(
		privateKeyBytes: Uint8Array,
		publicKeyBytes?: Uint8Array,
	): Promise<NodeSecp256k1PrivateKey> {
		const privateKey = createPrivateKey({
			key: Buffer.concat([PKCS8_PRIVATE_KEY_PREFIX, privateKeyBytes]),
			format: 'der',
			type: 'pkcs8',
		});

		const publicKey = publicKeyBytes
			? createPublicKey({
					key: Buffer.concat([SPKI_PREFIX, publicKeyBytes]),
					format: 'der',
					type: 'spki',
				})
			: derivePublicKey(privateKey);

		const keypair = new NodeSecp256k1PrivateKey(privateKey, publicKey);

		if (publicKeyBytes) {
			await checkKeypairRelationship(keypair);
		}

		return keypair;
	}

	async sign(data: Uint8Array): Promise<Uint8Array<ArrayBuffer>> {
		const sig = sign('SHA256', data, { key: this._privateKey, dsaEncoding: 'ieee-p1363' });

		return normalizeSignature(new Uint8Array(sig), SECP256K1_CURVE_ORDER);
	}
}

class NodeSecp256k1PrivateKeyExportable extends NodeSecp256k1PrivateKey implements PrivateKeyExportable {
	static async createKeypair(): Promise<NodeSecp256k1PrivateKeyExportable> {
		const keypair = await generateKeyPair('ec', { namedCurve: 'secp256k1' });
		return new NodeSecp256k1PrivateKeyExportable(keypair.privateKey, keypair.publicKey);
	}

	static override async importRaw(
		privateKeyBytes: Uint8Array,
		publicKeyBytes?: Uint8Array,
	): Promise<NodeSecp256k1PrivateKeyExportable> {
		const privateKey = createPrivateKey({
			key: Buffer.concat([PKCS8_PRIVATE_KEY_PREFIX, privateKeyBytes]),
			format: 'der',
			type: 'pkcs8',
		});

		const publicKey = publicKeyBytes
			? createPublicKey({
					key: Buffer.concat([SPKI_PREFIX, publicKeyBytes]),
					format: 'der',
					type: 'spki',
				})
			: derivePublicKey(privateKey);

		const keypair = new NodeSecp256k1PrivateKeyExportable(privateKey, publicKey);

		if (publicKeyBytes) {
			await checkKeypairRelationship(keypair);
		}

		return keypair;
	}

	exportPrivateKey(format: 'jwk'): Promise<JsonWebKey>;
	exportPrivateKey(format: 'multikey'): Promise<string>;
	exportPrivateKey(format: 'raw'): Promise<Uint8Array<ArrayBuffer>>;
	exportPrivateKey(format: 'rawHex'): Promise<string>;
	async exportPrivateKey(
		format: 'raw' | 'rawHex' | 'multikey' | 'jwk',
	): Promise<Uint8Array | string | JsonWebKey> {
		const privateKey = this._privateKey;

		if (format === 'jwk') {
			return privateKey.export({ format: 'jwk' });
		}

		const privateKeyPkcs8 = toUint8Array(privateKey.export({ format: 'der', type: 'pkcs8' }));
		const privateKeyBytes = extractEcPrivateScalar(privateKeyPkcs8, 32);

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
}

export {
	NodeSecp256k1PrivateKey as Secp256k1PrivateKey,
	NodeSecp256k1PrivateKeyExportable as Secp256k1PrivateKeyExportable,
	NodeSecp256k1PublicKey as Secp256k1PublicKey,
};
