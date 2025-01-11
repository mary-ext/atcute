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

const fieldsfunc = (str: string, fn: (rune: number) => boolean): string[] => {
	const slices: string[] = [];

	let start = 0;
	let prev = false;

	for (let idx = 0, len = str.length; idx <= len; idx++) {
		const next: boolean = idx < len ? fn(str.charCodeAt(idx)) : !prev;

		if (idx === 0) {
			prev = next;
			continue;
		}

		if (next !== prev) {
			slices.push(str.slice(start, idx));
			start = idx;
			prev = next;
		}
	}

	return slices;
};

export const tokenize = (query: string): Token[] => {
	// https://github.com/bluesky-social/indigo/blob/421e4da5307f4fcba51f25b5c5982c8b9841f7f6/search/parse_query.go#L15-L21
	let quoted = false;

	const slices = fieldsfunc(query, (rune) => {
		if (rune === 34) {
			quoted = !quoted;
		}

		return rune === 32 && !quoted;
	});

	return slices.map((str): Token => {
		const code = str.charCodeAt(0);

		if (code === 34) {
			return { type: 'quoted', value: str };
		}

		if (code === 32) {
			return { type: 'whitespace', value: str };
		}

		return { type: 'word', value: str };
	});
};
