import * as v from 'valibot';

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

export const keyUsageSchema = v.picklist(KEY_USAGE);

export const publicKeyUsageSchema = v.picklist(PUBLIC_KEY_USAGE);

const jwkBaseEntries = {
	kty: v.string(),
	alg: v.optional(v.string()),
	kid: v.optional(v.string()),
	use: v.optional(v.union([v.literal('sig'), v.literal('enc')])),
	key_ops: v.optional(v.array(keyUsageSchema)),

	// X.509
	x5c: v.optional(v.array(v.string())),
	x5t: v.optional(v.string()),
	'x5t#S256': v.optional(v.string()),
	x5u: v.optional(v.string()),

	// WebCrypto
	ext: v.optional(v.boolean()),

	// Federation Historical Keys Response
	iat: v.optional(v.number()),
	exp: v.optional(v.number()),
	nbf: v.optional(v.number()),
	revoked: v.optional(
		v.looseObject({
			revoked_at: v.number(),
			reason: v.optional(v.string()),
		}),
	),
};

const jwkRsaKeySchema = v.looseObject({
	...jwkBaseEntries,
	kty: v.literal('RSA'),
	alg: v.optional(
		v.union([
			v.literal('RS256'),
			v.literal('RS384'),
			v.literal('RS512'),
			v.literal('PS256'),
			v.literal('PS384'),
			v.literal('PS512'),
		]),
	),
	n: v.string(),
	e: v.string(),
	d: v.optional(v.string()),
	p: v.optional(v.string()),
	q: v.optional(v.string()),
	dp: v.optional(v.string()),
	dq: v.optional(v.string()),
	qi: v.optional(v.string()),
	oth: v.optional(
		v.array(
			v.looseObject({
				r: v.optional(v.string()),
				d: v.optional(v.string()),
				t: v.optional(v.string()),
			}),
		),
	),
});

const jwkEcKeySchema = v.looseObject({
	...jwkBaseEntries,
	kty: v.literal('EC'),
	alg: v.optional(v.union([v.literal('ES256'), v.literal('ES384'), v.literal('ES512')])),
	crv: v.union([v.literal('P-256'), v.literal('P-384'), v.literal('P-521')]),
	x: v.string(),
	y: v.string(),
	d: v.optional(v.string()),
});

const jwkEcSecp256k1KeySchema = v.looseObject({
	...jwkBaseEntries,
	kty: v.literal('EC'),
	alg: v.optional(v.literal('ES256K')),
	crv: v.literal('secp256k1'),
	x: v.string(),
	y: v.string(),
	d: v.optional(v.string()),
});

const jwkOkpKeySchema = v.looseObject({
	...jwkBaseEntries,
	kty: v.literal('OKP'),
	alg: v.optional(v.literal('EdDSA')),
	crv: v.union([v.literal('Ed25519'), v.literal('Ed448')]),
	x: v.string(),
	d: v.optional(v.string()),
});

const jwkSymKeySchema = v.looseObject({
	...jwkBaseEntries,
	kty: v.literal('oct'),
	alg: v.optional(v.union([v.literal('HS256'), v.literal('HS384'), v.literal('HS512')])),
	k: v.string(),
});

const hasPrivateSecret = <J extends object>(jwk: J): boolean => {
	return ('d' in jwk && jwk.d != null) || ('k' in jwk && jwk.k != null);
};

const isPublicJwk = <J extends object>(jwk: J): boolean => {
	return !hasPrivateSecret(jwk);
};

/** JWK schema for known key types */
export const jwkSchema = v.pipe(
	v.union([jwkRsaKeySchema, jwkEcKeySchema, jwkEcSecp256k1KeySchema, jwkOkpKeySchema, jwkSymKeySchema]),
	v.forward(
		v.check((k) => k.use == null || isPublicJwk(k), `"use" can only be used with public keys`),
		['use'],
	),
	v.forward(
		v.check(
			(k) => !(k.key_ops?.some(isPrivateKeyUsage) && isPublicJwk(k)),
			`private key usage not allowed for public keys`,
		),
		['key_ops'],
	),
	v.forward(
		v.check((k) => !k.key_ops || k.key_ops.every(isLastOccurrence), `key_ops must not contain duplicates`),
		['key_ops'],
	),
	v.forward(
		v.check((k) => {
			if (k.use == null || k.key_ops == null) {
				return true;
			}
			return (
				(k.use === 'sig' && k.key_ops.every(isSigKeyUsage)) ||
				(k.use === 'enc' && k.key_ops.every(isEncKeyUsage))
			);
		}, `"key_ops" must be consistent with "use"`),
		['key_ops'],
	),
);

/** public JWK schema (kid required, no private keys) */
export const jwkPubSchema = v.pipe(
	jwkSchema,
	v.forward(
		v.check((k) => k.kid != null, `"kid" is required`),
		['kid'],
	),
	v.check((k) => isPublicJwk(k), `private key not allowed`),
	v.forward(
		v.check(
			(k) => !k.key_ops || k.key_ops.every(isPublicKeyUsage),
			`"key_ops" must not contain private key usage for public keys`,
		),
		['key_ops'],
	),
);

export type KeyUsage = v.InferOutput<typeof keyUsageSchema>;
export type Jwk = v.InferOutput<typeof jwkSchema>;
export type JwkPub = v.InferOutput<typeof jwkPubSchema>;
