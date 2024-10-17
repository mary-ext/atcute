const MENTION_RE = /^@([a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*(?:\.[a-zA-Z]{2,}))($|\s|\p{P})/u;

const TOPIC_RE = /^#((?!\ufe0f|\u20e3)[\p{N}]*[\p{L}\p{M}\p{Pc}][\p{L}\p{M}\p{Pc}\p{N}]*)($|\s|\p{P})/u;

const EMOTE_RE = /^:([\w-]+):/;

const AUTOLINK_RE = /^https?:\/\/(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*/;
const AUTOLINK_BACKPEDAL_RE = /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/;

const LINK_RE = /^\[((?:\[(?:\\.|[^\[\]\\])*\]|\\.|[^\[\]\\])*?)\]\((.*?)\)/;

const ESCAPE_RE = /^\\([@#:\\\[])/;

const TEXT_RE = /^[^]+?(?:(?=$|[:\\\[]|https?:\/\/)|(?:\s|(?<=[(){}\/\\\[\]\-|:;'".,=+]))(?=[@#]))/;

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
		let url = match[0];
		let prevUrl: string;

		do {
			prevUrl = url;
			url = AUTOLINK_BACKPEDAL_RE.exec(url)?.[0] ?? '';
		} while (prevUrl !== url);

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

		if ((token = tokenizeEscape(src))) {
			src = src.slice(token.raw.length);
			tokens.push(token);
			continue;
		}

		if ((token = tokenizeAutolink(src))) {
			src = src.slice(token.raw.length);
			tokens.push(token);
			continue;
		}

		if ((token = tokenizeMention(src))) {
			src = src.slice(token.raw.length);
			tokens.push(token);
			continue;
		}

		if ((token = tokenizeTopic(src))) {
			src = src.slice(token.raw.length);
			tokens.push(token);
			continue;
		}

		if ((token = tokenizeEmote(src))) {
			src = src.slice(token.raw.length);
			tokens.push(token);
			continue;
		}

		if ((token = tokenizeLink(src))) {
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
