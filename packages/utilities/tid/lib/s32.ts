const S32_CHAR = '234567abcdefghijklmnopqrstuvwxyz';

export const s32encode = (i: number): string => {
	let s = '';

	while (i) {
		const c = i % 32;
		i = Math.floor(i / 32);
		s = S32_CHAR.charAt(c) + s;
	}

	return s;
};

export const s32decode = (s: string): number => {
	let i = 0;

	for (const c of s) {
		i = i * 32 + S32_CHAR.indexOf(c);
	}

	return i;
};
