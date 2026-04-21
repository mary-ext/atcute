import type { AppBskyRichtextFacet } from '@atcute/bluesky';

import { bench, run } from 'mitata';

import { segmentize } from './index.ts';

interface TestCase {
	name: string;
	text: string;
	facets: AppBskyRichtextFacet.Main[];
}

export const TEST_CASES: TestCase[] = [
	{
		name: 'Butterfly effect',
		text: 'The butterfly effect, named by mathematician Edward Lorenz, is the idea that something as small as a butterfly flapping its wings can eventually cause a tornado. \n\nen.wikipedia.org/wiki/Butterf...',
		facets: [
			{
				features: [
					{ $type: 'app.bsky.richtext.facet#link', uri: 'https://en.wikipedia.org/wiki/Butterfly_effect' },
				],
				index: { byteEnd: 196, byteStart: 164 },
			},
		],
	},
	{
		name: 'Space penguin',
		text: 'Space penguin.\nThis is Arp 142, two interacting galaxies NGC 2936 and NGC 2937.\nProcessed by c.claude.\nwww.flickr.com/photos/27527...\n🔭 🧪',
		facets: [
			{
				features: [
					{ $type: 'app.bsky.richtext.facet#link', uri: 'https://www.flickr.com/photos/27527123@N02' },
				],
				index: { byteEnd: 133, byteStart: 103 },
			},
		],
	},
	{
		name: 'Football',
		text: 'All eyes are on the Bills, Chiefs, Josh Allen & Patrick Mahomes this week.\n\nAnd even through a "bad" stat line, the Colts film brought me to one conclusion:\n\nJosh Allen is playing the best football of his career.\n\nHere\'s why, all @theathletic.bsky.social: www.nytimes.com/athletic/591...',
		facets: [
			{
				features: [{ $type: 'app.bsky.richtext.facet#mention', did: 'did:plc:b2kutgxqlltwc6lhs724cfwr' }],
				index: { byteEnd: 260, byteStart: 236 },
			},
			{
				features: [
					{
						$type: 'app.bsky.richtext.facet#link',
						uri: 'https://www.nytimes.com/athletic/5918320/2024/11/13/josh-allen-bills-playing-the-best-football-of-his-career/?source=emp_shared_article',
					},
				],
				index: { byteEnd: 293, byteStart: 262 },
			},
		],
	},

	{
		name: 'JP art share 1',
		text: '猫エッセイと絵日記メインですが何でもない日常ポストも多めです。\n宜しくお願いしますmm\n#ブルスカ引越しフォロー祭り\n#絵柄が好みって人にフォローされたい',
		facets: [
			{
				features: [{ $type: 'app.bsky.richtext.facet#tag', tag: 'ブルスカ引越しフォロー祭り' }],
				index: { byteEnd: 164, byteStart: 124 },
			},
			{
				features: [{ $type: 'app.bsky.richtext.facet#tag', tag: '絵柄が好みって人にフォローされたい' }],
				index: { byteEnd: 217, byteStart: 165 },
			},
		],
	},
	{
		name: 'JP art share 2',
		text: '#絵描きさんと繋がりたい\n#秋の創作クラスタフォロー祭り\n#絵柄が好みって人にフォローされたい\n\n春夏秋冬セット！',
		facets: [
			{
				features: [{ $type: 'app.bsky.richtext.facet#tag', tag: '絵描きさんと繋がりたい' }],
				index: { byteEnd: 34, byteStart: 0 },
			},
			{
				features: [{ $type: 'app.bsky.richtext.facet#tag', tag: '秋の創作クラスタフォロー祭り' }],
				index: { byteEnd: 78, byteStart: 35 },
			},
			{
				features: [{ $type: 'app.bsky.richtext.facet#tag', tag: '絵柄が好みって人にフォローされたい' }],
				index: { byteEnd: 131, byteStart: 79 },
			},
		],
	},
	{
		name: 'JP news',
		text: '米SNSに党派色　Xに反発、Blueskyに大統領選挙後に100万人登録 \nwww.nikkei.com/article/DGXZ...\n\nBlueskyは世界の利用者数が1500万人に達したと明らかにしました。\n\nSNS利用者の移動を促しているのは、保守的な意見を発信・拡散しやすいように起業家イーロン・マスク氏がX（旧Twitter）を変えたことです。\n\n#ニュース',
		facets: [
			{
				features: [
					{
						$type: 'app.bsky.richtext.facet#link',
						uri: 'https://www.nikkei.com/article/DGXZQOGN14EX90U4A111C2000000/?n_cid=SNSBS001',
					},
				],
				index: { byteEnd: 112, byteStart: 82 },
			},
			{
				features: [{ $type: 'app.bsky.richtext.facet#tag', tag: 'ニュース' }],
				index: { byteEnd: 405, byteStart: 392 },
			},
		],
	},
	{
		name: 'JP photography 1',
		text: '☀️𝐺𝑜𝑜𝑑 𝑚𝑜𝑟𝑛𝑖𝑛𝑔☀️\n\n#写真が好きな人と繋がりたい\n#写真撮ってる人と繋がりたい\n#Bluesky写真部  #ブルスコ写真部\n#Photography\n#Photo \n#風景写真\n#青空\n#Bluesky\n\n@bskyphotos.bsky.social',
		facets: [
			{
				features: [{ $type: 'app.bsky.richtext.facet#tag', tag: '写真が好きな人と繋がりたい' }],
				index: { byteEnd: 99, byteStart: 59 },
			},
			{
				features: [{ $type: 'app.bsky.richtext.facet#tag', tag: '写真撮ってる人と繋がりたい' }],
				index: { byteEnd: 140, byteStart: 100 },
			},
			{
				features: [{ $type: 'app.bsky.richtext.facet#tag', tag: 'Bluesky写真部' }],
				index: { byteEnd: 158, byteStart: 141 },
			},
			{
				features: [{ $type: 'app.bsky.richtext.facet#tag', tag: 'ブルスコ写真部' }],
				index: { byteEnd: 183, byteStart: 161 },
			},
			{
				features: [{ $type: 'app.bsky.richtext.facet#tag', tag: 'Photography' }],
				index: { byteEnd: 196, byteStart: 184 },
			},
			{
				features: [{ $type: 'app.bsky.richtext.facet#tag', tag: 'Photo' }],
				index: { byteEnd: 203, byteStart: 197 },
			},
			{
				features: [{ $type: 'app.bsky.richtext.facet#tag', tag: '風景写真' }],
				index: { byteEnd: 218, byteStart: 205 },
			},
			{
				features: [{ $type: 'app.bsky.richtext.facet#tag', tag: '青空' }],
				index: { byteEnd: 226, byteStart: 219 },
			},
			{
				features: [{ $type: 'app.bsky.richtext.facet#tag', tag: 'Bluesky' }],
				index: { byteEnd: 235, byteStart: 227 },
			},
			{
				features: [{ $type: 'app.bsky.richtext.facet#mention', did: 'did:plc:wgralxmrka2hirg3rztwnysc' }],
				index: { byteEnd: 260, byteStart: 237 },
			},
		],
	},
	{
		name: 'JP photography 2',
		text: "水俣ローズフェスタ最後の写真。\nまた会える春を楽しみにしてるね。\nUsakichi, the traveling stuffed rabbit.\nBright red rose, let's meet again next spring.\n　#ぬい撮り　#ぬい活　#ぬいぐるみ\n　#photography ＃写真 #flowers #花\n　#twilightsky",
		facets: [
			{
				features: [{ $type: 'app.bsky.richtext.facet#tag', tag: 'ぬい撮り' }],
				index: { byteEnd: 198, byteStart: 185 },
			},
			{
				features: [{ $type: 'app.bsky.richtext.facet#tag', tag: 'ぬい活' }],
				index: { byteEnd: 211, byteStart: 201 },
			},
			{
				features: [{ $type: 'app.bsky.richtext.facet#tag', tag: 'ぬいぐるみ' }],
				index: { byteEnd: 230, byteStart: 214 },
			},
			{
				features: [{ $type: 'app.bsky.richtext.facet#tag', tag: 'photography' }],
				index: { byteEnd: 246, byteStart: 234 },
			},
			{
				features: [{ $type: 'app.bsky.richtext.facet#tag', tag: '写真' }],
				index: { byteEnd: 256, byteStart: 247 },
			},
			{
				features: [{ $type: 'app.bsky.richtext.facet#tag', tag: 'flowers' }],
				index: { byteEnd: 265, byteStart: 257 },
			},
			{
				features: [{ $type: 'app.bsky.richtext.facet#tag', tag: '花' }],
				index: { byteEnd: 270, byteStart: 266 },
			},
			{
				features: [{ $type: 'app.bsky.richtext.facet#tag', tag: 'twilightsky' }],
				index: { byteEnd: 286, byteStart: 274 },
			},
		],
	},
];

for (const { name, text, facets } of TEST_CASES) {
	bench(name, () => segmentize(text, facets));
}

await run();
