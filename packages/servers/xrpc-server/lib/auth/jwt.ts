import * as v from '@badrap/valita';

import { isDid, isNsid } from '@atcute/lexicons/syntax';
import { fromBase64 } from '@atcute/multibase';
import { decodeUtf8From } from '@atcute/uint8array';

import type { Result } from '../types/misc.js';

import type { AuthError } from './types.js';

const encoder = new TextEncoder();

const didString = v.string().assert(isDid, `must be a did`);
const nsidString = v.string().assert(isNsid, `must be an nsid`);

const integer = v.number().assert((input) => input >= 0 && Number.isSafeInteger(input), `must be an integer`);

const jwtHeader = v.object({
	typ: v.string().optional(),
	alg: v.string(),
});

export interface JwtHeader extends v.Infer<typeof jwtHeader> {}

const jwtPayload = v
	.object({
		iss: didString,
		aud: didString,
		exp: integer,
		iat: integer.optional(),
		lxm: nsidString.optional(),
		jti: v.string().optional(),
	})
	.assert(({ iat, exp }) => iat === undefined || exp > iat, {
		message: `expiry time must be greater than issued time`,
		path: ['exp'],
	});

export interface JwtPayload extends v.Infer<typeof jwtPayload> {}

export interface ParsedJwt {
	header: JwtHeader;
	payload: JwtPayload;
	message: Uint8Array;
	signature: Uint8Array;
}

const readJwtPortion = <T>(schema: v.Type<T>, input: string): Result<T, AuthError> => {
	try {
		const raw = decodeUtf8From(fromBase64(input));
		const json = JSON.parse(raw);

		const result = schema.try(json);
		if (result.ok) {
			return result;
		}
	} catch {}

	return {
		ok: false,
		error: {
			error: `MalformedJwt`,
			description: `jwt is malformed`,
		},
	};
};

const readJwtSignature = (input: string): Result<Uint8Array, AuthError> => {
	try {
		return { ok: true, value: fromBase64(input) };
	} catch {}

	return {
		ok: false,
		error: {
			error: `MalformedJwt`,
			description: `jwt is malformed`,
		},
	};
};

export const parseJwt = (jwtString: string): Result<ParsedJwt, AuthError> => {
	const parts = jwtString.split('.');
	if (parts.length !== 3) {
		return {
			ok: false,
			error: {
				error: `MalformedJwt`,
				description: `jwt is malformed`,
			},
		};
	}

	const [headerString, payloadString, signatureString] = parts;

	const header = readJwtPortion(jwtHeader, headerString);
	if (!header.ok) {
		return header;
	}

	const payload = readJwtPortion(jwtPayload, payloadString);
	if (!payload.ok) {
		return payload;
	}

	const signature = readJwtSignature(signatureString);
	if (!signature.ok) {
		return signature;
	}

	return {
		ok: true,
		value: {
			header: header.value,
			payload: payload.value,
			message: encoder.encode(`${headerString}.${payloadString}`),
			signature: signature.value,
		},
	};
};
