import type { XRPCBlobBodyParam, XRPCLexBodyParam } from '@atcute/lexicons/validations';

import type { Result } from '../../types/misc.js';

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
