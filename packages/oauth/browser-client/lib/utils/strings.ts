import type { At } from '@atcute/client/lexicons';

export const isDid = (value: string): value is At.DID => {
	return value.startsWith('did:');
};
