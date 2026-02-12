// #__NO_SIDE_EFFECTS__
export const isAsciiAlpha = (c: number): boolean => {
	return (c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a);
};

// #__NO_SIDE_EFFECTS__
export const isAsciiAlphaNum = (c: number): boolean => {
	return isAsciiAlpha(c) || (c >= 0x30 && c <= 0x39);
};
