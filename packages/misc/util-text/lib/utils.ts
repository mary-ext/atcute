export const isAsciiWithoutCr = (text: string): boolean => {
	const len = text.length;
	let idx = 0;

	while (idx + 3 < len) {
		const a = text.charCodeAt(idx);
		const b = text.charCodeAt(idx + 1);
		const c = text.charCodeAt(idx + 2);
		const d = text.charCodeAt(idx + 3);

		if ((a | b | c | d) > 0x7f || a === 0x0d || b === 0x0d || c === 0x0d || d === 0x0d) {
			return false;
		}

		idx += 4;
	}

	while (idx < len) {
		const code = text.charCodeAt(idx);
		if (code > 0x7f || code === 0x0d) {
			return false;
		}

		idx++;
	}

	return true;
};
