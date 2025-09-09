import type { Nsid } from '@atcute/lexicons/syntax';

export function nsidToAuthority(nsid: Nsid): string {
	const segments = nsid.split('.');
	// Remove the last segment (method name) and reverse to get domain format
	return segments.slice(0, -1).reverse().join('.');
}