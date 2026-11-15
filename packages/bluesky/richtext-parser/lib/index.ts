const ESCAPE_RE = /^\\([^0-9A-Za-z\s])/;

const MENTION_RE = /^[@＠]([a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*(?:\.[a-zA-Z]{2,}))($|\s|\p{P})/u;

const TOPIC_RE =
	/^(?:#(?!\ufe0f|\u20e3)|＃)([\p{N}]*[\p{L}\p{M}\p{Pc}][\p{L}\p{M}\p{Pc}\p{N}]*)($|\s|\p{P})/u;

const CASHTAG_RE = /^[$＄]([A-Za-z][A-Za-z0-9]{0,7})($|\s|\p{P})/u;

const EMOTE_RE = /^:([\w-]+):/;

const AUTOLINK_RE = /^https?:\/\/[\S]+/;

const trimAutolink = (url: string): string => {
	let end = url.length;

	while (end > 0) {
		const code = url.charCodeAt(end - 1);
		if (code === 46 || code === 44 || code === 59) {
			end -= 1;
			continue;
		}

		break;
	}

	if (end > 0 && url.charCodeAt(end - 1) === 41 && url.lastIndexOf('(', end - 1) === -1) {
		end -= 1;
	}

	return end === url.length ? url : url.slice(0, end);
};

const LINK_RE =
	/^\[((?:\[(?:\\[^]|[^[\]\\])*\]|\\[^]|[^[\]\\]|\](?=(?:\\[^]|[^[\]\\])*\]))*)\]\(\s*<?((?:\((?:[^()\\]|\\[^])*\)|\\[^]|[^\s()\\])*?)>?(?:\s+(?:"(?:\\[^]|[^"\\])*"|'(?:\\[^]|[^'\\])*'))?\s*\)/;
const UNESCAPE_URL_RE = /\\([^0-9A-Za-z\s])/g;

const EMPHASIS_UL_RE = /^\b_((?:__)*(?:\\[^]|[^\\_])(?:__|\\[^]|[^\\_])*?)_\b/;
const EMPHASIS_AST_RE =
	/^\*(?=\S)((?:\s*\*\*)*(?:\\[^]|\s+(?:\\[^]|[^\s*\\])|[^\s*\\])(?:\*\*|\\[^]|\s+(?:\\[^]|[^\s*\\]|\*\*)|[^\s*\\])*?)\*(?!\*)/;

const STRONG_RE = /^\*\*(\**(?:\\[^]|[^*\\])(?:\\[^]|[^\\])*?)\*\*(?!\*)/;

const UNDERLINE_RE = /^__(_*(?:\\[^]|[^_\\])(?:\\[^]|[^\\])*?)__(?!_)/;

const DELETE_RE = /^~~((?:\\[^]|~(?!~)|[^~\\])+?)~~/;

// lookahead + backreference makes the opening backtick run atomic so JS RegExp never backtracks on fence length
const CODE_RE = /^(?=(`+))\1([^]*?[^`])\1(?!`)/;
const CODE_ESCAPE_BACKTICKS_RE = /^ (?= *`)|(` *) $/g;

const TEXT_RE =
	/^(?:`+|\*+(?=\*)|_+(?=_)|\[+(?=\[\[)|[^]+?(?:(?=$|[~*_`:\\[]|https?:\/\/)|(?<=\s|[(){}/\\[\]\-|:;'".,=+])(?=[@＠#＃$＄])))/;

const MAX_DEPTH = 32;

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

export interface CashtagToken {
	type: 'cashtag';
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
	| CashtagToken
	| EmoteToken
	| AutolinkToken
	| LinkToken
	| StrongToken
	| EmphasisToken
	| UnderlineToken
	| DeleteToken
	| CodeToken
	| TextToken;

const tokenizeEscape = (src: string): EscapeToken | undefined => {
	const match = ESCAPE_RE.exec(src);
	if (match) {
		return {
			type: 'escape',
			raw: match[0],
			escaped: match[1]!,
		};
	}
};

const tokenizeMention = (src: string): MentionToken | undefined => {
	const match = MENTION_RE.exec(src);
	if (match && match[2] !== '@') {
		const suffix = match[2]!.length;

		return {
			type: 'mention',
			raw: suffix > 0 ? match[0].slice(0, -suffix) : match[0],
			handle: match[1]!,
		};
	}
};

const tokenizeTopic = (src: string): TopicToken | undefined => {
	const match = TOPIC_RE.exec(src);
	if (match && match[2] !== '#') {
		const suffix = match[2]!.length;

		return {
			type: 'topic',
			raw: suffix > 0 ? match[0].slice(0, -suffix) : match[0],
			name: match[1]!,
		};
	}
};

const tokenizeCashtag = (src: string): CashtagToken | undefined => {
	const match = CASHTAG_RE.exec(src);
	if (match && match[2] !== '$') {
		const suffix = match[2]!.length;

		return {
			type: 'cashtag',
			raw: suffix > 0 ? match[0].slice(0, -suffix) : match[0],
			name: match[1]!,
		};
	}
};

const tokenizeEmote = (src: string): EmoteToken | undefined => {
	const match = EMOTE_RE.exec(src);
	if (match) {
		return {
			type: 'emote',
			raw: match[0],
			name: match[1]!,
		};
	}
};

const tokenizeAutolink = (src: string): AutolinkToken | undefined => {
	const match = AUTOLINK_RE.exec(src);
	if (match) {
		const url = trimAutolink(match[0]);

		return {
			type: 'autolink',
			raw: url,
			url: url,
		};
	}
};

const tokenizeLink = (src: string, depth: number): LinkToken | undefined => {
	const match = LINK_RE.exec(src);
	if (match) {
		return {
			type: 'link',
			raw: match[0],
			url: match[2]!.replace(UNESCAPE_URL_RE, '$1'),
			children: tokenizeInline(match[1]!, depth + 1),
		};
	}
};

const tokenizeAsteriskEmStrong = (src: string, depth: number): EmphasisToken | StrongToken | undefined => {
	const emMatch = EMPHASIS_AST_RE.exec(src);
	const strongMatch = STRONG_RE.exec(src);

	if (emMatch && (!strongMatch || emMatch[0].length >= strongMatch[0].length)) {
		return {
			type: 'emphasis',
			raw: emMatch[0],
			children: tokenizeInline(emMatch[1]!, depth + 1),
		};
	}

	if (strongMatch) {
		return {
			type: 'strong',
			raw: strongMatch[0],
			children: tokenizeInline(strongMatch[1]!, depth + 1),
		};
	}
};

const tokenizeUnderscoreEmU = (src: string, depth: number): EmphasisToken | UnderlineToken | undefined => {
	const emMatch = EMPHASIS_UL_RE.exec(src);
	const uMatch = UNDERLINE_RE.exec(src);

	if (emMatch && (!uMatch || emMatch[0].length >= uMatch[0].length)) {
		return {
			type: 'emphasis',
			raw: emMatch[0],
			children: tokenizeInline(emMatch[1]!, depth + 1),
		};
	}

	if (uMatch) {
		return {
			type: 'underline',
			raw: uMatch[0],
			children: tokenizeInline(uMatch[1]!, depth + 1),
		};
	}
};

const tokenizeDelete = (src: string, depth: number): DeleteToken | undefined => {
	const match = DELETE_RE.exec(src);
	if (match) {
		return {
			type: 'delete',
			raw: match[0],
			children: tokenizeInline(match[1]!, depth + 1),
		};
	}
};

const tokenizeCode = (src: string): CodeToken | undefined => {
	const match = CODE_RE.exec(src);
	if (match) {
		return {
			type: 'code',
			raw: match[0],
			content: match[2]!.replace(CODE_ESCAPE_BACKTICKS_RE, '$1'),
		};
	}
};

const tokenizeText = (src: string): TextToken | undefined => {
	const match = TEXT_RE.exec(src);
	if (match) {
		return {
			type: 'text',
			raw: match[0],
			content: match[0],
		};
	}
};

const tokenizeInline = (src: string, depth: number): Token[] => {
	const tokens: Token[] = [];

	let last: Token | undefined;
	let token: Token | undefined;
	// backtick fence lengths that failed to close never become valid later in the same slice
	let deadCodeMask = 0;
	let deadCodeSet: Set<number> | undefined;

	while (src) {
		last = token;
		const first = src.charCodeAt(0);

		switch (first) {
			case 92: {
				token = tokenizeEscape(src);
				break;
			}
			case 104: {
				token = tokenizeAutolink(src);
				break;
			}
			case 64:
			case 65312: {
				token = tokenizeMention(src);
				break;
			}
			case 35:
			case 65283: {
				token = tokenizeTopic(src);
				break;
			}
			case 36:
			case 65284: {
				token = tokenizeCashtag(src);
				break;
			}
			case 58: {
				token = tokenizeEmote(src);
				break;
			}
			case 91: {
				token = depth < MAX_DEPTH ? tokenizeLink(src, depth) : undefined;
				break;
			}
			case 42: {
				token = depth < MAX_DEPTH ? tokenizeAsteriskEmStrong(src, depth) : undefined;
				break;
			}
			case 95: {
				token = depth < MAX_DEPTH ? tokenizeUnderscoreEmU(src, depth) : undefined;
				break;
			}
			case 126: {
				token = depth < MAX_DEPTH ? tokenizeDelete(src, depth) : undefined;
				break;
			}
			case 96: {
				let run = 1;
				while (src.charCodeAt(run) === 96) {
					run += 1;
				}

				const isDead =
					run < 32 ? (deadCodeMask & (1 << run)) !== 0 : deadCodeSet !== undefined && deadCodeSet.has(run);

				if (isDead) {
					token = undefined;
				} else {
					token = tokenizeCode(src);
					if (!token) {
						if (run < 32) {
							deadCodeMask |= 1 << run;
						} else {
							deadCodeSet ??= new Set();
							deadCodeSet.add(run);
						}
					}
				}
				break;
			}
			default: {
				token = undefined;
				break;
			}
		}

		if (token) {
			src = src.slice(token.raw.length);
			tokens.push(token);
			continue;
		}

		if ((token = tokenizeText(src))) {
			src = src.slice(token.raw.length);

			if (last && last.type === 'text') {
				last.raw += token.raw;
				last.content += token.content;
				token = last;
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

export const tokenize = (src: string): Token[] => {
	return tokenizeInline(src, 0);
};
