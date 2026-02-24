import type { XRPCBlobBodyParam, XRPCLexBodyParam } from '@atcute/lexicons/validations';

import type { Result } from '../../types/misc.ts';

/**
 * checks whether a request has a meaningful body.
 *
 * Node.js HTTP-to-fetch adapters always provide a `ReadableStream` for
 * `request.body`, even when no body content was sent. this function
 * uses `content-length` to handle that case while still respecting the
 * web `Request` API where `body === null` signals no body.
 *
 * @param request incoming request to check
 * @returns whether the request has body content
 */
export const hasRequestBody = (request: Request): boolean => {
	if (request.body === null) {
		return false;
	}

	// Node.js adapters set content-length: 0 for bodiless requests while
	// still providing a ReadableStream body; treat this as no body.
	if (request.headers.get('content-length') === '0') {
		return false;
	}

	return true;
};

const jsonMimeValidator = (() => {
	const JSON_RE = /^\s*application\/json\s*(?:$|;)/;

	return (request: Request): Result<void, string> => {
		const type = request.headers.get('content-type');
		if (type === null) {
			return { ok: false, error: `missing input content type (expected application/json)` };
		}

		if (!JSON_RE.test(type)) {
			return { ok: false, error: `invalid input content type (expected application/json)` };
		}

		return { ok: true, value: undefined };
	};
})();

export const constructMimeValidator = (param: XRPCLexBodyParam | XRPCBlobBodyParam) => {
	if (param.type === 'lex') {
		return jsonMimeValidator;
	}

	const mimes = param.encoding;
	if (mimes === undefined || mimes.length === 0) {
		return null;
	}

	const pattern = new RegExp(`^\\s*(?:${mimes.map(escapeRegexp).join('|')})\\s*(?:$|;)`);

	return (request: Request): Result<void, string> => {
		const type = request.headers.get('content-type');
		if (type === null) {
			return { ok: false, error: `missing input content type (expected ${separatedList(mimes, 'or')})` };
		}

		if (!pattern.test(type)) {
			return { ok: false, error: `invalid input content type (expected ${separatedList(mimes, 'or')})` };
		}

		return { ok: true, value: undefined };
	};
};

const separatedList = (list: string[], sep: 'or' | 'and'): string => {
	switch (list.length) {
		case 0: {
			return `nothing`;
		}
		case 1: {
			return list[0];
		}
		default: {
			return `${list.slice(0, -1).join(', ')} ${sep} ${list[list.length - 1]}`;
		}
	}
};

const escapeRegexp = (input: string): string => {
	return input.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};
