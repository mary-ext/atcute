import { toBase16 } from '@atcute/multibase';
import { concat } from '@atcute/uint8array';

import type { DidKeyString, PrivateKey, PrivateKeyExportable, PublicKey, VerifyOptions } from '../types.js';
import {
	assertType,
	assertUnreachable,
	checkKeypairRelationship,
	compressPoint,
	deriveEcPublicKeyFromPrivateKey,
	isSignatureNormalized,
	normalizeSignature,
	toMultikey,
} from '../utils.js';

// Reference: https://atproto.com/specs/cryptography#public-key-encoding
export const P256_PUBLIC_PREFIX = Uint8Array.from([0x80, 0x24]);
export const P256_PRIVATE_PREFIX = Uint8Array.from([0x86, 0x26]);

const ECDSA_ALG: EcdsaParams & EcKeyImportParams = {
	name: 'ECDSA',
	namedCurve: 'P-256',
	hash: 'SHA-256',
} as const;

// NIST SP 800-186, § 3.2.1.3. P-256 -- https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-186.pdf
const P256_CURVE_ORDER = 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n;

// This is a hack, to convert a raw private key to a PKCS#8 wrapped key.
// Reference: [1] RFC 5958 Asymmetric Key Packages, § 2. Asymmetric Key Package CMS Content Type https://datatracker.ietf.org/doc/html/rfc5958#section-2
// A raw private key can trivially be wrapped in a dummy PKCS#8 container (aka OneAsymmetricKey) without any extra information.
// The algorithm identifier has been hardcoded to Elliptic Curve Cryptography, ECC curve name prime256v1.
// See also: https://lapo.it/asn1js/#MEECAQAwEwYHKoZIzj0CAQYIKoZIzj0DAQcEJzAlAgEBBCAf4zlQxfRhEkrpksK9_fHHOxYV9XG9Vn5g0Zqh9IzfQg
//
// FYI: has been written like this for readability, minified properly by esbuild.
// https://esbuild.github.io/try/#dAAwLjI0LjIALS1taW5pZnkAY29uc3QgdGVzdCA9IG5ldyBVaW50OEFycmF5KFsgLi4uWzAsIDFdLCAuLi5bMiwgM11dKQ
const PKCS8_PRIVATE_KEY_PREFIX = Uint8Array.from([
	...[/* SEQ */ 0x30, /* len */ 0x41], // PrivateKeyInfo
	/**/ ...[/* INT */ 0x02, /* len */ 0x01, /* 0 */ 0x00], // Version
	/**/ ...[/* SEQ */ 0x30, /* len */ 0x13], // AlgorithmIdentifier
	/******/ ...[/* OID */ 0x06, /* len */ 0x07], // {iso(1) member-body(2) us(840) ansi-x962(10045) keyType(2) ecPublicKey(1)} -- https://datatracker.ietf.org/doc/html/rfc5753#section-7.1.2
	/**********/ ...[/* 1.2.840.10045.2.1 (ecPublicKey) */ 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01],
	/******/ ...[/* OID */ 0x06, /* len */ 0x08], // {iso(1) member-body(2) us(840) ansi-x962(10045) curves(3) prime(1) prime256v1(7)} -- https://datatracker.ietf.org/doc/html/rfc5480#section-2.1.1.1
	/**********/ ...[/* 1.2.840.10045.3.1.7 (prime256v1) */ 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07],
	/**/ ...[/* OCT_STR */ 0x04, /* len */ 0x27], // PrivateKey
	/******/ ...[/* SEQ */ 0x30, /* len */ 0x25],
	/**********/ ...[/* INT */ 0x02, /* len */ 0x01, /* 1 */ 0x01],
	/**********/ ...[/* OCT_STR */ 0x04, /* len: 32 */ 0x20 /* ... */],
]);

export class P256PublicKey implements PublicKey {
	readonly type = 'p256';

	/** @internal */
	protected _publicKey: CryptoKey;

	/** @internal */
	protected constructor(publicKey: CryptoKey) {
		this._publicKey = publicKey;
	}

	static async importRaw(publicKeyBytes: Uint8Array): Promise<P256PublicKey> {
		const imported = await crypto.subtle.importKey('raw', publicKeyBytes, ECDSA_ALG, true, ['verify']);

		return new P256PublicKey(imported);
	}

	static async importCryptoKey(publicKey: CryptoKey): Promise<P256PublicKey> {
		// Type cast to make resulting code smaller
		assertType((publicKey.algorithm as any).namedCurve === 'P-256', 'not an ECDSA P-256 key');
		assertType(publicKey.type === 'public', 'not a public key');
		assertType(publicKey.extractable, 'key must be extractable');

		return new P256PublicKey(publicKey);
	}

	async verify(sig: Uint8Array, data: Uint8Array, options?: VerifyOptions): Promise<boolean> {
		if (sig.length !== 64) {
			// Invalid signature: must be exactly 64 bits
			return false;
		}

		if (!options?.allowMalleableSig && !isSignatureNormalized(sig, P256_CURVE_ORDER)) {
			// Invalid signature: not low-S normalized
			return false;
		}

		return await crypto.subtle.verify(ECDSA_ALG, this._publicKey, sig, data);
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
			return await crypto.subtle.exportKey('jwk', this._publicKey);
		}

		const buffer = await crypto.subtle.exportKey('raw', this._publicKey);

		// WebCrypto spits out the uncompressed EC point: https://www.w3.org/TR/WebCryptoAPI/#ecdsa-operations:~:text=using%20the%20uncompressed%20format
		// We need to compress it according to the ATProto Cryptography specification.
		// https://atproto.com/specs/cryptography#public-key-encoding, 1st point.
		const publicKeyBytes = compressPoint(new Uint8Array(buffer));

		switch (format) {
			case 'did': {
				return `did:key:${toMultikey(P256_PUBLIC_PREFIX, publicKeyBytes)}`;
			}
			case 'multikey': {
				return toMultikey(P256_PUBLIC_PREFIX, publicKeyBytes);
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

export class P256PrivateKey extends P256PublicKey implements PrivateKey {
	/** @internal */
	protected _privateKey: CryptoKey;

	/** @internal */
	protected constructor(privateKey: CryptoKey, publicKey: CryptoKey) {
		super(publicKey);
		this._privateKey = privateKey;
	}

	static override async importRaw(
		privateKeyBytes: Uint8Array,
		publicKeyBytes?: Uint8Array,
	): Promise<P256PrivateKey> {
		const pkcs8 = concat([PKCS8_PRIVATE_KEY_PREFIX, privateKeyBytes]);

		const privateKey = await crypto.subtle.importKey('pkcs8', pkcs8, ECDSA_ALG, !publicKeyBytes, ['sign']);
		const publicKey = publicKeyBytes
			? await crypto.subtle.importKey('raw', publicKeyBytes, ECDSA_ALG, true, ['verify'])
			: await deriveEcPublicKeyFromPrivateKey(privateKey, ['verify']);

		const keypair = new P256PrivateKey(privateKey, publicKey);

		if (publicKeyBytes) {
			await checkKeypairRelationship(keypair);
		}

		return keypair;
	}

	static override async importCryptoKey(
		privateKey: CryptoKey,
		publicKey?: CryptoKey,
	): Promise<P256PrivateKey> {
		// Type cast to make resulting code smaller
		assertType((privateKey.algorithm as any).namedCurve === 'P-256', '1st key is not an ECDSA P-256 key');
		assertType(privateKey.type === 'private', '1st key is not a private key');

		if (publicKey) {
			assertType((publicKey.algorithm as any).namedCurve === 'P-256', '2nd key is not an ECDSA P-256 key');
			assertType(publicKey.type === 'public', '2nd key is not a public key');
			assertType(publicKey.extractable, 'public key must be extractable');
		} else {
			assertType(privateKey.extractable, 'private key must be extractable if no public key is provided');
		}

		const keypair = new P256PrivateKey(
			privateKey,
			publicKey ?? (await deriveEcPublicKeyFromPrivateKey(privateKey, ['verify'])),
		);

		if (publicKey) {
			await checkKeypairRelationship(keypair);
		}

		return keypair;
	}

	// convenience shortcut
	static async importCryptoKeyPair(keypair: CryptoKeyPair): Promise<P256PrivateKey> {
		return await this.importCryptoKey(keypair.privateKey, keypair.publicKey);
	}

	async sign(data: Uint8Array): Promise<Uint8Array> {
		const sig = await crypto.subtle.sign(ECDSA_ALG, this._privateKey, data);
		return normalizeSignature(new Uint8Array(sig), P256_CURVE_ORDER);
	}
}

export class P256PrivateKeyExportable extends P256PrivateKey implements PrivateKeyExportable {
	static async createKeypair(): Promise<P256PrivateKeyExportable> {
		const keypair = await crypto.subtle.generateKey(ECDSA_ALG, true, ['sign', 'verify']);
		return new P256PrivateKeyExportable(keypair.privateKey, keypair.publicKey);
	}

	exportPrivateKey(format: 'jwk'): Promise<JsonWebKey>;
	exportPrivateKey(format: 'multikey'): Promise<string>;
	exportPrivateKey(format: 'raw'): Promise<Uint8Array>;
	exportPrivateKey(format: 'rawHex'): Promise<string>;
	async exportPrivateKey(
		format: 'jwk' | 'multikey' | 'raw' | 'rawHex',
	): Promise<JsonWebKey | Uint8Array | string> {
		if (format === 'jwk') {
			return await crypto.subtle.exportKey('jwk', this._privateKey);
		}

		const privateKeyPkcs8 = await crypto.subtle.exportKey('pkcs8', this._privateKey);
		const privateKeyBytes = new Uint8Array(privateKeyPkcs8, PKCS8_PRIVATE_KEY_PREFIX.length + 1, 32);

		switch (format) {
			case 'multikey': {
				return toMultikey(P256_PRIVATE_PREFIX, privateKeyBytes);
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
