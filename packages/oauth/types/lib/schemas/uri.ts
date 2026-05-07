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
	v.check((input) => input.startsWith('http://'), `loopback url must use http: protocol`),
	v.check(
		(input) => isLoopbackHost(new URL(input).hostname),
		`loopback url must use localhost, 127.0.0.1, or [::1] as hostname`,
	),
);

/** HTTPS URL with additional restrictions */
export const httpsUriSchema = v.pipe(
	urlSchema,
	v.check((input) => input.startsWith('https://'), `url must use https: protocol`),
	v.check((input) => !isLoopbackHost(new URL(input).hostname), `https url must not use a loopback host`),
	v.check((input) => {
		const url = new URL(input);
		if (isHostnameIP(url.hostname)) {
			return true;
		}
		return url.hostname.includes('.');
	}, `domain name must contain at least two segments`),
	v.check((input) => {
		const url = new URL(input);
		if (isHostnameIP(url.hostname)) {
			return true;
		}
		return !url.hostname.endsWith('.local');
	}, `domain name must not end with .local`),
);

/** web URL (either loopback http or https) */
export const webUriSchema: v.GenericSchema<unknown, string> = v.pipe(
	urlSchema,
	v.rawTransform<string, string>(({ dataset, addIssue, NEVER }) => {
		const input = dataset.value;
		let result;
		if (input.startsWith('http://')) {
			result = v.safeParse(loopbackUriSchema, input);
		} else if (input.startsWith('https://')) {
			result = v.safeParse(httpsUriSchema, input);
		} else {
			addIssue({ message: `url must use http: or https: protocol` });
			return NEVER;
		}
		if (!result.success) {
			for (const issue of result.issues) {
				addIssue({ message: issue.message });
			}
			return NEVER;
		}
		return result.output;
	}),
);

/** web URL with a non-local hostname */
export const nonLocalWebUriSchema = v.pipe(
	webUriSchema,
	v.check((input) => !isLocalHostname(new URL(input).hostname), `hostname is invalid`),
);

/** private-use URI scheme (e.g., com.example.app:/callback) */
export const privateUseUriSchema = v.pipe(
	urlSchema,
	v.check((input) => {
		const dotIdx = input.indexOf('.');
		const colonIdx = input.indexOf(':');
		return dotIdx !== -1 && colonIdx !== -1 && dotIdx <= colonIdx;
	}, `private-use uri scheme must contain a dot in the protocol`),
	v.check((input) => {
		const url = new URL(input);
		const scheme = url.protocol.slice(0, -1);
		// oxlint-disable-next-line unicorn/no-array-reverse -- split already clones
		const domain = scheme.split('.').reverse().join('.');
		return !isLocalHostname(domain);
	}, `private-use uri scheme must not be a local hostname`),
	v.check((input) => {
		const url = new URL(input);
		// RFC 8252: private-use URIs must use single slash after scheme
		return !(
			url.href.startsWith(`${url.protocol}//`) ||
			url.username ||
			url.password ||
			url.hostname ||
			url.port
		);
	}, `private-use uri must be in the form scheme:/<path>`),
);
