import type { Handle } from '@atcute/lexicons';
import { isHandle } from '@atcute/lexicons/syntax';

import * as t from './types.ts';

export interface VerificationMaterial {
	type: string;
	publicKeyMultibase: string;
}

const isUrlParseSupported = 'parse' in URL;

export const isAtprotoServiceEndpoint = (input: string): boolean => {
	let url: URL | null = null;
	if (isUrlParseSupported) {
		url = URL.parse(input);
	} else {
		try {
			url = new URL(input);
		} catch {}
	}

	return (
		url !== null &&
		(url.protocol === 'https:' || url.protocol === 'http:') &&
		url.pathname === '/' &&
		url.search === '' &&
		url.hash === ''
	);
};

export const getVerificationMaterial = (
	doc: t.DidDocument,
	id: `#${string}`,
): VerificationMaterial | undefined => {
	const verificationMethods = doc.verificationMethod;
	if (!verificationMethods) {
		return;
	}

	const expectedId = `${doc.id}${id}`;

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

export const getAtprotoVerificationMaterial = (doc: t.DidDocument): VerificationMaterial | undefined => {
	return getVerificationMaterial(doc, '#atproto');
};

export const getAtprotoLabelerVerificationMaterial = (
	doc: t.DidDocument,
): VerificationMaterial | undefined => {
	return getVerificationMaterial(doc, '#atproto_label');
};

export const getAtprotoHandle = (doc: t.DidDocument): Handle | null | undefined => {
	const alsoKnownAs = doc.alsoKnownAs;
	if (!alsoKnownAs) {
		return null;
	}

	const PREFIX = 'at://';

	for (let idx = 0, len = alsoKnownAs.length; idx < len; idx++) {
		const aka = alsoKnownAs[idx];

		if (!aka.startsWith(PREFIX)) {
			continue;
		}

		const raw = aka.slice(PREFIX.length);

		if (!isHandle(raw)) {
			return undefined;
		}

		return raw;
	}

	return null;
};

export const getAtprotoServiceEndpoint = (
	doc: t.DidDocument,
	predicate: { id: `#${string}`; type?: string },
): string | undefined => {
	const services = doc.service;
	if (!services) {
		return;
	}

	for (let idx = 0, len = services.length; idx < len; idx++) {
		const { id, type, serviceEndpoint } = services[idx];

		if (id !== predicate.id && id !== doc.id + predicate.id) {
			continue;
		}

		if (predicate.type !== undefined) {
			if (Array.isArray(type)) {
				if (!type.includes(predicate.type)) {
					continue;
				}
			} else {
				if (type !== predicate.type) {
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
