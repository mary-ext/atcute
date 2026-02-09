import { describe, expect, it } from 'vitest';

import { isNsid } from './nsid.ts';

describe('nsid validation', () => {
	it('validates nsid', () => {
		const validCases = [
			// length checks
			'com.' + 'o'.repeat(63) + '.foo',
			'com.example.' + 'o'.repeat(63),
			'com.' + 'middle.'.repeat(40) + 'foo',

			// valid examples
			'com.example.fooBar',
			'com.example.fooBarV2',
			'net.users.bob.ping',
			'a.b.c',
			'm.xn--masekowski-d0b.pl',
			'one.two.three',
			'one.two.three.four-and.FiVe',
			'one.2.three',
			'a-0.b-1.c',
			'a0.b1.cc',
			'cn.8.lex.stuff',
			'test.12345.record',
			'a01.thing.record',
			'a.0.c',
			'xn--fiqs8s.xn--fiqa61au8b7zsevnm8ak20mc4a87e.record.two',
			'a0.b1.c3',
			'com.example.f00',

			// allows onion (Tor) NSIDs
			'onion.expyuzz4wqqyqhjn.spec.getThing',
			'onion.g2zyxa5ihm7nsggfxnu52rck2vv4rvmdlkiu3zzui5du4xyclen53wid.lex.deleteThing',

			// allows starting-with-numeric segments (same as domains)
			'org.4chan.lex.getThing',
			'cn.8.lex.stuff',
			'onion.2gzyxa5ihm7nsggfxnu52rck2vv4rvmdlkiu3zzui5du4xyclen53wid.lex.deleteThing',
		];
		for (const case_ of validCases) {
			expect(isNsid(case_), case_).toBe(true);
		}

		const invalidCases = [
			// length checks
			'com.' + 'o'.repeat(64) + '.foo',
			'com.example.' + 'o'.repeat(64),
			'com.' + 'middle.'.repeat(50) + 'foo',
			// invalid examples
			'com.example.foo.*',
			'com.example.foo.blah*',
			'com.example.foo.*blah',
			'com.exa💩ple.thing',
			'a-0.b-1.c-3',
			'a-0.b-1.c-o',
			'1.0.0.127.record',
			'0two.example.foo',
			'example.com',
			'com.example',
			'a.',
			'.one.two.three',
			'one.two.three ',
			'one.two..three',
			'one .two.three',
			' one.two.three',
			'com.atproto.feed.p@st',
			'com.atproto.feed.p_st',
			'com.atproto.feed.p*st',
			'com.atproto.feed.po#t',
			'com.atproto.feed.p!ot',
			'com.example-.foo',
			'com.example.fooBar.2',
		];
		for (const case_ of invalidCases) {
			expect(isNsid(case_), case_).toBe(false);
		}
	});
});
