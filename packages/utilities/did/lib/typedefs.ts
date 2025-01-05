import * as v from '@badrap/valita';

import { isDid } from './did.js';
import * as t from './types.js';

export const FRAGMENT_RE = /^#[^#]+$/;
export const MULTIBASE_RE = /^z[a-km-zA-HJ-NP-Z1-9]+$/;

export const rfc3968UriSchema = v.string().assert((input) => {
	return URL.canParse(input);
}, `must be a url`);

export const didRelativeUri = v.string().assert((input) => {
	return FRAGMENT_RE.test(input) || URL.canParse(input);
}, `must be a did relative uri`);

export const multibaseString = v.string().assert((input) => {
	return MULTIBASE_RE.test(input);
}, `must be a base58 multibase`);

export const didString = v.string().assert(isDid, `must be a did`);

export const verificationMethod: v.Type<t.VerificationMethod> = v
	.object({
		id: didRelativeUri,
		type: v.string(),
		controller: didString,
		publicKeyMultibase: multibaseString.optional(),
		publicKeyJwk: v.record().optional(),
	})
	.chain((input) => {
		switch (input.type) {
			case 'Multikey': {
				if (input.publicKeyMultibase === undefined) {
					return v.err({ message: `missing multikey`, path: ['publicKeyMultibase'] });
				}

				break;
			}
			case 'EcdsaSecp256k1VerificationKey2019':
			case 'EcdsaSecp256r1VerificationKey2019': {
				if (input.publicKeyMultibase === undefined) {
					return v.err({ message: `missing multibase key`, path: ['publicKeyMultibase'] });
				}

				break;
			}
		}

		return v.ok(input);
	});

export const service: v.Type<t.Service> = v.object({
	// should've only been RFC3968, but did:plc uses relative URIs.
	id: didRelativeUri,
	type: v.union(v.string(), v.array(v.string())),
	serviceEndpoint: v.union(
		rfc3968UriSchema,
		v.record(rfc3968UriSchema),
		v.array(v.union(rfc3968UriSchema, v.record(rfc3968UriSchema))),
	),
});

export const didDocument: v.Type<t.DidDocument> = v
	.object({
		'@context': v.array(rfc3968UriSchema),

		id: didString,

		alsoKnownAs: v
			.array(rfc3968UriSchema)
			.chain((input) => {
				for (let i = 0, len = input.length; i < len; i++) {
					const aka = input[i];

					for (let j = 0; j < i; j++) {
						if (aka === input[j]) {
							return v.err({
								message: `duplicate "${aka}" aka entry`,
								path: [i],
							});
						}
					}
				}

				return v.ok(input);
			})
			.optional(),
		verificationMethod: v
			.array(verificationMethod)
			.chain((input) => {
				for (let i = 0, len = input.length; i < len; i++) {
					const method = input[i];
					const methodId = method.id;

					for (let j = 0; j < i; j++) {
						if (methodId === input[i].id) {
							return v.err({
								message: `duplicate "${methodId}" verification method`,
								path: [i, 'id'],
							});
						}
					}
				}

				return v.ok(input);
			})
			.optional(),
		service: v.array(service).optional(),

		controller: v.union(didString, v.array(didString)).optional(),
		authentication: v.array(v.union(didRelativeUri, verificationMethod)).optional(),
	})
	.chain((input) => {
		const { id: did, service: services } = input;

		let newServices: t.Service[] | undefined;

		if (services) {
			for (let i = 0, len = services.length; i < len; i++) {
				const service = services[i];

				let id = service.id;
				if (id[0] === '#') {
					id = did + id;

					if (newServices !== undefined) {
						newServices[i] = { ...service, id };
					} else {
						newServices = services.with(i, { ...service, id });
					}
				}

				for (let j = 0; j < i; j++) {
					if (id === (newServices ?? services)[j].id) {
						return v.err({
							message: `duplicate "${id}" service`,
							path: ['service', i, 'id'],
						});
					}
				}
			}
		}

		if (newServices !== undefined) {
			return v.ok({ ...input, service: newServices });
		}

		return v.ok(input);
	});
