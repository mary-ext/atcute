import * as t from './types.js';

export interface VerificationMaterial {
	type: string;
	publicKeyMultibase: string;
}

export const isAtprotoServiceEndpoint = (input: string): boolean => {
	const url = URL.parse(input);

	return (
		url !== null &&
		(url.protocol === 'https:' || url.protocol === 'http:') &&
		url.pathname === '/' &&
		url.search === '' &&
		url.hash === ''
	);
};

export const getAtprotoVerificationMaterial = (doc: t.DidDocument): VerificationMaterial | undefined => {
	const verificationMethods = doc.verificationMethod;
	if (!verificationMethods) {
		return;
	}

	const expectedId = `${doc.id}#atproto`;

	for (let idx = 0, len = verificationMethods.length; idx < len; idx++) {
		const { id, type, publicKeyMultibase } = verificationMethods[idx];

		if (id !== expectedId) {
			continue;
		}

		if (publicKeyMultibase === undefined) {
			continue;
		}

		return { type, publicKeyMultibase };
	}
};

export const getAtprotoServiceEndpoint = (
	doc: t.DidDocument,
	predicate: { id: `#${string}`; type?: string },
): string | undefined => {
	const services = doc.service;
	if (!services) {
		return;
	}

	const expectedId = doc.id + predicate.id;
	const expectedType = predicate.type;

	for (let idx = 0, len = services.length; idx < len; idx++) {
		const { id, type, serviceEndpoint } = services[idx];

		if (id !== expectedId) {
			continue;
		}

		if (expectedType !== undefined) {
			if (Array.isArray(type)) {
				if (!type.includes(expectedType)) {
					continue;
				}
			} else {
				if (type !== expectedType) {
					continue;
				}
			}
		}

		if (typeof serviceEndpoint !== 'string' || !isAtprotoServiceEndpoint(serviceEndpoint)) {
			continue;
		}

		return serviceEndpoint;
	}
};

export const getPdsEndpoint = (doc: t.DidDocument): string | undefined => {
	return getAtprotoServiceEndpoint(doc, {
		id: '#atproto_pds',
		type: 'AtprotoPersonalDataServer',
	});
};

export const getLabelerEndpoint = (doc: t.DidDocument): string | undefined => {
	return getAtprotoServiceEndpoint(doc, {
		id: '#atproto_labeler',
		type: 'AtprotoLabeler',
	});
};

export const getBlueskyChatEndpoint = (doc: t.DidDocument): string | undefined => {
	return getAtprotoServiceEndpoint(doc, {
		id: '#bsky_chat',
		type: 'BskyChatService',
	});
};

export const getBlueskyFeedgenEndpoint = (doc: t.DidDocument): string | undefined => {
	return getAtprotoServiceEndpoint(doc, {
		id: '#bsky_fg',
		type: 'BskyFeedGenerator',
	});
};

export const getBlueskyNotificationEndpoint = (doc: t.DidDocument): string | undefined => {
	return getAtprotoServiceEndpoint(doc, {
		id: '#bsky_notif',
		type: 'BskyNotificationService',
	});
};
