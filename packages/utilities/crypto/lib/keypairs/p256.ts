import { toBase16, toBase58Btc } from '@atcute/multibase';
import { p256 } from '@noble/curves/p256';

import type { PrivateKey, PrivateKeyExportable, PublicKey, VerifyOptions } from '../types.js';
import { checkUnreachable, concatBuffers, toSha256 } from '../utils.js';

// Reference: https://atproto.com/specs/cryptography#public-key-encoding
export const P256_PUBLIC_PREFIX = Uint8Array.from([0x80, 0x24]);
export const P256_PRIVATE_PREFIX = Uint8Array.from([0x86, 0x26]);

export class P256PublicKey implements PublicKey {
	readonly type = 'p256';

	/** @internal */
	protected _publicKey: Uint8Array;

	constructor(publicKey: Uint8Array) {
		this._publicKey = publicKey;
	}

	bytes(): Uint8Array {
		return this._publicKey;
	}

	did(): `did:key:${string}` {
		const encoded = toBase58Btc(concatBuffers([P256_PUBLIC_PREFIX, this._publicKey]));
		return `did:key:z${encoded}`;
	}

	async verify(sig: Uint8Array, data: Uint8Array, options?: VerifyOptions): Promise<boolean> {
		const allowMalleable = options?.allowMalleableSig ?? false;
		const hashed = await toSha256(data);

		return p256.verify(sig, hashed, this._publicKey, {
			lowS: !allowMalleable,
			format: 'compact',
		});
	}
}

export class P256PrivateKey extends P256PublicKey implements PrivateKey {
	/** @internal */
	protected _privateKey: Uint8Array;

	constructor(privateKey: Uint8Array) {
		const publicKey = p256.getPublicKey(privateKey);

		super(publicKey);
		this._privateKey = privateKey;
	}

	async sign(data: Uint8Array): Promise<Uint8Array> {
		const hashed = await toSha256(data);
		const sig = p256.sign(hashed, this._privateKey, { lowS: true });

		// return raw 64 byte sig not DER-encoded
		return sig.toCompactRawBytes();
	}
}

export class P256PrivateKeyExportable extends P256PrivateKey implements PrivateKeyExportable {
	export(type: 'hex' | 'multikey'): string;
	export(type: 'bytes'): Uint8Array;
	export(type: 'bytes' | 'hex' | 'multikey'): string | Uint8Array {
		const privateKey = this._privateKey;

		switch (type) {
			case 'bytes': {
				return privateKey;
			}
			case 'hex': {
				return toBase16(privateKey);
			}
			case 'multikey': {
				const encoded = toBase58Btc(concatBuffers([P256_PRIVATE_PREFIX, privateKey]));
				return `z${encoded}`;
			}
		}

		checkUnreachable(type, `unknown "${type}" export type`);
	}
}

export const createP256Keypair = (): P256PrivateKeyExportable => {
	const privateKey = p256.utils.randomPrivateKey();
	return new P256PrivateKeyExportable(privateKey);
};
