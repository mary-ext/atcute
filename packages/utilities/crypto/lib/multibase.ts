import { fromBase58Btc } from '@atcute/multibase';

import { assertSyntax, assertType } from './utils.js';

export type FoundPrivateKey =
	| { type: 'p256'; privateKeyBytes: Uint8Array<ArrayBuffer> }
	| { type: 'secp256k1'; privateKeyBytes: Uint8Array<ArrayBuffer> };

export type FoundPublicKey =
	| { type: 'p256'; jwtAlg: 'ES256'; publicKeyBytes: Uint8Array<ArrayBuffer> }
	| { type: 'secp256k1'; jwtAlg: 'ES256K'; publicKeyBytes: Uint8Array<ArrayBuffer> };

const extractMultibase = (key: string): Uint8Array<ArrayBuffer> => {
	assertSyntax(key.length >= 2 && key[0] === 'z', `not a multibase base58btc string`);

	const bytes = fromBase58Btc(key.slice(1));

	return bytes;
};

export const parseDidKey = (key: string): FoundPublicKey => {
	assertSyntax(key.length >= 9 && key.startsWith('did:key:'), `not a did:key`);

	return parsePublicMultikey(key.slice(8));
};

export const parsePublicMultikey = (key: string): FoundPublicKey => {
	const bytes = extractMultibase(key);
	assertSyntax(bytes.length >= 3, `multikey too short`);

	const type = (bytes[0] << 8) | bytes[1];
	const publicKey = bytes.subarray(2);

	switch (type) {
		case 0x8024: {
			return { type: 'p256', jwtAlg: 'ES256', publicKeyBytes: publicKey };
		}
		case 0xe701: {
			return { type: 'secp256k1', jwtAlg: 'ES256K', publicKeyBytes: publicKey };
		}
	}

	assertType(false, `unsupported key type (0x${type.toString(16).padStart(4, '0')})`);
};

export const getPublicKeyFromDidController = (controller: {
	type: string;
	publicKeyMultibase: string;
}): FoundPublicKey => {
	const publicKeyMultibase = controller.publicKeyMultibase;

	switch (controller.type) {
		case 'Multikey': {
			return parsePublicMultikey(publicKeyMultibase);
		}
		case 'EcdsaSecp256r1VerificationKey2019': {
			return { type: 'p256', jwtAlg: 'ES256', publicKeyBytes: extractMultibase(publicKeyMultibase) };
		}
		case 'EcdsaSecp256k1VerificationKey2019': {
			return { type: 'secp256k1', jwtAlg: 'ES256K', publicKeyBytes: extractMultibase(publicKeyMultibase) };
		}
	}

	assertType(false, `unsupported controller type (${controller.type})`);
};

export const parsePrivateMultikey = (key: string): FoundPrivateKey => {
	const bytes = extractMultibase(key);
	assertSyntax(bytes.length >= 3, `multikey too short`);

	const type = (bytes[0] << 8) | bytes[1];
	const privateKey = bytes.subarray(2);

	switch (type) {
		case 0x8626: {
			return { type: 'p256', privateKeyBytes: privateKey };
		}
		case 0x8126: {
			return { type: 'secp256k1', privateKeyBytes: privateKey };
		}
	}

	assertType(false, `unsupported key type (0x${type.toString(16).padStart(4, '0')})`);
};
