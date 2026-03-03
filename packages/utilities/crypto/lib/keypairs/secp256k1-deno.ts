import { Buffer } from 'node:buffer';
import { createPrivateKey } from 'node:crypto';

import * as node from './secp256k1-node.js';
import * as noble from './secp256k1-web.js';

export { SECP256K1_PRIVATE_PREFIX, SECP256K1_PUBLIC_PREFIX } from './secp256k1-node.ts';

const backend = (() => {
	try {
		const privateKeyBytes = new Uint8Array(32);
		privateKeyBytes[31] = 1;

		createPrivateKey({
			key: Buffer.concat([node.PKCS8_PRIVATE_KEY_PREFIX, privateKeyBytes]),
			format: 'der',
			type: 'pkcs8',
		});

		return node;
	} catch {
		return noble;
	}
})();

export const Secp256k1PublicKey = backend.Secp256k1PublicKey;
export const Secp256k1PrivateKey = backend.Secp256k1PrivateKey;
export const Secp256k1PrivateKeyExportable = backend.Secp256k1PrivateKeyExportable;
