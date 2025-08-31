const ESCAPE_RE = /^\\([^0-9A-Za-z\s])/;

const MENTION_RE = /^[@＠]([a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*(?:\.[a-zA-Z]{2,}))($|\s|\p{P})/u;

const TOPIC_RE =
	/^(?:#(?!\ufe0f|\u20e3)|＃)([\p{N}]*[\p{L}\p{M}\p{Pc}][\p{L}\p{M}\p{Pc}\p{N}]*)($|\s|\p{P})/u;

const EMOTE_RE = /^:([\w-]+):/;

const AUTOLINK_RE = /^https?:\/\/[\S]+/;
const AUTOLINK_BACKPEDAL_RE = /(?:(?<!\(.*)\))?[.,;]*$/;

const LINK_RE =
	/^\[((?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*)\]\(\s*<?((?:\([^)]*\)|[^\s\\]|\\.)*?)>?(?:\s+['"]([^]*?)['"])?\s*\)/;
const UNESCAPE_URL_RE = /\\([^0-9A-Za-z\s])/g;

const EMPHASIS_RE =
	/^\b_((?:__|\\[^]|[^\\_])+?)_\b|^\*(?=\S)((?:\*\*|\\[^]|\s+(?:\\[^]|[^\s\*\\]|\*\*)|[^\s\*\\])+?)\*(?!\*)/;

const STRONG_RE = /^\*\*((?:\\[^]|[^\\])+?)\*\*(?!\*)/;

const UNDERLINE_RE = /^__((?:\\[^]|[^\\])+?)__(?!_)/;

const DELETE_RE = /^~~((?:\\[^]|~(?!~)|[^~\\]|\s(?!~~))+?)~~/;

const CODE_RE = /^(`+)([^]*?[^`])\1(?!`)/;
const CODE_ESCAPE_BACKTICKS_RE = /^ (?= *`)|(` *) $/g;

const TEXT_RE = /^[^]+?(?:(?=$|[~*_`:\\\[]|https?:\/\/)|(?<=\s|[(){}\/\\\[\]\-|:;'".,=+])(?=[@＠#＃]))/;

export interface EscapeToken {
	type: 'escape';
	raw: string;
	escaped: string;
}

export interface MentionToken {
	type: 'mention';
	raw: string;
	handle: string;
}

export interface TopicToken {
	type: 'topic';
	raw: string;
	name: string;
}

export interface EmoteToken {
	type: 'emote';
	raw: string;
	name: string;
}

export interface AutolinkToken {
	type: 'autolink';
	raw: string;
	url: string;
}

export interface LinkToken {
	type: 'link';
	raw: string;
	url: string;
	children: Token[];
}

export interface UnderlineToken {
	type: 'underline';
	raw: string;
	children: Token[];
}

export interface StrongToken {
	type: 'strong';
	raw: string;
	children: Token[];
}

export interface EmphasisToken {
	type: 'emphasis';
	raw: string;
	children: Token[];
}

export interface DeleteToken {
	type: 'delete';
	raw: string;
	children: Token[];
}

export interface CodeToken {
	type: 'code';
	raw: string;
	content: string;
}

export interface TextToken {
	type: 'text';
	raw: string;
	content: string;
}

export type Token =
	| EscapeToken
	| MentionToken
	| TopicToken
	| EmoteToken
	| AutolinkToken
	| LinkToken
	| StrongToken
	| EmphasisToken
	| UnderlineToken
	| DeleteToken
	| CodeToken
	| TextToken;

interface Rule {
	order: number;
	bonus?: number;
	exec(src: string): Token | undefined;
}

let order = 0;

const rules: Rule[] = [
	{
		order: ++order,
		exec(src: string): EscapeToken | undefined {
			const match = ESCAPE_RE.exec(src);
			if (match) {
				return {
					type: 'escape',
					raw: match[0],
					escaped: match[1],
				};
			}
		},
	},

	{
		order: ++order,
		exec(src: string): MentionToken | undefined {
			const match = MENTION_RE.exec(src);
			if (match && match[2] !== '@') {
				const suffix = match[2].length;

				return {
					type: 'mention',
					raw: suffix > 0 ? match[0].slice(0, -suffix) : match[0],
					handle: match[1],
				};
			}
		},
	},

	{
		order: ++order,
		exec(src: string): TopicToken | undefined {
			const match = TOPIC_RE.exec(src);
			if (match && match[2] !== '#') {
				const suffix = match[2].length;

				return {
					type: 'topic',
					raw: suffix > 0 ? match[0].slice(0, -suffix) : match[0],
					name: match[1],
				};
			}
		},
	},

	{
		order: ++order,
		exec(src: string): EmoteToken | undefined {
			const match = EMOTE_RE.exec(src);
			if (match) {
				return {
					type: 'emote',
					raw: match[0],
					name: match[1],
				};
			}
		},
	},

	{
		order: ++order,
		exec(src: string): AutolinkToken | undefined {
			const match = AUTOLINK_RE.exec(src);
			if (match) {
				const url = match[0].replace(AUTOLINK_BACKPEDAL_RE, '');

				return {
					type: 'autolink',
					raw: url,
					url: url,
				};
			}
		},
	},

	{
		order: ++order,
		exec(src: string): LinkToken | undefined {
			const match = LINK_RE.exec(src);
			if (match) {
				return {
					type: 'link',
					raw: match[0],
					url: match[2].replace(UNESCAPE_URL_RE, '$1'),
					children: tokenize(match[1]),
				};
			}
		},
	},

	{
		order: ++order,
		bonus: 0.2,
		exec(src: string): EmphasisToken | undefined {
			const match = EMPHASIS_RE.exec(src);
			if (match) {
				return {
					type: 'emphasis',
					raw: match[0],
					children: tokenize(match[2] || match[1]),
				};
			}
		},
	},

	{
		order: order,
		bonus: 0.1,
		exec(src: string): StrongToken | undefined {
			const match = STRONG_RE.exec(src);
			if (match) {
				return {
					type: 'strong',
					raw: match[0],
					children: tokenize(match[1]),
				};
			}
		},
	},

	{
		order: order,
		bonus: 0,
		exec(src: string): UnderlineToken | undefined {
			const match = UNDERLINE_RE.exec(src);
			if (match) {
				return {
					type: 'underline',
					raw: match[0],
					children: tokenize(match[1]),
				};
			}
		},
	},

	{
		order: ++order,
		exec(src: string): DeleteToken | undefined {
			const match = DELETE_RE.exec(src);
			if (match) {
				return {
					type: 'delete',
					raw: match[0],
					children: tokenize(match[1]),
				};
			}
		},
	},

	{
		order: ++order,
		exec(src: string): CodeToken | undefined {
			const match = CODE_RE.exec(src);
			if (match) {
				return {
					type: 'code',
					raw: match[0],
					content: match[2].replace(CODE_ESCAPE_BACKTICKS_RE, '$1'),
				};
			}
		},
	},

	{
		order: ++order,
		exec(src: string): TextToken | undefined {
			const match = TEXT_RE.exec(src);
			if (match) {
				return {
					type: 'text',
					raw: match[0],
					content: match[0],
				};
			}
		},
	},
];

export const tokenize = (src: string): Token[] => {
	const tokens: Token[] = [];

	let last: Token | undefined;
	while (src) {
		let best: { token: Token; order: number; score: number } | undefined;

		for (let idx = 0, len = rules.length; idx < len; idx++) {
			const rule = rules[idx];
			const order = rule.order;

			if (best && best.order !== order) {
				break;
			}

			const token = rule.exec(src);
			if (!token) {
				continue;
			}

			const score = token.raw.length + (rule.bonus ?? 0);

			if (!best || score > best.score) {
				best = { token: token, order: order, score: score };
			}
		}

		if (!best) {
			throw new Error(`infinite loop encountered`);
		}

		{
			const token = best.token;

			src = src.slice(token.raw.length);

			if (!last || token.type !== 'text' || last.type !== 'text') {
				last = token;
				tokens.push(token);
			} else {
				last.raw += token.raw;
			}
		}
	}

	return tokens;
};
