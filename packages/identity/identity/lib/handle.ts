import type { Handle } from './types.js';

export const HANDLE_RE =
	/^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;

export const isHandle = (str: string): str is Handle => {
	return str.length >= 3 && str.length <= 253 && HANDLE_RE.test(str);
};
