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

import { isWithinGraphemeBounds, isWithinUtf8Bounds } from './internal/utils.js';

import type * as t from './types.js';

export interface RefineIssue {
	message: string;
	path: (string | number)[];
}

/**
 * validates lexicon boolean type constraints
 * @param input the boolean type definition
 * @returns array of validation issues
 */
export const refineLexBoolean = (input: t.LexBoolean): RefineIssue[] => {
	const { const: constValue, default: defaultValue } = input;
	const issues: RefineIssue[] = [];

	if (defaultValue !== undefined) {
		if (constValue !== undefined && defaultValue !== constValue) {
			issues.push({
				message: `default value must match constant value`,
				path: ['default'],
			});
		}
	}

	return issues;
};

/**
 * validates lexicon integer type constraints
 * @param input the integer type definition
 * @returns array of validation issues
 */
export const refineLexInteger = (input: t.LexInteger): RefineIssue[] => {
	const {
		minimum = 0,
		maximum = Infinity,
		const: constValue,
		default: defaultValue,
		enum: enumValues,
	} = input;

	const issues: RefineIssue[] = [];

	// check exclusivity first
	if (constValue !== undefined && enumValues !== undefined) {
		return [
			{
				message: `const and enum can't be used together`,
				path: ['const'],
			},
		];
	}

	if (minimum > maximum) {
		issues.push({
			message: `minimum value can't be greater than maximum value`,
			path: ['minimum'],
		});
	}

	if (defaultValue !== undefined) {
		if (constValue !== undefined && defaultValue !== constValue) {
			issues.push({
				message: `default value must match constant value`,
				path: ['default'],
			});
		}

		if (enumValues !== undefined && !enumValues.includes(defaultValue)) {
			issues.push({
				message: `default value must be one of the enum values`,
				path: ['default'],
			});
		}

		if (defaultValue < minimum) {
			issues.push({
				message: `default value can't be lower than minimum value`,
				path: ['default'],
			});
		}

		if (defaultValue > maximum) {
			issues.push({
				message: `default value can't be greater than maximum value`,
				path: ['default'],
			});
		}
	}

	if (constValue !== undefined) {
		if (constValue < minimum) {
			issues.push({
				message: `const value can't be lower than minimum value`,
				path: ['const'],
			});
		}

		if (constValue > maximum) {
			issues.push({
				message: `const value can't be greater than maximum value`,
				path: ['const'],
			});
		}
	}

	if (enumValues !== undefined) {
		for (let idx = 0, len = enumValues.length; idx < len; idx++) {
			const enumValue = enumValues[idx];

			if (enumValue < minimum) {
				issues.push({
					message: `enum value can't be lower than minimum value`,
					path: ['enum', idx],
				});
			}

			if (enumValue > maximum) {
				issues.push({
					message: `enum value can't be greater than maximum value`,
					path: ['enum', idx],
				});
			}
		}
	}

	return issues;
};

const validateStringFormat = (value: string, format: t.LexStringFormat): boolean => {
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

/**
 * validates lexicon string type constraints
 * @param input the string type definition
 * @returns array of validation issues
 */
export const refineLexString = (input: t.LexString): RefineIssue[] => {
	const {
		format,
		minLength = 0,
		maxLength = Infinity,
		minGraphemes = 0,
		maxGraphemes = Infinity,
		const: constValue,
		default: defaultValue,
		enum: enumValues,
		knownValues,
	} = input;

	const issues: RefineIssue[] = [];

	// check exclusivity first
	if (constValue !== undefined && enumValues !== undefined) {
		return [
			{
				message: `const and enum can't be used together`,
				path: ['const'],
			},
		];
	}

	if (constValue !== undefined && knownValues !== undefined) {
		return [
			{
				message: `const and knownValues can't be used together`,
				path: ['const'],
			},
		];
	}

	if (enumValues !== undefined && knownValues !== undefined) {
		return [
			{
				message: `enum and knownValues can't be used together`,
				path: ['enum'],
			},
		];
	}

	if (minLength > maxLength) {
		issues.push({
			message: `minimum string length can't be greater than maximum string length`,
			path: ['minLength'],
		});
	}

	if (minGraphemes > maxGraphemes) {
		issues.push({
			message: `minimum grapheme count can't be greater than maximum grapheme count`,
			path: ['minGraphemes'],
		});
	}

	if (defaultValue !== undefined) {
		if (constValue !== undefined && defaultValue !== constValue) {
			issues.push({
				message: `default value must match constant value`,
				path: ['default'],
			});
		}

		if (enumValues !== undefined && !enumValues.includes(defaultValue)) {
			issues.push({
				message: `default value must be one of the enum values`,
				path: ['default'],
			});
		}

		{
			const bound = isWithinUtf8Bounds(defaultValue, minLength, maxLength);

			if (bound === 'min') {
				issues.push({
					message: `default value can't be shorter than minimum string length`,
					path: ['default'],
				});
			}

			if (bound === 'max') {
				issues.push({
					message: `default value can't be longer than maximum string length`,
					path: ['default'],
				});
			}
		}

		{
			const bound = isWithinGraphemeBounds(defaultValue, minLength, maxLength);

			if (bound === 'min') {
				issues.push({
					message: `default value can't be shorter than minimum grapheme count`,
					path: ['default'],
				});
			}

			if (bound === 'max') {
				issues.push({
					message: `default value can't be longer than minimum grapheme count`,
					path: ['default'],
				});
			}
		}

		if (format !== undefined && !validateStringFormat(defaultValue, format)) {
			issues.push({
				message: `default value does not match format '${format}'`,
				path: ['default'],
			});
		}
	}

	if (constValue !== undefined) {
		{
			const bound = isWithinUtf8Bounds(constValue, minLength, maxLength);

			if (bound === 'min') {
				issues.push({
					message: `const value can't be shorter than minimum string length`,
					path: ['const'],
				});
			}

			if (bound === 'max') {
				issues.push({
					message: `const value can't be longer than maximum string length`,
					path: ['const'],
				});
			}
		}

		{
			const bound = isWithinGraphemeBounds(constValue, minLength, maxLength);

			if (bound === 'min') {
				issues.push({
					message: `const value can't be shorter than minimum grapheme count`,
					path: ['const'],
				});
			}

			if (bound === 'max') {
				issues.push({
					message: `const value can't be longer than minimum grapheme count`,
					path: ['const'],
				});
			}
		}

		if (format !== undefined && !validateStringFormat(constValue, format)) {
			issues.push({
				message: `const value does not match format '${format}'`,
				path: ['const'],
			});
		}
	}

	if (enumValues !== undefined) {
		for (let idx = 0, len = enumValues.length; idx < len; idx++) {
			const enumValue = enumValues[idx];

			{
				const bound = isWithinUtf8Bounds(enumValue, minLength, maxLength);

				if (bound === 'min') {
					issues.push({
						message: `enum value can't be shorter than minimum string length`,
						path: ['enum', idx],
					});
				}

				if (bound === 'max') {
					issues.push({
						message: `enum value can't be longer than maximum string length`,
						path: ['enum', idx],
					});
				}
			}

			{
				const bound = isWithinGraphemeBounds(enumValue, minGraphemes, maxGraphemes);

				if (bound === 'min') {
					issues.push({
						message: `enum value can't have fewer graphemes than minimum grapheme count`,
						path: ['enum', idx],
					});
				}

				if (bound === 'max') {
					issues.push({
						message: `enum value can't have more graphemes than maximum grapheme count`,
						path: ['enum', idx],
					});
				}
			}

			if (format !== undefined && !validateStringFormat(enumValue, format)) {
				issues.push({
					message: `enum value does not match format '${format}'`,
					path: ['enum', idx],
				});
			}
		}
	}

	if (knownValues !== undefined) {
		for (let idx = 0, len = knownValues.length; idx < len; idx++) {
			const knownValue = knownValues[idx];

			{
				const bound = isWithinUtf8Bounds(knownValue, minLength, maxLength);

				if (bound === 'min') {
					issues.push({
						message: `known value can't be shorter than minimum string length`,
						path: ['known', idx],
					});
				}

				if (bound === 'max') {
					issues.push({
						message: `known value can't be longer than maximum string length`,
						path: ['known', idx],
					});
				}
			}

			{
				const bound = isWithinGraphemeBounds(knownValue, minGraphemes, maxGraphemes);

				if (bound === 'min') {
					issues.push({
						message: `known value can't have fewer graphemes than minimum grapheme count`,
						path: ['known', idx],
					});
				}

				if (bound === 'max') {
					issues.push({
						message: `known value can't have more graphemes than maximum grapheme count`,
						path: ['known', idx],
					});
				}
			}

			if (format !== undefined && !validateStringFormat(knownValue, format)) {
				issues.push({
					message: `known value does not match format '${format}'`,
					path: ['knownValues', idx],
				});
			}
		}
	}

	return issues;
};

/**
 * validates lexicon bytes type constraints
 * @param input the bytes type definition
 * @returns array of validation issues
 */
export const refineLexBytes = (input: t.LexBytes): RefineIssue[] => {
	const { minLength = 0, maxLength = Infinity } = input;
	const issues: RefineIssue[] = [];

	if (minLength > maxLength) {
		issues.push({
			message: `minimum byte length can't be greater than maximum byte length`,
			path: ['minLength'],
		});
	}

	return issues;
};

/**
 * validates lexicon ref union type constraints
 * @param input the ref union type definition
 * @returns array of validation issues
 */
export const refineLexRefUnion = (input: t.LexRefUnion): RefineIssue[] => {
	const { refs, closed = false } = input;
	const issues: RefineIssue[] = [];

	if (closed) {
		if (refs.length === 0) {
			issues.push({
				message: `closed enum can't have zero ref members`,
				path: ['refs'],
			});
		}
	}

	return issues;
};

/**
 * validates lexicon array type constraints
 * @param input the array type definition
 * @returns array of validation issues
 */
export const refineLexArray = (input: t.LexArray | t.LexPrimitiveArray): RefineIssue[] => {
	const { minLength = 0, maxLength = Infinity } = input;
	const issues: RefineIssue[] = [];

	if (minLength > maxLength) {
		issues.push({
			message: `minimum array length can't be greater than maximum array length`,
			path: ['minLength'],
		});
	}

	return issues;
};

const KEY_RE = /^[a-zA-Z][a-zA-Z0-9_]{0,62}?$/;

/**
 * validates lexicon object type constraints
 * @param input the object type definition
 * @returns array of validation issues
 */
export const refineLexObject = (input: t.LexObject): RefineIssue[] => {
	const { required = [], properties } = input;
	const issues: RefineIssue[] = [];

	for (const key in properties) {
		if (!KEY_RE.test(key)) {
			issues.push({
				message: `invalid property key`,
				path: ['properties', key],
			});
		}
	}

	if (required.length > 0) {
		if (properties === undefined) {
			issues.push({
				message: `required fields specified but no properties defined`,
				path: ['properties'],
			});
		} else {
			for (const key of required) {
				if (properties[key] === undefined) {
					issues.push({
						message: `required fields not defined`,
						path: ['properties', key],
					});
				}
			}
		}
	}

	return issues;
};

/**
 * validates lexicon record type constraints
 * @param input the record type definition
 * @returns array of validation issues
 */
export const refineLexRecord = (input: t.LexRecord): RefineIssue[] => {
	const issues: RefineIssue[] = [];

	for (const { message, path } of refineLexObject(input.record)) {
		issues.push({
			message,
			path: ['record', ...path],
		});
	}

	return issues;
};

/**
 * validates lexicon XRPC parameters type constraints
 * @param input the XRPC parameters type definition
 * @returns array of validation issues
 */
export const refineLexXrpcParameters = (input: t.LexXrpcParameters): RefineIssue[] => {
	const { required = [], properties } = input;
	const issues: RefineIssue[] = [];

	for (const key in properties) {
		if (!KEY_RE.test(key)) {
			issues.push({
				message: `invalid property key`,
				path: ['properties', key],
			});
		}
	}

	if (required.length > 0) {
		if (properties === undefined) {
			issues.push({
				message: `required fields specified but no properties defined`,
				path: ['properties'],
			});
		} else {
			for (const key of required) {
				if (properties[key] === undefined) {
					issues.push({
						message: `required fields not defined`,
						path: ['properties', key],
					});
				}
			}
		}
	}

	return issues;
};

/**
 * validates lexicon XRPC query type constraints
 * @param input the XRPC query type definition
 * @returns array of validation issues
 */
export const refineLexXrpcQuery = (input: t.LexXrpcQuery): RefineIssue[] => {
	const issues: RefineIssue[] = [];

	if (input.parameters) {
		for (const { message, path } of refineLexXrpcParameters(input.parameters)) {
			issues.push({
				message,
				path: ['parameters', ...path],
			});
		}
	}

	if (input.output?.schema?.type === 'object') {
		for (const { message, path } of refineLexObject(input.output.schema)) {
			issues.push({
				message,
				path: ['output', 'schema', ...path],
			});
		}
	}

	if (input.output?.schema?.type === 'union') {
		for (const { message, path } of refineLexRefUnion(input.output.schema)) {
			issues.push({
				message,
				path: ['output', 'schema', ...path],
			});
		}
	}

	return issues;
};

/**
 * validates lexicon XRPC procedure type constraints
 * @param input the XRPC procedure type definition
 * @returns array of validation issues
 */
export const refineLexXrpcProcedure = (input: t.LexXrpcProcedure): RefineIssue[] => {
	const issues: RefineIssue[] = [];

	if (input.parameters) {
		for (const { message, path } of refineLexXrpcParameters(input.parameters)) {
			issues.push({
				message,
				path: ['parameters', ...path],
			});
		}
	}

	switch (input.input?.schema?.type) {
		case 'object': {
			for (const { message, path } of refineLexObject(input.input.schema)) {
				issues.push({
					message,
					path: ['input', 'schema', ...path],
				});
			}

			break;
		}
		case 'union': {
			for (const { message, path } of refineLexRefUnion(input.input.schema)) {
				issues.push({
					message,
					path: ['input', 'schema', ...path],
				});
			}

			break;
		}
	}

	switch (input.output?.schema?.type) {
		case 'object': {
			for (const { message, path } of refineLexObject(input.output.schema)) {
				issues.push({
					message,
					path: ['output', 'schema', ...path],
				});
			}

			break;
		}
		case 'union': {
			for (const { message, path } of refineLexRefUnion(input.output.schema)) {
				issues.push({
					message,
					path: ['output', 'schema', ...path],
				});
			}

			break;
		}
	}

	return issues;
};

/**
 * validates lexicon XRPC subscription type constraints
 * @param input the XRPC subscription type definition
 * @returns array of validation issues
 */
export const refineLexXrpcSubscription = (input: t.LexXrpcSubscription): RefineIssue[] => {
	const issues: RefineIssue[] = [];

	if (input.parameters) {
		for (const { message, path } of refineLexXrpcParameters(input.parameters)) {
			issues.push({
				message,
				path: ['parameters', ...path],
			});
		}
	}

	switch (input.message?.schema?.type) {
		case 'object': {
			for (const { message, path } of refineLexObject(input.message.schema)) {
				issues.push({
					message,
					path: ['message', 'schema', ...path],
				});
			}

			break;
		}
		case 'union': {
			for (const { message, path } of refineLexRefUnion(input.message.schema)) {
				issues.push({
					message,
					path: ['message', 'schema', ...path],
				});
			}

			break;
		}
	}

	return issues;
};

/**
 * validates lexicon language map
 * @param input the language map with BCP47 language tags as keys
 * @returns array of validation issues
 */
export const refineLexLang = (input: t.LexLang): RefineIssue[] => {
	const issues: RefineIssue[] = [];

	for (const key in input) {
		if (!isLanguageCode(key)) {
			issues.push({
				message: `invalid BCP47 language tag`,
				path: [key],
			});
		}
	}

	return issues;
};

/**
 * validates lexicon permission constraints
 * @param input the permission definition
 * @returns array of validation issues
 */
export const refineLexPermission = (input: t.LexPermission): RefineIssue[] => {
	const { resource } = input;
	const issues: RefineIssue[] = [];

	switch (resource) {
		case 'repo': {
			const collection = input.collection;
			if (Array.isArray(collection) && collection.length === 0) {
				issues.push({
					message: `collection can't be empty`,
					path: ['collection'],
				});
			}
			break;
		}
		case 'rpc': {
			const lxm = input.lxm;
			const aud = input.aud;

			if (Array.isArray(lxm) && lxm.length === 0) {
				issues.push({
					message: `lxm can't be empty`,
					path: ['lxm'],
				});
			}

			if (aud === '*' && lxm === '*') {
				issues.push({
					message: `aud and lxm can't both be wildcards`,
					path: ['aud'],
				});
			}
			break;
		}
		case 'blob': {
			const accept = input.accept;
			if (Array.isArray(accept) && accept.length === 0) {
				issues.push({
					message: `accept can't be empty`,
					path: ['accept'],
				});
			}
			break;
		}
	}

	return issues;
};

/**
 * validates lexicon permission set constraints
 * @param input the permission set definition
 * @returns array of validation issues
 */
export const refineLexPermissionSet = (input: t.LexPermissionSet): RefineIssue[] => {
	const { 'title:lang': titleLang, 'detail:lang': detailLang, permissions } = input;
	const issues: RefineIssue[] = [];

	if (titleLang !== undefined) {
		for (const { message, path } of refineLexLang(titleLang)) {
			issues.push({
				message,
				path: ['title:lang', ...path],
			});
		}
	}

	if (detailLang !== undefined) {
		for (const { message, path } of refineLexLang(detailLang)) {
			issues.push({
				message,
				path: ['detail:lang', ...path],
			});
		}
	}

	if (permissions.length === 0) {
		issues.push({
			message: `permissions array can't be empty`,
			path: ['permissions'],
		});
	}

	// validate each permission
	for (let idx = 0, len = permissions.length; idx < len; idx++) {
		const permission = permissions[idx];

		for (const { message, path } of refineLexPermission(permission)) {
			issues.push({
				message,
				path: ['permission', idx, ...path],
			});
		}
	}

	return issues;
};

/**
 * validates lexicon document constraints
 * @param input the lexicon document input
 * @returns array of validation issues
 */
export const refineLexiconDoc = (input: { defs: Record<string, t.LexUserType> }): RefineIssue[] => {
	const { defs } = input;
	const issues: RefineIssue[] = [];

	for (const key in defs) {
		const def = defs[key];

		if (!KEY_RE.test(key)) {
			issues.push({
				message: `invalid definition id`,
				path: [key],
			});
		}

		if (
			key !== 'main' &&
			(def.type === 'record' ||
				def.type === 'procedure' ||
				def.type === 'query' ||
				def.type === 'subscription' ||
				def.type === 'permission-set')
		) {
			issues.push({
				message: `records, procedures, queries, subscriptions and permission sets must be the main definition`,
				path: [key],
			});
		}
	}

	return issues;
};

const validateUserType = (def: t.LexUserType): RefineIssue[] => {
	switch (def.type) {
		case 'boolean': {
			return refineLexBoolean(def);
		}
		case 'integer': {
			return refineLexInteger(def);
		}
		case 'string': {
			return refineLexString(def);
		}
		case 'bytes': {
			return refineLexBytes(def);
		}
		case 'array': {
			return refineLexArray(def);
		}
		case 'object': {
			return refineLexObject(def);
		}
		case 'record': {
			return refineLexRecord(def);
		}
		case 'query': {
			return refineLexXrpcQuery(def);
		}
		case 'procedure': {
			return refineLexXrpcProcedure(def);
		}
		case 'subscription': {
			return refineLexXrpcSubscription(def);
		}
		case 'permission-set': {
			return refineLexPermissionSet(def);
		}
		case 'unknown':
		case 'blob':
		case 'cid-link':
		case 'token': {
			return [];
		}
	}
};

/**
 * lints an entire lexicon document
 * @param doc the lexicon document to validate
 * @returns array of all validation issues with paths adjusted to include definition keys
 */
export const validateLexiconDoc = (doc: t.LexiconDoc): RefineIssue[] => {
	const issues: RefineIssue[] = [];

	// document-level validation
	for (const { message, path } of refineLexiconDoc({ defs: doc.defs })) {
		issues.push({
			message,
			path: ['defs', ...path],
		});
	}

	// validate each definition
	for (const [key, def] of Object.entries(doc.defs)) {
		for (const { message, path } of validateUserType(def)) {
			issues.push({
				message,
				path: ['defs', key, ...path],
			});
		}
	}

	return issues;
};
