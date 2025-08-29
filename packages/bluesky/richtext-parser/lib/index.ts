const MENTION_RE = /^[@＠]([a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*(?:\.[a-zA-Z]{2,}))($|\s|\p{P})/u;

const TOPIC_RE =
	/^(?:#(?!\ufe0f|\u20e3)|＃)([\p{N}]*[\p{L}\p{M}\p{Pc}][\p{L}\p{M}\p{Pc}\p{N}]*)($|\s|\p{P})/u;

const EMOTE_RE = /^:([\w-]+):/;

const AUTOLINK_RE = /^https?:\/\/[\S]+/;
const AUTOLINK_BACKPEDAL_RE = /(?:(?<!\(.*)\))?[.,;]*$/;

const LINK_RE = /^\[((?:\[(?:\\.|[^\[\]\\])*\]|\\.|[^\[\]\\])*?)\]\((.*?)\)/;

const ESCAPE_RE = /^\\([@＠#:\\\[~*_])/;

const EM_RE =
	/^\b_((?:__|\\[^]|[^\\_])+?)_\b|^\*((?:\*\*|\\[^]|\s+(?:\\[^]|[^\*\\]|\*\*)|[^\*\\])+?)\*(?!\*)/;
const STRONG_RE = /^\*\*((?:\\[^]|[^\\])+?)\*\*(?!\*)/;
const UNDERLINE_RE = /^__((?:\\[^]|[^\\])+?)__(?!_)/;
const DEL_RE = /^~~((?:\\[^]|~(?!~)|[^~\\]|\s(?!~~))+?)~~/;

const TEXT_RE = /^[^]+?(?:(?=$|[~*_:\\\[]|https?:\/\/)|(?<=\s|[(){}\/\\\[\]\-|:;'".,=+])(?=[@＠#＃]))/;

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
	text: string;
	url: string;
}

export interface EscapeToken {
	type: 'escape';
	raw: string;
	escaped: string;
}

export interface EmphasisToken {
	type: 'emphasis';
	raw: string;
	tokens: Token[];
}

export interface StrongToken {
	type: 'strong';
	raw: string;
	tokens: Token[];
}

export interface UnderlineToken {
	type: 'underline';
	raw: string;
	tokens: Token[];
}

export interface DeleteToken {
	type: 'delete';
	raw: string;
	tokens: Token[];
}

export interface TextToken {
	type: 'text';
	raw: string;
	text: string;
}

export type Token =
	| MentionToken
	| TopicToken
	| EmoteToken
	| AutolinkToken
	| LinkToken
	| EscapeToken
	| EmphasisToken
	| StrongToken
	| UnderlineToken
	| DeleteToken
	| TextToken;

const tokenizeMention = (src: string): MentionToken | undefined => {
	const match = MENTION_RE.exec(src);
	if (match && match[2] !== '@') {
		const suffix = match[2].length;

		return {
			type: 'mention',
			raw: suffix > 0 ? match[0].slice(0, -suffix) : match[0],
			handle: match[1],
		};
	}
};

const tokenizeTopic = (src: string): TopicToken | undefined => {
	const match = TOPIC_RE.exec(src);
	if (match && match[2] !== '#') {
		const suffix = match[2].length;

		return {
			type: 'topic',
			raw: suffix > 0 ? match[0].slice(0, -suffix) : match[0],
			name: match[1],
		};
	}
};

const tokenizeEmote = (src: string): EmoteToken | undefined => {
	const match = EMOTE_RE.exec(src);
	if (match) {
		return {
			type: 'emote',
			raw: match[0],
			name: match[1],
		};
	}
};

const tokenizeAutolink = (src: string): AutolinkToken | undefined => {
	const match = AUTOLINK_RE.exec(src);
	if (match) {
		const url = match[0].replace(AUTOLINK_BACKPEDAL_RE, '');

		return {
			type: 'autolink',
			raw: url,
			url: url,
		};
	}
};

const tokenizeLink = (src: string): LinkToken | undefined => {
	const match = LINK_RE.exec(src);
	if (match) {
		return {
			type: 'link',
			raw: match[0],
			text: match[1],
			url: match[2],
		};
	}
};

const tokenizeEscape = (src: string): EscapeToken | undefined => {
	const match = ESCAPE_RE.exec(src);
	if (match) {
		return {
			type: 'escape',
			raw: match[0],
			escaped: match[1],
		};
	}
};

const tokenizeEm = (src: string): EmphasisToken | undefined => {
	const match = EM_RE.exec(src);
	if (match) {
		const inner = match[1] || match[2];

		return {
			type: 'emphasis',
			raw: match[0],
			tokens: tokenize(inner),
		};
	}
};

const tokenizeStrong = (src: string): StrongToken | undefined => {
	const match = STRONG_RE.exec(src);
	if (match) {
		const innerText = match[1];
		const innerTokens = tokenize(innerText);

		return {
			type: 'strong',
			raw: match[0],
			tokens: innerTokens,
		};
	}
};

const tokenizeUnderline = (src: string): UnderlineToken | undefined => {
	const match = UNDERLINE_RE.exec(src);
	if (match) {
		const inner = match[1];

		return {
			type: 'underline',
			raw: match[0],
			tokens: tokenize(inner),
		};
	}
};

const tokenizeDelete = (src: string): DeleteToken | undefined => {
	const match = DEL_RE.exec(src);
	if (match) {
		const inner = match[1];

		return {
			type: 'delete',
			raw: match[0],
			tokens: tokenize(inner),
		};
	}
};

const tokenizeText = (src: string): TextToken | undefined => {
	const match = TEXT_RE.exec(src);
	if (match) {
		return {
			type: 'text',
			raw: match[0],
			text: match[0],
		};
	}
};

export const tokenize = (src: string): Token[] => {
	const tokens: Token[] = [];

	let lastToken: Token | undefined;
	let token: Token | undefined;

	while (src) {
		lastToken = token;

		if (
			(token =
				tokenizeEscape(src) ||
				tokenizeAutolink(src) ||
				tokenizeMention(src) ||
				tokenizeTopic(src) ||
				tokenizeEmote(src) ||
				tokenizeLink(src) ||
				tokenizeEm(src) ||
				tokenizeStrong(src) ||
				tokenizeUnderline(src) ||
				tokenizeDelete(src))
		) {
			src = src.slice(token.raw.length);
			tokens.push(token);
			continue;
		}

		if ((token = tokenizeText(src))) {
			src = src.slice(token.raw.length);

			if (lastToken && lastToken.type === 'text') {
				lastToken.raw += token.raw;
				lastToken.text += token.text;
				token = lastToken;
			} else {
				tokens.push(token);
			}

			continue;
		}

		if (src) {
			throw new Error(`infinite loop encountered`);
		}
	}

	return tokens;
};
