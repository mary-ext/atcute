import type {} from '@atcute/atproto';

declare global {
	interface RequestInit {
		duplex?: 'half' | 'full';
	}
}
