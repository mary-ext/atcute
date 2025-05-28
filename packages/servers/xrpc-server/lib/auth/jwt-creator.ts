import type { PrivateKey } from '@atcute/crypto';
import type { Did, Nsid } from '@atcute/lexicons';
import { toBase64Url } from '@atcute/multibase';
import { encodeUtf8 } from '@atcute/uint8array';

import { nanoid } from 'nanoid';

import type { JwtHeader, JwtPayload } from './jwt.js';

export interface CreateServiceJwtOptions {
	keypair: PrivateKey;
	issuer: Did;
	audience: Did;
	lxm: Nsid | null;
	issuedAt?: number;
	expiresIn?: number;
}

export const createServiceJwt = async (options: CreateServiceJwtOptions): Promise<string> => {
	const {
		keypair,
		issuer,
		audience,
		lxm,
		issuedAt = Math.floor(Date.now() / 1_000),
		expiresIn = 60,
	} = options;

	const header: JwtHeader = {
		typ: 'JWT',
		alg: keypair.jwtAlg,
	};

	const payload: JwtPayload = {
		aud: audience,
		exp: issuedAt + expiresIn,
		iss: issuer,
		iat: issuedAt,
		jti: nanoid(24),
		lxm: lxm ?? undefined,
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
