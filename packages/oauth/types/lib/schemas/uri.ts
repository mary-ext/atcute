import * as v from 'valibot';

import { isHostnameIP, isLocalHostname, isLoopbackHost } from './utils.ts';

/**
 * valid, but potentially dangerous URL (`data:`, `file:`, `javascript:`, etc.).
 *
 * any value that matches this schema is safe to parse using `new URL()`.
 */
export const urlSchema = v.pipe(
	v.string(),
	v.check((input) => input.includes(':') && URL.canParse(input), `must be a valid url`),
);

/** loopback URL (http://localhost, http://127.0.0.1, http://[::1]) */
export const loopbackUriSchema = v.pipe(
	urlSchema,
	v.rawCheck(({ dataset, addIssue }) => {
		if (!dataset.typed) {
			return;
		}
		const input = dataset.value;
		if (!input.startsWith('http://')) {
			addIssue({ message: `loopback url must use http: protocol` });
			return;
		}
		if (!isLoopbackHost(new URL(input).hostname)) {
			addIssue({ message: `loopback url must use localhost, 127.0.0.1, or [::1] as hostname` });
		}
	}),
);

/** HTTPS URL with additional restrictions */
export const httpsUriSchema = v.pipe(
	urlSchema,
	v.rawCheck(({ dataset, addIssue }) => {
		if (!dataset.typed) {
			return;
		}
		const input = dataset.value;
		if (!input.startsWith('https://')) {
			addIssue({ message: `url must use https: protocol` });
			return;
		}

		const url = new URL(input);

		if (isLoopbackHost(url.hostname)) {
			addIssue({ message: `https url must not use a loopback host` });
			return;
		}

		if (!isHostnameIP(url.hostname)) {
			if (!url.hostname.includes('.')) {
				addIssue({ message: `domain name must contain at least two segments` });
				return;
			}
			if (url.hostname.endsWith('.local')) {
				addIssue({ message: `domain name must not end with .local` });
			}
		}
	}),
);

/** web URL (either loopback http or https) */
export const webUriSchema = v.union(
	[loopbackUriSchema, httpsUriSchema],
	`url must use http: or https: protocol`,
);

/** web URL with a non-local hostname */
export const nonLocalWebUriSchema = v.pipe(
	webUriSchema,
	v.check((input) => !isLocalHostname(new URL(input).hostname), `hostname is invalid`),
);

/** private-use URI scheme (e.g., com.example.app:/callback) */
export const privateUseUriSchema = v.pipe(
	urlSchema,
	v.rawCheck(({ dataset, addIssue }) => {
		if (!dataset.typed) {
			return;
		}
		const input = dataset.value;

		const dotIdx = input.indexOf('.');
		const colonIdx = input.indexOf(':');
		if (dotIdx === -1 || colonIdx === -1 || dotIdx > colonIdx) {
			addIssue({ message: `private-use uri scheme must contain a dot in the protocol` });
			return;
		}

		const url = new URL(input);
		const scheme = url.protocol.slice(0, -1);
		// oxlint-disable-next-line unicorn/no-array-reverse -- split already clones
		const domain = scheme.split('.').reverse().join('.');
		if (isLocalHostname(domain)) {
			addIssue({ message: `private-use uri scheme must not be a local hostname` });
			return;
		}

		// RFC 8252: private-use URIs must use single slash after scheme
		if (
			url.href.startsWith(`${url.protocol}//`) ||
			url.username ||
			url.password ||
			url.hostname ||
			url.port
		) {
			addIssue({ message: `private-use uri must be in the form scheme:/<path>` });
		}
	}),
);
