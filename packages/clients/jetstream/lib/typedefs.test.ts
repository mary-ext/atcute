import { parse } from 'valibot';
import { describe, expect, it } from 'vitest';

import { jetstreamEventSchema } from './typedefs.ts';

const did = 'did:plc:eygmaihciaxprqvxpfvl6flk';

describe('legacy event schemas', () => {
	it('exposes the optional v2 sequence cursor', () => {
		const event = parse(jetstreamEventSchema, {
			account: {
				active: true,
				did,
				seq: 1,
				time: '2024-09-09T19:46:02.329308Z',
			},
			cursor: 12_345,
			did,
			kind: 'account',
			time_us: 1_725_911_162_329_308,
		});

		expect(event.cursor).toBe(12_345);
	});

	it('accepts events from hosts that omit the cursor', () => {
		const event = parse(jetstreamEventSchema, {
			account: {
				active: true,
				did,
				seq: 1,
				time: '2024-09-09T19:46:02.329308Z',
			},
			did,
			kind: 'account',
			time_us: 1_725_911_162_329_308,
		});

		expect(event.cursor).toBeUndefined();
	});
});
