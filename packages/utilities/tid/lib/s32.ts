const S32_CHAR = '234567abcdefghijklmnopqrstuvwxyz';

const S32_DECODE_TABLE = /*#__PURE__*/ (() => {
	const table = new Int16Array(123);
	table.fill(-1);

	for (let i = 0; i < S32_CHAR.length; i++) {
		const code = S32_CHAR.charCodeAt(i);
		table[code] = i;
	}

	return table;
})();

export const S32_2CHAR_TABLE = /*#__PURE__*/ (() => {
	const table = Array.from<string>({ length: 1024 });

	for (let i = 0; i < 1024; i++) {
		const hi = S32_CHAR.charAt((i >> 5) & 31);
		const lo = S32_CHAR.charAt(i & 31);
		table[i] = hi + lo;
	}

	return table;
})();

export const s32encode = (i: number): string => {
	let s = '';

	while (i) {
		const c = i % 32;
		i = Math.floor(i / 32);
		s = S32_CHAR.charAt(c) + s;
	}

	return s;
};

export const s32decode = (s: string, offset: number, length: number): number => {
	let i = 0;
	const end = offset + length;

	for (let idx = offset; idx < end; idx++) {
		i = i * 32 + S32_DECODE_TABLE[s.charCodeAt(idx)]!;
	}

	return i;
};
