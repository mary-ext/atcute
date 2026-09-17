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

interface NegationToken {
	type: 'negation';
	value: '-';
}

export type Token = NegationToken | QuotedToken | WhitespaceToken | WordToken;

export const tokenize = (query: string): Token[] => {
	const tokens: Token[] = [];
	const len = query.length;

	let i = 0;
	let quoted = false;

	while (i < len) {
		let code = query.charCodeAt(i);

		if (code === 32 && !quoted) {
			const start = i;
			i++;

			while (i < len && query.charCodeAt(i) === 32) {
				i++;
			}

			tokens.push({ type: 'whitespace', value: query.slice(start, i) });
			continue;
		}

		// a leading `-` negates the rest of the term, but only when there's a term
		// to negate; a lone `-` stays a regular word
		if (code === 45 && i + 1 < len && query.charCodeAt(i + 1) !== 32) {
			tokens.push({ type: 'negation', value: '-' });
			i++;
			code = query.charCodeAt(i);
		}

		const start = i;

		if (code === 34) {
			quoted = !quoted;
		}
		i++;

		while (i < len) {
			code = query.charCodeAt(i);

			if (code === 34) {
				quoted = !quoted;
				i++;
				continue;
			}

			if (code === 32 && !quoted) {
				break;
			}

			i++;
		}

		const substring = query.slice(start, i);

		if (substring.charCodeAt(0) === 34) {
			tokens.push({ type: 'quoted', value: substring });
		} else {
			tokens.push({ type: 'word', value: substring });
		}
	}

	return tokens;
};
