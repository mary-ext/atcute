import type { PrivateKey } from '@atcute/crypto';
import type { Did, Nsid } from '@atcute/lexicons';
import type { AtprotoAudience } from '@atcute/lexicons/syntax';
import { toBase64Url } from '@atcute/multibase';
import { encodeUtf8 } from '@atcute/uint8array';

import { nanoid } from 'nanoid';

import type { JwtHeader, JwtPayload } from './jwt.ts';

export interface CreateServiceJwtOptions {
	keypair: PrivateKey;
	issuer: Did;
	/** audience is either a bare DID or a DID with service fragment (e.g. `did:web:x.example#svc`) */
	audience: Did | AtprotoAudience;
	lxm: Nsid;
	issuedAt?: number;
	expiresIn?: number;
}

export const createServiceJwt = async (options: CreateServiceJwtOptions): Promise<string> => {
	const keypair = options.keypair;

	const issuedAt = Math.floor(options.issuedAt ?? Date.now() / 1_000);
	const expiresIn = Math.floor(options.expiresIn ?? 60);

	const header: JwtHeader = {
		typ: 'JWT',
		alg: keypair.jwtAlg,
	};

	const payload: JwtPayload = {
		aud: options.audience,
		exp: issuedAt + expiresIn,
		iat: issuedAt,
		iss: options.issuer,
		jti: nanoid(24),
		lxm: options.lxm,
	};

	const headerB64 = encodeJwtPortion(header);
	const payloadB64 = encodeJwtPortion(payload);
	const message = `${headerB64}.${payloadB64}`;

	const signature = await keypair.sign(encodeUtf8(message));
	const signatureB64 = toBase64Url(signature);

	return `${message}.${signatureB64}`;
};

const encodeJwtPortion = (data: unknown): string => {
	return toBase64Url(encodeUtf8(JSON.stringify(data)));
};
