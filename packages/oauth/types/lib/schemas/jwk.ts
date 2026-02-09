import * as v from '@badrap/valita';

import { isLastOccurrence } from './utils.ts';

// key usage constants
const PUBLIC_KEY_USAGE = ['verify', 'encrypt', 'wrapKey'] as const;
const PRIVATE_KEY_USAGE = ['sign', 'decrypt', 'unwrapKey', 'deriveKey', 'deriveBits'] as const;
const KEY_USAGE = [...PRIVATE_KEY_USAGE, ...PUBLIC_KEY_USAGE] as const;

type InternalKeyUsage = (typeof KEY_USAGE)[number];

const isPublicKeyUsage = (usage: unknown): usage is (typeof PUBLIC_KEY_USAGE)[number] => {
	return (PUBLIC_KEY_USAGE as readonly unknown[]).includes(usage);
};

const isPrivateKeyUsage = (usage: unknown): usage is (typeof PRIVATE_KEY_USAGE)[number] => {
	return (PRIVATE_KEY_USAGE as readonly unknown[]).includes(usage);
};

const isSigKeyUsage = (v: InternalKeyUsage): boolean => v === 'verify';
const isEncKeyUsage = (v: InternalKeyUsage): boolean => v === 'encrypt' || v === 'wrapKey';

export const keyUsageSchema = v.union(
	v.literal('verify'),
	v.literal('encrypt'),
	v.literal('wrapKey'),
	v.literal('sign'),
	v.literal('decrypt'),
	v.literal('unwrapKey'),
	v.literal('deriveKey'),
	v.literal('deriveBits'),
);

export const publicKeyUsageSchema = v.union(v.literal('verify'), v.literal('encrypt'), v.literal('wrapKey'));

const jwkBaseSchema = v.object({
	kty: v.string(),
	alg: v.string().optional(),
	kid: v.string().optional(),
	use: v.union(v.literal('sig'), v.literal('enc')).optional(),
	key_ops: v.array(keyUsageSchema).optional(),

	// X.509
	x5c: v.array(v.string()).optional(),
	x5t: v.string().optional(),
	'x5t#S256': v.string().optional(),
	x5u: v.string().optional(),

	// WebCrypto
	ext: v.boolean().optional(),

	// Federation Historical Keys Response
	iat: v.number().optional(),
	exp: v.number().optional(),
	nbf: v.number().optional(),
	revoked: v
		.object({
			revoked_at: v.number(),
			reason: v.string().optional(),
		})
		.optional(),
});

const jwkRsaKeySchema = jwkBaseSchema.extend({
	kty: v.literal('RSA'),
	alg: v
		.union(
			v.literal('RS256'),
			v.literal('RS384'),
			v.literal('RS512'),
			v.literal('PS256'),
			v.literal('PS384'),
			v.literal('PS512'),
		)
		.optional(),
	n: v.string(),
	e: v.string(),
	d: v.string().optional(),
	p: v.string().optional(),
	q: v.string().optional(),
	dp: v.string().optional(),
	dq: v.string().optional(),
	qi: v.string().optional(),
	oth: v
		.array(
			v.object({
				r: v.string().optional(),
				d: v.string().optional(),
				t: v.string().optional(),
			}),
		)
		.optional(),
});

const jwkEcKeySchema = jwkBaseSchema.extend({
	kty: v.literal('EC'),
	alg: v.union(v.literal('ES256'), v.literal('ES384'), v.literal('ES512')).optional(),
	crv: v.union(v.literal('P-256'), v.literal('P-384'), v.literal('P-521')),
	x: v.string(),
	y: v.string(),
	d: v.string().optional(),
});

const jwkEcSecp256k1KeySchema = jwkBaseSchema.extend({
	kty: v.literal('EC'),
	alg: v.literal('ES256K').optional(),
	crv: v.literal('secp256k1'),
	x: v.string(),
	y: v.string(),
	d: v.string().optional(),
});

const jwkOkpKeySchema = jwkBaseSchema.extend({
	kty: v.literal('OKP'),
	alg: v.literal('EdDSA').optional(),
	crv: v.union(v.literal('Ed25519'), v.literal('Ed448')),
	x: v.string(),
	d: v.string().optional(),
});

const jwkSymKeySchema = jwkBaseSchema.extend({
	kty: v.literal('oct'),
	alg: v.union(v.literal('HS256'), v.literal('HS384'), v.literal('HS512')).optional(),
	k: v.string(),
});

const hasPrivateSecret = <J extends object>(jwk: J): boolean => {
	return ('d' in jwk && jwk.d != null) || ('k' in jwk && jwk.k != null);
};

const isPublicJwk = <J extends object>(jwk: J): boolean => {
	return !hasPrivateSecret(jwk);
};

/** JWK schema for known key types */
export const jwkSchema = v
	.union(jwkRsaKeySchema, jwkEcKeySchema, jwkEcSecp256k1KeySchema, jwkOkpKeySchema, jwkSymKeySchema)
	.chain((k) => {
		// "use" can only be used with public keys
		if (k.use != null && !isPublicJwk(k)) {
			return v.err({ message: `"use" can only be used with public keys`, path: ['use'] });
		}

		// private key usage not allowed for public keys
		if (k.key_ops?.some(isPrivateKeyUsage) && isPublicJwk(k)) {
			return v.err({ message: `private key usage not allowed for public keys`, path: ['key_ops'] });
		}

		// key_ops must not contain duplicates
		if (k.key_ops && !k.key_ops.every(isLastOccurrence)) {
			return v.err({ message: `key_ops must not contain duplicates`, path: ['key_ops'] });
		}

		// "use" and "key_ops" must be consistent
		if (k.use != null && k.key_ops != null) {
			const consistent =
				(k.use === 'sig' && k.key_ops.every(isSigKeyUsage)) ||
				(k.use === 'enc' && k.key_ops.every(isEncKeyUsage));
			if (!consistent) {
				return v.err({ message: `"key_ops" must be consistent with "use"`, path: ['key_ops'] });
			}
		}

		return v.ok(k);
	});

/** public JWK schema (kid required, no private keys) */
export const jwkPubSchema = jwkSchema.chain((k) => {
	if (k.kid == null) {
		return v.err({ message: `"kid" is required`, path: ['kid'] });
	}

	if (!isPublicJwk(k)) {
		return v.err({ message: `private key not allowed` });
	}

	if (k.key_ops && !k.key_ops.every(isPublicKeyUsage)) {
		return v.err({
			message: `"key_ops" must not contain private key usage for public keys`,
			path: ['key_ops'],
		});
	}

	return v.ok(k);
});

export type KeyUsage = v.Infer<typeof keyUsageSchema>;
export type Jwk = v.Infer<typeof jwkSchema>;
export type JwkPub = v.Infer<typeof jwkPubSchema>;
