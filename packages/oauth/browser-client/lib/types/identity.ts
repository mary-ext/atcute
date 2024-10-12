import type { At } from '@atcute/client/lexicons';

export interface IdentityMetadata {
	id: At.DID;
	raw: string;
	pds: URL;
}
