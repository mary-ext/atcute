import {
	isActorIdentifier,
	isCid,
	isDatetime,
	isDid,
	isGenericUri,
	isHandle,
	isLanguageCode,
	isNsid,
	isRecordKey,
	isResourceUri,
	isTid,
} from '@atcute/lexicons/syntax';

import * as t from '../types.ts';

export const KEY_RE = /^[a-zA-Z][a-zA-Z0-9_]{0,62}?$/;

export const REF_RE =
	/^(?=.)(?:[a-zA-Z](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+\.[a-zA-Z][a-zA-Z0-9]{0,62}?)?(?:#[a-zA-Z][a-zA-Z0-9_]{0,62}?)?$/;

export const DELIMITED_MIME_TYPE_RE =
	/^(?:\*\/\*|[a-z]+\/[a-zA-Z][a-zA-Z0-9-+.]*(?:,\s*[a-z]+\/[a-zA-Z][a-zA-Z0-9-+.]*)*?)$/;

export const MIME_TYPE_RE = /^[a-z]+\/(?:\*|[a-zA-Z][a-zA-Z0-9-+.]*)$/;

export const LITERAL_KEY_RE = /^literal:(?!\.{1,2}$)[a-zA-Z0-9_~.:-]{1,512}$/;

export const validateStringFormat = (value: string, format: t.LexStringFormat): boolean => {
	switch (format) {
		case 'datetime':
			return isDatetime(value);
		case 'uri':
			return isGenericUri(value);
		case 'at-uri':
			return isResourceUri(value);
		case 'did':
			return isDid(value);
		case 'handle':
			return isHandle(value);
		case 'at-identifier':
			return isActorIdentifier(value);
		case 'nsid':
			return isNsid(value);
		case 'cid':
			return isCid(value);
		case 'language':
			return isLanguageCode(value);
		case 'tid':
			return isTid(value);
		case 'record-key':
			return isRecordKey(value);
	}
};

export const validateRecordKey = (key: t.LexRecord['key'] = 'any'): boolean => {
	if (key === 'any') {
		return true;
	}

	if (key === 'tid') {
		return true;
	}

	if (key === 'nsid') {
		return true;
	}

	if (key.startsWith('literal:')) {
		return LITERAL_KEY_RE.test(key);
	}

	return true;
};
