/**
 * represents a record key
 */
export type RecordKey = string;

const RECORD_KEY_RE = /^(?!\.{1,2}$)[a-zA-Z0-9_~.:-]{1,512}$/;

// #__NO_SIDE_EFFECTS__
export const isRecordKey = (input: unknown): input is RecordKey => {
	return typeof input === 'string' && input.length >= 1 && input.length <= 512 && RECORD_KEY_RE.test(input);
};
