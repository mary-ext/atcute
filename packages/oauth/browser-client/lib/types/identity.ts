import type { At } from '@atcute/client/lexicons';

export interface IdentityMetadata {
	id: At.Did;
	raw: string;
	pds: URL;
}
