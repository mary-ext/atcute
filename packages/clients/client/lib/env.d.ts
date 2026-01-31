// oxlint-disable-next-line unicorn/require-module-specifiers -- ambient type augmentation
import type {} from '@atcute/atproto';

declare global {
	interface RequestInit {
		duplex?: 'half' | 'full';
	}
}
