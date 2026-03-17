import { bench, do_not_optimize, run, summary } from 'mitata';

import {
	getGraphemeLength as getGraphemeLengthNative,
	hasNative,
	isGraphemeLengthInRange as isGraphemeLengthInRangeNative,
} from './index.node.ts';
import {
	getGraphemeLength as getGraphemeLengthJs,
	isGraphemeLengthInRange as isGraphemeLengthInRangeJs,
} from './index.ts';

if (!hasNative) {
	throw new Error(`native binding not available`);
}

const benchFilter = process.env.BENCH_FILTER?.toLowerCase() ?? '';
const benchGroup = process.env.BENCH_GROUP?.toLowerCase() ?? 'all';
const benchCases = new Set(
	(process.env.BENCH_CASES ?? '')
		.split(',')
		.map((value) => value.trim().toLowerCase())
		.filter(Boolean),
);

const shouldRun = (group: 'length' | 'range', name: string): boolean => {
	if (benchGroup !== 'all' && benchGroup !== group) {
		return false;
	}

	if (benchCases.size !== 0) {
		return benchCases.has(name.toLowerCase());
	}

	if (benchFilter === '') {
		return true;
	}

	return `${group}:${name}`.toLowerCase().includes(benchFilter);
};

const cases = {
	ascii: 'The quick brown fox jumps over the lazy dog. '.repeat(16),
	combining: 'e\u0301'.repeat(256),
	bmpMixed: ('e\u0301a\r\n' + 'नमस्ते दुनिया ').repeat(160),
	crlf: 'a\r\nb'.repeat(256),
	family: '\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}'.repeat(64),
	flags: '\u{1F1FA}\u{1F1F8}'.repeat(256),
	devanagari: 'नमस्ते दुनिया '.repeat(128),
	mixed: ('hello \u{1F600} e\u0301 🇺🇸\r\n' + 'नमस्ते ').repeat(96),
} as const;

const lengths = Object.fromEntries(
	Object.entries(cases).map(([name, text]) => [name, getGraphemeLengthJs(text)]),
) as Record<keyof typeof cases, number>;

const rangeCases = {
	ascii: { text: cases.ascii, min: 0, max: cases.ascii.length + 1 },
	bmpMixed: { text: cases.bmpMixed, min: 0, max: lengths.bmpMixed },
	combining: { text: cases.combining, min: 0, max: lengths.combining },
	crlf: { text: cases.crlf, min: 0, max: lengths.crlf },
	family: { text: cases.family, min: 0, max: lengths.family },
	flags: { text: cases.flags, min: 0, max: lengths.flags },
	devanagari: { text: cases.devanagari, min: 0, max: lengths.devanagari },
	mixed: { text: cases.mixed, min: 0, max: lengths.mixed },
	overflowMixed: { text: cases.mixed, min: 0, max: 100 },
} as const;

for (const [name, text] of Object.entries(cases)) {
	const native = getGraphemeLengthNative(text);
	const js = getGraphemeLengthJs(text);
	if (native !== js) {
		throw new Error(`getGraphemeLength mismatch on ${name}: native=${native} js=${js}`);
	}
}

for (const [name, { text, min, max }] of Object.entries(rangeCases)) {
	const native = isGraphemeLengthInRangeNative(text, min, max);
	const js = isGraphemeLengthInRangeJs(text, min, max);
	if (native !== js) {
		throw new Error(`isGraphemeLengthInRange mismatch on ${name}: native=${native} js=${js}`);
	}
}

summary(() => {
	for (const [name, text] of Object.entries(cases)) {
		if (!shouldRun('length', name)) {
			continue;
		}

		bench(`native length: ${name}`, function* () {
			yield {
				[0]() {
					return text;
				},
				bench(input: string) {
					return do_not_optimize(getGraphemeLengthNative(input));
				},
			};
		});

		bench(`js length: ${name}`, function* () {
			yield {
				[0]() {
					return text;
				},
				bench(input: string) {
					return do_not_optimize(getGraphemeLengthJs(input));
				},
			};
		});
	}
});

summary(() => {
	for (const [name, { text, min, max }] of Object.entries(rangeCases)) {
		if (!shouldRun('range', name)) {
			continue;
		}

		bench(`native range: ${name}`, function* () {
			yield {
				[0]() {
					return text;
				},
				bench(input: string) {
					return do_not_optimize(isGraphemeLengthInRangeNative(input, min, max));
				},
			};
		});

		bench(`js range: ${name}`, function* () {
			yield {
				[0]() {
					return text;
				},
				bench(input: string) {
					return do_not_optimize(isGraphemeLengthInRangeJs(input, min, max));
				},
			};
		});
	}
});

await run();
