import { toBase16, toBase58Btc } from '@atcute/multibase';
import { signAsync, verify, getPublicKey, utils } from '@noble/secp256k1';

import type { PrivateKey, PrivateKeyExportable, PublicKey, VerifyOptions } from '../../types.web.js';
import { concatBuffers, toSha256, checkUnreachable } from '../../utils.js';

// Reference: https://atproto.com/specs/cryptography#public-key-encoding
export const SECP256K1_PUBLIC_PREFIX = Uint8Array.from([0xe7, 0x01]);
export const SECP256K1_PRIVATE_PREFIX = Uint8Array.from([0x81, 0x26]);

export class Secp256k1PublicKey implements PublicKey {
	readonly type = 'secp256k1';

	/** @internal */
	protected _publicKey: Uint8Array;

	constructor(publicKey: Uint8Array) {
		this._publicKey = publicKey;
	}

	bytes(): Promise<Uint8Array> {
		return Promise.resolve(this._publicKey);
	}

	did(): Promise<`did:key:${string}`> {
		const encoded = toBase58Btc(concatBuffers([SECP256K1_PUBLIC_PREFIX, this._publicKey]));
		return Promise.resolve<`did:key:${string}`>(`did:key:z${encoded}`);
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
	export(type: 'hex' | 'multikey'): Promise<string>;
	export(type: 'bytes'): Promise<Uint8Array>;
	export(type: 'bytes' | 'hex' | 'multikey'): Promise<string | Uint8Array> {
		const privateKey = this._privateKey;

		switch (type) {
			case 'bytes': {
				return Promise.resolve(privateKey);
			}
			case 'hex': {
				return Promise.resolve(toBase16(privateKey));
			}
			case 'multikey': {
				const encoded = toBase58Btc(concatBuffers([SECP256K1_PRIVATE_PREFIX, privateKey]));
				return Promise.resolve(`z${encoded}`);
			}
		}

		checkUnreachable(type, `unknown "${type}" export type`);
	}
}

export const createSecp256k1Keypair = (): Secp256k1PrivateKeyExportable => {
	const privateKey = utils.randomPrivateKey();
	return new Secp256k1PrivateKeyExportable(privateKey);
};
