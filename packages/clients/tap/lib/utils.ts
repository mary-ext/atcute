import { toBase64Pad } from '@atcute/multibase';
import { encodeUtf8 } from '@atcute/uint8array';

export const formatAdminAuthHeader = (password: string): string => {
	return `Basic ${toBase64Pad(encodeUtf8(`admin:${password}`))}`;
};
