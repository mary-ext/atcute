const WHITESPACE_RE = /^\s+/;
const QUOTED_RE = /^".*?(?:"(?=\s)|(?=$))/;
const WORD_RE = /^.+?(?:".*?(?:".*?|$))?(?=\s|$)/;

interface WordToken {
	type: 'word';
	value: string;
}

interface WhitespaceToken {
	type: 'whitespace';
	value: string;
}

interface QuotedToken {
	type: 'quoted';
	value: string;
}

export type Token = WordToken | WhitespaceToken | QuotedToken;

const tokenizeWhitespace = (src: string): WhitespaceToken | undefined => {
	const match = WHITESPACE_RE.exec(src);
	if (match) {
		return {
			type: 'whitespace',
			value: match[0],
		};
	}
};

const tokenizeQuoted = (src: string): QuotedToken | undefined => {
	const match = QUOTED_RE.exec(src);
	if (match) {
		return {
			type: 'quoted',
			value: match[0],
		};
	}
};

const tokenizeWord = (src: string): WordToken | undefined => {
	const match = WORD_RE.exec(src);
	if (match) {
		return {
			type: 'word',
			value: match[0],
		};
	}
};

export const tokenize = (src: string): Token[] => {
	const tokens: Token[] = [];
	let token: Token | undefined;

	while (src) {
		if ((token = tokenizeWhitespace(src) || tokenizeQuoted(src) || tokenizeWord(src))) {
			src = src.slice(token.value.length);
			tokens.push(token);
			continue;
		}

		if (src) {
			throw new Error('Infinite loop encountered');
		}
	}

	return tokens;
};
