import { isAtprotoAudience } from '@atcute/identity';
import type { Did, Nsid } from '@atcute/lexicons';
import { isDid, isNsid, type AtprotoAudience } from '@atcute/lexicons/syntax';
import { fromBase64Url } from '@atcute/multibase';
import { decodeUtf8From, encodeUtf8 } from '@atcute/uint8array';

import * as v from 'valibot';

import type { Result } from '../types/misc.ts';

import type { AuthError } from './types.ts';

const didString: v.GenericSchema<unknown, Did> = v.pipe(
	v.string(),
	v.check((input) => isDid(input), `must be a did`),
	v.transform((value) => value as Did),
);
const audienceString: v.GenericSchema<unknown, Did | AtprotoAudience> = v.pipe(
	v.string(),
	v.check((input) => isAtprotoAudience(input) || isDid(input), `must be a did or atproto audience`),
	v.transform((value) => value as Did | AtprotoAudience),
);
const nsidString: v.GenericSchema<unknown, Nsid> = v.pipe(
	v.string(),
	v.check((input) => isNsid(input), `must be an nsid`),
	v.transform((value) => value as Nsid),
);

const integer = v.pipe(
	v.number(),
	v.check((input) => input >= 0 && Number.isSafeInteger(input), `must be an integer`),
);

export interface JwtHeader {
	typ?: string;
	alg: string;
	/** signing key identifier; a DID fragment, defaults to `#atproto` when absent */
	kid?: string;
}

const jwtHeader: v.GenericSchema<unknown, JwtHeader> = v.looseObject({
	typ: v.optional(v.string()),
	alg: v.string(),
	kid: v.optional(v.string()),
});

export interface JwtPayload {
	iss: Did;
	aud: Did | AtprotoAudience;
	exp: number;
	iat?: number;
	/** not-before time; token is invalid before this unix timestamp */
	nbf?: number;
	lxm: Nsid;
	jti?: string;
}

const jwtPayload: v.GenericSchema<unknown, JwtPayload> = v.pipe(
	v.looseObject({
		/** issuer */
		iss: didString,
		/** target audience; a bare DID or a DID with service fragment (e.g. `did:web:x.example#svc`) */
		aud: audienceString,
		/** expiration time */
		exp: integer,
		/** creation time */
		iat: v.optional(integer),
		/** not-before time */
		nbf: v.optional(integer),
		/** xrpc operation being invoked; required per atproto service auth spec */
		lxm: nsidString,
		/** unique identifier */
		jti: v.optional(v.string()),
	}),
	v.forward(
		v.check(({ iat, exp }) => iat === undefined || exp > iat, `expiry time must be greater than issued time`),
		['exp'],
	),
);

export interface ParsedJwt {
	header: JwtHeader;
	payload: JwtPayload;
	message: Uint8Array<ArrayBuffer>;
	signature: Uint8Array<ArrayBuffer>;
}

const readJwtPortion = <T>(schema: v.GenericSchema<unknown, T>, input: string): Result<T, AuthError> => {
	try {
		const raw = decodeUtf8From(fromBase64Url(input));
		const json = JSON.parse(raw);

		const result = v.safeParse(schema, json);
		if (result.success) {
			return { ok: true, value: result.output };
		}
	} catch {}

	return {
		ok: false,
		error: {
			error: `BadJwt`,
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
			error: `BadJwt`,
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
				error: `BadJwt`,
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
