import type { Did, Nsid } from '@atcute/lexicons';
import { isDid, isNsid } from '@atcute/lexicons/syntax';
import { fromBase64Url } from '@atcute/multibase';
import { decodeUtf8From, encodeUtf8 } from '@atcute/uint8array';

import * as v from '@badrap/valita';

import type { Result } from '../types/misc.ts';

import type { AuthError } from './types.ts';

const didString = v.string().assert(isDid, `must be a did`);
const nsidString = v.string().assert(isNsid, `must be an nsid`);

const integer = v.number().assert((input) => input >= 0 && Number.isSafeInteger(input), `must be an integer`);

export interface JwtHeader {
	typ?: string;
	alg: string;
}

const jwtHeader: v.Type<JwtHeader> = v.object({
	typ: v.string().optional(),
	alg: v.string(),
});

export interface JwtPayload {
	iss: Did;
	aud: Did;
	exp: number;
	iat?: number;
	lxm?: Nsid;
	jti?: string;
}

const jwtPayload: v.Type<JwtPayload> = v
	.object({
		/** issuer */
		iss: didString,
		/** target audience */
		aud: didString,
		/** expiration time */
		exp: integer,
		/** creation time */
		iat: integer.optional(),
		/** xrpc operation being invoked */
		lxm: nsidString.optional(),
		/** unique identifier */
		jti: v.string().optional(),
	})
	.assert(({ iat, exp }) => iat === undefined || exp > iat, {
		message: `expiry time must be greater than issued time`,
		path: ['exp'],
	});

export interface ParsedJwt {
	header: JwtHeader;
	payload: JwtPayload;
	message: Uint8Array<ArrayBuffer>;
	signature: Uint8Array<ArrayBuffer>;
}

const readJwtPortion = <T>(schema: v.Type<T>, input: string): Result<T, AuthError> => {
	try {
		const raw = decodeUtf8From(fromBase64Url(input));
		const json = JSON.parse(raw);

		const result = schema.try(json, { mode: 'passthrough' });
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

const readJwtSignature = (input: string): Result<Uint8Array<ArrayBuffer>, AuthError> => {
	try {
		return { ok: true, value: fromBase64Url(input) };
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
			message: encodeUtf8(`${headerString}.${payloadString}`),
			signature: signature.value,
		},
	};
};
