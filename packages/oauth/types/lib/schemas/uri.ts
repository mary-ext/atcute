import * as v from '@badrap/valita';

import { isHostnameIP, isLocalHostname, isLoopbackHost } from './utils.js';

/**
 * valid, but potentially dangerous URL (`data:`, `file:`, `javascript:`, etc.).
 *
 * any value that matches this schema is safe to parse using `new URL()`.
 */
export const urlSchema = v.string().chain((input) => {
	if (input.includes(':') && URL.canParse(input)) {
		return v.ok(input);
	}
	return v.err(`must be a valid url`);
});

/** loopback URL (http://localhost, http://127.0.0.1, http://[::1]) */
export const loopbackUriSchema = urlSchema.chain((input) => {
	if (!input.startsWith('http://')) {
		return v.err(`loopback url must use http: protocol`);
	}

	const url = new URL(input);
	if (!isLoopbackHost(url.hostname)) {
		return v.err(`loopback url must use localhost, 127.0.0.1, or [::1] as hostname`);
	}

	return v.ok(input);
});

/** HTTPS URL with additional restrictions */
export const httpsUriSchema = urlSchema.chain((input) => {
	if (!input.startsWith('https://')) {
		return v.err(`url must use https: protocol`);
	}

	const url = new URL(input);

	if (isLoopbackHost(url.hostname)) {
		return v.err(`https url must not use a loopback host`);
	}

	if (!isHostnameIP(url.hostname)) {
		if (!url.hostname.includes('.')) {
			return v.err(`domain name must contain at least two segments`);
		}
		if (url.hostname.endsWith('.local')) {
			return v.err(`domain name must not end with .local`);
		}
	}

	return v.ok(input);
});

/** web URL (either loopback http or https) */
export const webUriSchema = urlSchema.chain((input, options) => {
	if (input.startsWith('http://')) {
		return loopbackUriSchema.try(input, options);
	}

	if (input.startsWith('https://')) {
		return httpsUriSchema.try(input, options);
	}

	return v.err(`url must use http: or https: protocol`);
});

/** web URL with a non-local hostname */
export const nonLocalWebUriSchema = webUriSchema.chain((input) => {
	const url = new URL(input);
	if (isLocalHostname(url.hostname)) {
		return v.err(`hostname is invalid`);
	}
	return v.ok(input);
});

/** private-use URI scheme (e.g., com.example.app:/callback) */
export const privateUseUriSchema = urlSchema.chain((input) => {
	const dotIdx = input.indexOf('.');
	const colonIdx = input.indexOf(':');

	if (dotIdx === -1 || colonIdx === -1 || dotIdx > colonIdx) {
		return v.err(`private-use uri scheme must contain a dot in the protocol`);
	}

	const url = new URL(input);
	const scheme = url.protocol.slice(0, -1);
	// oxlint-disable-next-line unicorn/no-array-reverse -- split already clones
	const domain = scheme.split('.').reverse().join('.');

	if (isLocalHostname(domain)) {
		return v.err(`private-use uri scheme must not be a local hostname`);
	}

	// RFC 8252: private-use URIs must use single slash after scheme
	if (url.href.startsWith(`${url.protocol}//`) || url.username || url.password || url.hostname || url.port) {
		return v.err(`private-use uri must be in the form scheme:/<path>`);
	}

	return v.ok(input);
});
