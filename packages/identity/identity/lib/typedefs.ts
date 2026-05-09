import { isDid, type Did } from '@atcute/lexicons/syntax';

import * as v from 'valibot';

const FRAGMENT_RE = /^#[^#]+$/;
const MULTIBASE_RE = /^z[a-km-zA-HJ-NP-Z1-9]+$/;

export const rfc3968UriSchema = v.pipe(
	v.string(),
	v.check((input) => URL.canParse(input), `must be a url`),
);

export const didRelativeUri = v.pipe(
	v.string(),
	v.check((input) => FRAGMENT_RE.test(input) || URL.canParse(input), `must be a did relative uri`),
);

export const multibaseString = v.pipe(v.string(), v.regex(MULTIBASE_RE, `must be a base58 multibase`));

export const didString = v.custom<Did>(isDid, `must be a did`);

export const verificationMethod = v.pipe(
	v.looseObject({
		id: didRelativeUri,
		type: v.string(),
		controller: didString,
		publicKeyMultibase: v.optional(multibaseString),
		publicKeyJwk: v.optional(v.record(v.string(), v.unknown())),
	}),
	v.forward(
		v.check((input) => {
			switch (input.type) {
				case 'Multikey':
				case 'EcdsaSecp256k1VerificationKey2019':
				case 'EcdsaSecp256r1VerificationKey2019':
					return input.publicKeyMultibase !== undefined;
			}
			return true;
		}, `missing public key multibase`),
		['publicKeyMultibase'],
	),
);

export const service = v.looseObject({
	// should've only been RFC3968, but did:plc uses relative URIs.
	id: didRelativeUri,
	type: v.union([v.string(), v.array(v.string())]),
	serviceEndpoint: v.union([
		rfc3968UriSchema,
		v.record(v.string(), rfc3968UriSchema),
		v.array(v.union([rfc3968UriSchema, v.record(v.string(), rfc3968UriSchema)])),
	]),
});

const hasDuplicates = <T>(arr: readonly T[], key: (item: T) => unknown = (x) => x): boolean => {
	const seen = new Set<unknown>();
	for (const item of arr) {
		const k = key(item);
		if (seen.has(k)) {
			return true;
		}
		seen.add(k);
	}
	return false;
};

export const didDocument = v.pipe(
	v.looseObject({
		'@context': v.optional(v.array(rfc3968UriSchema)),

		id: didString,

		alsoKnownAs: v.optional(
			v.pipe(
				v.array(rfc3968UriSchema),
				v.check((input) => !hasDuplicates(input), `duplicate aka entries`),
			),
		),
		verificationMethod: v.optional(
			v.pipe(
				v.array(verificationMethod),
				v.check((input) => !hasDuplicates(input, (m) => m.id), `duplicate verification method ids`),
			),
		),
		service: v.optional(v.array(service)),

		controller: v.optional(v.union([didString, v.array(didString)])),
		authentication: v.optional(v.array(v.union([didRelativeUri, verificationMethod]))),
	}),
	v.check((input) => {
		const services = input.service;
		if (!services?.length) {
			return true;
		}
		const did = input.id;
		const identifiers = services.map((s) => (s.id[0] === '#' ? did + s.id : s.id));
		return !hasDuplicates(identifiers);
	}, `duplicate service ids`),
);

export type VerificationMethod = v.InferOutput<typeof verificationMethod>;
export type Service = v.InferOutput<typeof service>;
export type DidDocument = v.InferOutput<typeof didDocument>;
