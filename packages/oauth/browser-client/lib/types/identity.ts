import type { Did } from '@atcute/lexicons';

export interface IdentityMetadata {
	id: Did;
	raw: string;
	pds: URL;
}
