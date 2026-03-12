import { bench, do_not_optimize, run, summary } from 'mitata';

// SIMD-like loop (current implementation)
const isAsciiWithoutCr_loop = (text: string): boolean => {
	const len = text.length;
	let idx = 0;

	while (idx + 3 < len) {
		const a = text.charCodeAt(idx);
		const b = text.charCodeAt(idx + 1);
		const c = text.charCodeAt(idx + 2);
		const d = text.charCodeAt(idx + 3);

		if ((a | b | c | d) > 0x7f || a === 0x0d || b === 0x0d || c === 0x0d || d === 0x0d) {
			return false;
		}

		idx += 4;
	}

	while (idx < len) {
		const code = text.charCodeAt(idx);
		if (code > 0x7f || code === 0x0d) {
			return false;
		}

		idx++;
	}

	return true;
};

// regex equivalent
const RE_NON_ASCII_OR_CR = /[^\x00-\x7f]|\r/;
const isAsciiWithoutCr_regex = (text: string): boolean => {
	return !RE_NON_ASCII_OR_CR.test(text);
};

// test inputs
const SHORT_ASCII = 'hello world';
const MEDIUM_ASCII = 'The quick brown fox jumps over the lazy dog. '.repeat(10);
const LONG_ASCII = 'abcdefghijklmnopqrstuvwxyz0123456789 '.repeat(100);
const SHORT_UNICODE = 'hello \u{1F600} world';
const MEDIUM_UNICODE = 'The quick brown fox \u{1F600} jumps over the lazy dog. '.repeat(10);
const EARLY_FAIL = '\u{1F600}' + 'a'.repeat(1000);
const LATE_FAIL = 'a'.repeat(1000) + '\u{1F600}';
const CR_EARLY = '\r' + 'a'.repeat(1000);
const CR_LATE = 'a'.repeat(1000) + '\r';
const EMPTY = '';

// sanity checks
for (const [name, input] of Object.entries({
	SHORT_ASCII,
	MEDIUM_ASCII,
	LONG_ASCII,
	SHORT_UNICODE,
	MEDIUM_UNICODE,
	EARLY_FAIL,
	LATE_FAIL,
	CR_EARLY,
	CR_LATE,
	EMPTY,
})) {
	const a = isAsciiWithoutCr_loop(input);
	const b = isAsciiWithoutCr_regex(input);
	if (a !== b) {
		throw new Error(`mismatch on ${name}: loop=${a}, regex=${b}`);
	}
}

summary(() => {
	bench(`loop: short ascii (${SHORT_ASCII.length})`, function* () {
		yield {
			[0]() {
				return SHORT_ASCII;
			},
			bench(text: string) {
				return do_not_optimize(isAsciiWithoutCr_loop(text));
			},
		};
	});

	bench(`regex: short ascii (${SHORT_ASCII.length})`, function* () {
		yield {
			[0]() {
				return SHORT_ASCII;
			},
			bench(text: string) {
				return do_not_optimize(isAsciiWithoutCr_regex(text));
			},
		};
	});
});

summary(() => {
	bench(`loop: medium ascii (${MEDIUM_ASCII.length})`, function* () {
		yield {
			[0]() {
				return MEDIUM_ASCII;
			},
			bench(text: string) {
				return do_not_optimize(isAsciiWithoutCr_loop(text));
			},
		};
	});

	bench(`regex: medium ascii (${MEDIUM_ASCII.length})`, function* () {
		yield {
			[0]() {
				return MEDIUM_ASCII;
			},
			bench(text: string) {
				return do_not_optimize(isAsciiWithoutCr_regex(text));
			},
		};
	});
});

summary(() => {
	bench(`loop: long ascii (${LONG_ASCII.length})`, function* () {
		yield {
			[0]() {
				return LONG_ASCII;
			},
			bench(text: string) {
				return do_not_optimize(isAsciiWithoutCr_loop(text));
			},
		};
	});

	bench(`regex: long ascii (${LONG_ASCII.length})`, function* () {
		yield {
			[0]() {
				return LONG_ASCII;
			},
			bench(text: string) {
				return do_not_optimize(isAsciiWithoutCr_regex(text));
			},
		};
	});
});

summary(() => {
	bench(`loop: short unicode (${SHORT_UNICODE.length})`, function* () {
		yield {
			[0]() {
				return SHORT_UNICODE;
			},
			bench(text: string) {
				return do_not_optimize(isAsciiWithoutCr_loop(text));
			},
		};
	});

	bench(`regex: short unicode (${SHORT_UNICODE.length})`, function* () {
		yield {
			[0]() {
				return SHORT_UNICODE;
			},
			bench(text: string) {
				return do_not_optimize(isAsciiWithoutCr_regex(text));
			},
		};
	});
});

summary(() => {
	bench(`loop: medium unicode (${MEDIUM_UNICODE.length})`, function* () {
		yield {
			[0]() {
				return MEDIUM_UNICODE;
			},
			bench(text: string) {
				return do_not_optimize(isAsciiWithoutCr_loop(text));
			},
		};
	});

	bench(`regex: medium unicode (${MEDIUM_UNICODE.length})`, function* () {
		yield {
			[0]() {
				return MEDIUM_UNICODE;
			},
			bench(text: string) {
				return do_not_optimize(isAsciiWithoutCr_regex(text));
			},
		};
	});
});

summary(() => {
	bench(`loop: early unicode fail (${EARLY_FAIL.length})`, function* () {
		yield {
			[0]() {
				return EARLY_FAIL;
			},
			bench(text: string) {
				return do_not_optimize(isAsciiWithoutCr_loop(text));
			},
		};
	});

	bench(`regex: early unicode fail (${EARLY_FAIL.length})`, function* () {
		yield {
			[0]() {
				return EARLY_FAIL;
			},
			bench(text: string) {
				return do_not_optimize(isAsciiWithoutCr_regex(text));
			},
		};
	});
});

summary(() => {
	bench(`loop: late unicode fail (${LATE_FAIL.length})`, function* () {
		yield {
			[0]() {
				return LATE_FAIL;
			},
			bench(text: string) {
				return do_not_optimize(isAsciiWithoutCr_loop(text));
			},
		};
	});

	bench(`regex: late unicode fail (${LATE_FAIL.length})`, function* () {
		yield {
			[0]() {
				return LATE_FAIL;
			},
			bench(text: string) {
				return do_not_optimize(isAsciiWithoutCr_regex(text));
			},
		};
	});
});

summary(() => {
	bench(`loop: early CR fail (${CR_EARLY.length})`, function* () {
		yield {
			[0]() {
				return CR_EARLY;
			},
			bench(text: string) {
				return do_not_optimize(isAsciiWithoutCr_loop(text));
			},
		};
	});

	bench(`regex: early CR fail (${CR_EARLY.length})`, function* () {
		yield {
			[0]() {
				return CR_EARLY;
			},
			bench(text: string) {
				return do_not_optimize(isAsciiWithoutCr_regex(text));
			},
		};
	});
});

summary(() => {
	bench(`loop: late CR fail (${CR_LATE.length})`, function* () {
		yield {
			[0]() {
				return CR_LATE;
			},
			bench(text: string) {
				return do_not_optimize(isAsciiWithoutCr_loop(text));
			},
		};
	});

	bench(`regex: late CR fail (${CR_LATE.length})`, function* () {
		yield {
			[0]() {
				return CR_LATE;
			},
			bench(text: string) {
				return do_not_optimize(isAsciiWithoutCr_regex(text));
			},
		};
	});
});

summary(() => {
	bench('loop: empty', function* () {
		yield {
			[0]() {
				return EMPTY;
			},
			bench(text: string) {
				return do_not_optimize(isAsciiWithoutCr_loop(text));
			},
		};
	});

	bench('regex: empty', function* () {
		yield {
			[0]() {
				return EMPTY;
			},
			bench(text: string) {
				return do_not_optimize(isAsciiWithoutCr_regex(text));
			},
		};
	});
});

await run();
