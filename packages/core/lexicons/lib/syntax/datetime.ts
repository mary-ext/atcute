export type Datetime = string;

const DATE_TIME_RE =
	/^((?!0{3})\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01]))T((?:[01]\d|2[0-3]):(?:[0-5]\d):(?:[0-5]\d))(\.\d+)?(Z|(?!-00:00)[+-](?:[01]\d|2[0-3]):(?:[0-5]\d))$/;

// #__NO_SIDE_EFFECTS__
export const isDatetime = (input: unknown): input is Datetime => {
	return typeof input === 'string' && input.length >= 20 && input.length <= 64 && DATE_TIME_RE.test(input);
};
