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

export const tokenize = (query: string): Token[] => {
	const tokens: Token[] = [];

	let start = 0;
	let quoted = false;
	let code: number;

	for (let i = 0, len = query.length; i <= len; i++) {
		code = query.charCodeAt(i);

		if (i === len || (code === 32 && !quoted)) {
			if (start < i) {
				const substring = query.slice(start, i);

				if (substring.charCodeAt(0) === 34) {
					tokens.push({ type: 'quoted', value: substring });
				} else {
					tokens.push({ type: 'word', value: substring });
				}
			}

			if (i < len && code === 32 && !quoted) {
				let j = i;

				for (; j < len; j++) {
					if (query.charCodeAt(j) !== 32) {
						break;
					}
				}

				tokens.push({ type: 'whitespace', value: query.slice(i, j) });

				start = j;
				i = j - 1;
			} else {
				start = i + 1;
			}

			continue;
		}

		if (code === 34) {
			quoted = !quoted;
		}
	}

	return tokens;
};
