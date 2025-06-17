const segmenter = new Intl.Segmenter();

export const getUtf8Length = (str: string): number => {
	const len = str.length;

	let u16pos = 0;
	let u8pos = 0;

	jump: if (str.charCodeAt(0) < 0x80) {
		u16pos++;
		u8pos++;

		while (u16pos + 3 < len) {
			const a = str.charCodeAt(u16pos);
			const b = str.charCodeAt(u16pos + 1);
			const c = str.charCodeAt(u16pos + 2);
			const d = str.charCodeAt(u16pos + 3);

			if ((a | b | c | d) >= 0x80) {
				break jump;
			}

			u16pos += 4;
			u8pos += 4;
		}

		while (u16pos < len) {
			const x = str.charCodeAt(u16pos);

			if (x >= 0x80) {
				break jump;
			}

			u16pos++;
			u8pos++;
		}

		return u8pos;
	}

	while (u16pos < len) {
		const code = str.charCodeAt(u16pos);

		if (code < 0x80) {
			u16pos += 1;
			u8pos += 1;
		} else if (code < 0x800) {
			u16pos += 1;
			u8pos += 2;
		} else if (code < 0xd800 || code > 0xdbff) {
			u16pos += 1;
			u8pos += 3;
		} else {
			u16pos += 2;
			u8pos += 4;
		}
	}

	return u8pos;
};

export const getGraphemeLength = (text: string): number => {
	const iterator = segmenter.segment(text)[Symbol.iterator]();
	let count = 0;

	while (!iterator.next().done) {
		count++;
	}

	return count;
};

// #__NO_SIDE_EFFECTS__
export const lazyProperty = <T>(obj: object, prop: string | number | symbol, value: T): T => {
	Object.defineProperty(obj, prop, { value });
	return value;
};

// #__NO_SIDE_EFFECTS__
export const lazy = <T>(getter: () => T): { readonly value: T } => {
	return {
		get value() {
			const value = getter();
			return lazyProperty(this, 'value', value);
		},
	};
};

export const isArray = Array.isArray;

// #__NO_SIDE_EFFECTS__
export const isObject = (input: unknown): input is Record<string, unknown> => {
	return typeof input === 'object' && input !== null && !isArray(input);
};

export const allowsEval = /*#__PURE__*/ lazy((): boolean => {
	if (typeof navigator !== 'undefined' && navigator?.userAgent?.includes('Cloudflare')) {
		return false;
	}

	try {
		const F = Function;
		new F('');
		return true;
	} catch (_) {
		return false;
	}
});
