import { bench, do_not_optimize, run } from 'mitata';

import { tokenize } from './index.ts';

interface TestCase {
	name: string;
	text: string;
}

const TEST_CASES: TestCase[] = [
	{
		name: 'short-ui: plain words',
		text: 'hello world',
	},
	{
		name: 'short-ui: mention',
		text: '@alice.bsky.social hi there',
	},
	{
		name: 'short-ui: topics',
		text: '#atproto and #bluesky',
	},
	{
		name: 'short-ui: autolink',
		text: 'check this out: https://example.com',
	},
	{
		name: 'short-ui: underscore word',
		text: 'foo_bar_baz',
	},
	{
		name: 'short-ui: style mix',
		text: '**bold** and *italic* and `code`',
	},
	{
		name: 'short-ui: emote',
		text: 'hello :wave:',
	},
	{
		name: 'short-ui: markdown link',
		text: '[my site](https://example.com)',
	},
	{
		name: 'short-ui: cashtags',
		text: 'cost is $AAPL and $BTC',
	},
	{
		name: 'short-ui: no syntax',
		text: 'plain words only no syntax here',
	},
	{
		name: 'mixed-social: mention topic link',
		text: 'hello @alice.bsky.social! check out #atproto and https://atproto.com',
	},
	{
		name: 'mixed-social: nested emphasis',
		text: '___underlined__ but then not_ and ***bold** but then not*',
	},
	{
		name: 'mixed-social: escapes and markdown',
		text: 'foo\\@bar and \\__underlined__ and [**mixed** formatting](example.com)',
	},
	{
		name: 'mixed-social: delete emote link',
		text: 'watermelon ~~strike~~ and :party-parrot: and [repo](https://github.com/bluesky-social/atproto)',
	},
	{
		name: 'mixed-social: multiline autolink',
		text: 'https://github.com/mary-ext/atproto-scraping/commit/\ncaaa495ae654ef8a98f223f3cecfe2ca261d6b4f',
	},
	{
		name: 'mixed-social: prefixed autolink',
		text: 'abchttps://example.com/',
	},
	{
		name: 'mixed-social: punctuation edge',
		text: '@@bsky.app #cool# $AAPL$ and ((https://foo.com/thing_(cool)))',
	},
	{
		name: 'long-posts: english social post',
		text: 'Space penguin.\nThis is Arp 142, two interacting galaxies NGC 2936 and NGC 2937.\nProcessed by c.claude.\nhttps://www.flickr.com/photos/27527123@N02\n🔭 🧪',
	},
	{
		name: 'long-posts: japanese news',
		text: '米SNSに党派色 Xに反発、Blueskyに大統領選挙後に100万人登録 https://www.nikkei.com/article/DGXZQOGN14EX90U4A111C2000000/?n_cid=SNSBS001 Blueskyは世界の利用者数が1500万人に達したと明らかにしました。 #ニュース',
	},
	{
		name: 'long-posts: multilingual hashtags',
		text: '☀️Good morning☀️ #写真が好きな人と繋がりたい #Photography #Photo #風景写真 #青空 @bskyphotos.bsky.social',
	},
	{
		name: 'long-posts: full feature mix',
		text: 'hello @bob.bsky.social and [my site](https://example.com) with some `inline code` and ~~deleted~~ words plus ***nested emphasis*** for parser stress',
	},
];

for (const { name, text } of TEST_CASES) {
	bench(name, () => do_not_optimize(tokenize(text)));
}

await run();
