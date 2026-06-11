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

// grapheme counting is used for AT Protocol lexicon validation:
// - display names: max 64 graphemes
// - posts: max 300 graphemes
// - descriptions: max 256-300 graphemes
// - alt text: max 1000 graphemes
// - emoji reactions: exactly 1 grapheme
const cases = {
	displayName: 'maria \u{1F338}',
	post: 'just mass-migrated to bsky from twitter!! \u{1F389}\u{1F389}\u{1F389}\n\nfollow me for cat pics \u{1F431} and hot takes \u{1F525}\n\n#bsky #newhere #introduction',
	postJa:
		'きょうの天気はとても良かったです\u{2600}\uFE0F 散歩に行ってきました\u{1F6B6}\u200D\u2640\uFE0F\nお花見のシーズンですね\u{1F338}\u{1F338}',
	postKo:
		'\uC624\uB298 \uB0A0\uC528\uAC00 \uC815\uB9D0 \uC88B\uB124\uC694 \uC0B0\uCC45\uD558\uB7EC \uACF5\uC6D0\uC5D0 \uAC14\uB2E4\uC654\uC5B4\uC694 \uBC9A\uAF43\uC774 \uD65C\uC9DD \uD53C\uC5C8\uB354\uB77C\uACE0\uC694 \uAE30\uBD84\uC774 \uB108\uBB34 \uC88B\uC544\uC694',
	postEmoji:
		'\u{1F468}\u200D\u{1F4BB} shipping code at 2am \u{1F602}\u{1F602}\u{1F602} \u{1F1FA}\u{1F1F8}\u{1F1E7}\u{1F1F7} who needs sleep when you have \u2615\u2615\u2615 #devlife \u{1F525}\u{1F4AF}',
	altText:
		'a photograph of a sunset over the pacific ocean. the sky is painted in gradients of deep orange \u{1F7E0}, pink \u{1F338}, and purple \u{1F49C}. in the foreground, silhouettes of palm trees frame the scene. a small sailboat is visible on the horizon. the water reflects the warm colors of the sky, creating a mirror-like effect on the calm surface.',
	skinTone: '\u{1F44B}\u{1F3FB} \u{1F44B}\u{1F3FC} \u{1F44B}\u{1F3FD} \u{1F44B}\u{1F3FE} \u{1F44B}\u{1F3FF}',
	korean: '안녕하세요! 오늘 블루스카이에 가입했어요 \u{1F60A} 잘 부탁드립니다 \u{1F64F}',
} as const;

const rangeCases = {
	// typical validation: min=0, string fits within max — exercises the short-circuit
	displayName: { text: cases.displayName, min: 0, max: 64 },
	post: { text: cases.post, min: 0, max: 300 },
	postJa: { text: cases.postJa, min: 0, max: 300 },
	postEmoji: { text: cases.postEmoji, min: 0, max: 300 },
	altText: { text: cases.altText, min: 0, max: 1000 },
	korean: { text: cases.korean, min: 0, max: 300 },

	// emoji reaction validation: exactly 1 grapheme (min=1 forces counting)
	emojiReaction: { text: '\u{1F468}\u200D\u{1F469}\u200D\u{1F467}', min: 1, max: 1 },

	// overflow: post exceeds max, needs counting to detect
	postOverflow: { text: cases.altText, min: 0, max: 50 },
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

for (const [name, text] of Object.entries(cases)) {
	summary(() => {
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
	});
}

for (const [name, { text, min, max }] of Object.entries(rangeCases)) {
	summary(() => {
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
	});
}

await run();
