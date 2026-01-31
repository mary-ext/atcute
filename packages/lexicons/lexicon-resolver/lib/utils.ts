import type { Nsid } from '@atcute/lexicons/syntax';

export const nsidToLookupDomain = (nsid: Nsid): string => {
	const segments = nsid.split('.');
	// Remove the last segment (method name) and reverse to get domain format
	// oxlint-disable-next-line unicorn/no-array-reverse -- slice already clones
	return segments.slice(0, -1).reverse().join('.');
};
