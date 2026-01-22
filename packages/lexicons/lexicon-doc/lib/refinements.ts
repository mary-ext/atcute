import { isLanguageCode, isNsid } from '@atcute/lexicons/syntax';

import { isWithinGraphemeBounds, isWithinUtf8Bounds } from './internal/utils.js';
import {
	DELIMITED_MIME_TYPE_RE,
	KEY_RE,
	MIME_TYPE_RE,
	REF_RE,
	validateRecordKey,
	validateStringFormat,
} from './internal/validation.js';
import type * as t from './types.js';

export interface RefineIssue {
	message: string;
	path: (string | number)[];
}

// #region Concrete types
/**
 * validates constraints in lexicon boolean definitions.
 * @param spec boolean type definition to validate
 * @returns validation issues found
 */
export const refineLexBoolean = (spec: t.LexBoolean): RefineIssue[] => {
	const { const: constValue, default: defaultValue } = spec;
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
 * validates constraints in lexicon integer definitions.
 * @param spec integer type definition to validate
 * @returns validation issues found
 */
export const refineLexInteger = (spec: t.LexInteger): RefineIssue[] => {
	const {
		minimum = 0,
		maximum = Infinity,
		const: constValue,
		default: defaultValue,
		enum: enumValues,
	} = spec;

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

/**
 * validates constraints in lexicon string definitions.
 * @param spec string type definition to validate
 * @returns validation issues found
 */
export const refineLexString = (spec: t.LexString): RefineIssue[] => {
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
	} = spec;

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
 * validates constraints in lexicon bytes definitions.
 * @param spec bytes type definition to validate
 * @returns validation issues found
 */
export const refineLexBytes = (spec: t.LexBytes): RefineIssue[] => {
	const { minLength = 0, maxLength = Infinity } = spec;
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
 * validates constraints in lexicon blob definitions.
 * @param spec blob type definition to validate
 * @returns validation issues found
 */
export const refineLexBlob = (spec: t.LexBlob): RefineIssue[] => {
	const { accept = [] } = spec;
	const issues: RefineIssue[] = [];

	if (accept.includes('*/*')) {
		if (accept.length > 1) {
			issues.push({
				message: `no other MIME types can be specified when a wildcard is present`,
				path: ['accept'],
			});
		}
	} else {
		for (let idx = 0, len = accept.length; idx < len; idx++) {
			const mime = accept[idx];

			if (!MIME_TYPE_RE.test(mime)) {
				issues.push({
					message: `invalid MIME type`,
					path: ['accept', idx],
				});
			}
		}
	}

	return issues;
};
// #endregion

// #region Meta types
export const refineLexRef = (spec: t.LexRef): RefineIssue[] => {
	const { ref } = spec;
	const issues: RefineIssue[] = [];

	if (!REF_RE.test(ref)) {
		issues.push({
			message: `invalid ref identifier`,
			path: ['ref'],
		});
	}

	return issues;
};

/**
 * validates constraints in lexicon ref union definitions.
 * @param spec ref union type definition to validate
 * @returns validation issues found
 */
export const refineLexRefUnion = (spec: t.LexRefUnion): RefineIssue[] => {
	const { refs, closed = false } = spec;
	const issues: RefineIssue[] = [];

	if (closed) {
		if (refs.length === 0) {
			issues.push({
				message: `closed enum can't have zero ref members`,
				path: ['refs'],
			});
		}
	}

	for (let idx = 0, len = refs.length; idx < len; idx++) {
		const ref = refs[idx];

		if (!REF_RE.test(ref)) {
			issues.push({
				message: `invalid ref identifiier`,
				path: ['refs', idx],
			});
		}
	}

	return issues;
};
// #endregion

// #region Container types
const refineLexDefinableField = (spec: t.LexDefinableField, deep: boolean = false): RefineIssue[] => {
	switch (spec.type) {
		// Concrete
		case 'boolean': {
			return refineLexBoolean(spec);
		}
		case 'integer': {
			return refineLexInteger(spec);
		}
		case 'string': {
			return refineLexString(spec);
		}
		case 'bytes': {
			return refineLexBytes(spec);
		}
		case 'cid-link': {
			return [];
		}
		case 'blob': {
			return refineLexBlob(spec);
		}

		// Meta
		case 'ref': {
			return refineLexRef(spec);
		}
		case 'union': {
			return refineLexRefUnion(spec);
		}
		case 'unknown': {
			return [];
		}

		// Container
		case 'array': {
			return refineLexArray(spec, deep);
		}
	}
};

/**
 * validates constraints in lexicon array definitions.
 * @param spec array type definition to validate
 * @param deep whether nested schemas should be validated
 * @returns validation issues found
 */
export const refineLexArray = (
	spec: t.LexArray | t.LexPrimitiveArray,
	deep: boolean = false,
): RefineIssue[] => {
	const { items, minLength = 0, maxLength = Infinity } = spec;
	const issues: RefineIssue[] = [];

	if (minLength > maxLength) {
		issues.push({
			message: `minimum array length can't be greater than maximum array length`,
			path: ['minLength'],
		});
	}

	if (deep) {
		for (const { message, path } of refineLexDefinableField(items)) {
			issues.push({
				message,
				path: ['items', ...path],
			});
		}
	}

	return issues;
};

/**
 * validates constraints in lexicon object definitions.
 * @param spec object type definition to validate
 * @param deep whether nested schemas should be validated
 * @returns validation issues found
 */
export const refineLexObject = (spec: t.LexObject, deep: boolean = false): RefineIssue[] => {
	const { required = [], properties } = spec;
	const issues: RefineIssue[] = [];

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
						message: `required field not defined`,
						path: ['properties', key],
					});
				}
			}
		}
	}

	for (const prop in properties) {
		const propSpec = properties[prop];

		if (!KEY_RE.test(prop)) {
			issues.push({
				message: `invalid property key`,
				path: ['properties', prop],
			});
		}

		if (deep) {
			for (const { message, path } of refineLexDefinableField(propSpec, deep)) {
				issues.push({
					message,
					path: ['properties', prop, ...path],
				});
			}
		}
	}

	return issues;
};
// #endregion

// #region Miscellaneous
const refineLexXrpcBody = (spec: t.LexXrpcBody, deep: boolean = false): RefineIssue[] => {
	const { encoding, schema } = spec;
	const issues: RefineIssue[] = [];

	if (!DELIMITED_MIME_TYPE_RE.test(encoding)) {
		issues.push({
			message: `must be a comma-delimited list of MIME types`,
			path: ['encoding'],
		});
	}

	if (deep && schema !== undefined) {
		switch (schema.type) {
			case 'object': {
				for (const { message, path } of refineLexObject(schema, deep)) {
					issues.push({
						message,
						path: ['schema', ...path],
					});
				}

				break;
			}
			case 'union': {
				for (const { message, path } of refineLexRefUnion(schema)) {
					issues.push({
						message,
						path: ['schema', ...path],
					});
				}

				break;
			}
		}
	}

	return issues;
};

const refineLexLang = (spec: t.LexLang): RefineIssue[] => {
	const issues: RefineIssue[] = [];

	for (const key in spec) {
		if (!isLanguageCode(key)) {
			issues.push({
				message: `invalid BCP47 language tag`,
				path: [key],
			});
		}
	}

	return issues;
};
// #endregion

// #region Sub-types
/**
 * validates constraints in lexicon xrpc parameters definitions.
 * @param spec xrpc parameters type definition to validate
 * @param deep whether nested schemas should be validated
 * @returns validation issues found
 */
export const refineLexXrpcParameters = (spec: t.LexXrpcParameters, deep: boolean = false): RefineIssue[] => {
	return refineLexObject({ type: 'object', required: spec.required, properties: spec.properties }, deep);
};

const REPO_ACTIONS: string[] = ['create', 'update', 'delete'];

/**
 * validates constraints in lexicon permission definitions.
 * @param spec permission definition to validate
 * @returns validation issues found
 */
export const refineLexPermission = (spec: t.LexPermission): RefineIssue[] => {
	const { resource } = spec;
	const issues: RefineIssue[] = [];

	switch (resource) {
		case 'repo': {
			const { collection, action } = spec as { collection?: unknown; action?: unknown };

			// validate collection
			if (!Array.isArray(collection)) {
				issues.push({
					message: `collection must be an array`,
					path: ['collection'],
				});
			} else if (collection.length === 0) {
				issues.push({
					message: `collection can't be empty`,
					path: ['collection'],
				});
			} else {
				for (let idx = 0, len = collection.length; idx < len; idx++) {
					const entry = collection[idx];

					if (typeof entry !== 'string') {
						issues.push({
							message: `collection entries must be strings`,
							path: ['collection', idx],
						});
					} else if (entry === '*') {
						issues.push({
							message: `collection can't be a wildcard`,
							path: ['collection', idx],
						});
					} else if (!isNsid(entry)) {
						issues.push({
							message: `invalid collection nsid`,
							path: ['collection', idx],
						});
					}
				}
			}

			// validate action
			if (action !== undefined) {
				if (!Array.isArray(action)) {
					issues.push({
						message: `action must be an array`,
						path: ['action'],
					});
				} else {
					for (let idx = 0, len = action.length; idx < len; idx++) {
						const entry = action[idx];

						if (typeof entry !== 'string') {
							issues.push({
								message: `action entries must be strings`,
								path: ['action', idx],
							});
						} else if (!REPO_ACTIONS.includes(entry)) {
							issues.push({
								message: `invalid action`,
								path: ['action', idx],
							});
						}
					}
				}
			}

			break;
		}
		case 'rpc': {
			const { lxm, aud, inheritAud } = spec as { lxm?: unknown; aud?: unknown; inheritAud?: unknown };

			// validate lxm
			if (!Array.isArray(lxm)) {
				issues.push({
					message: `lxm must be an array`,
					path: ['lxm'],
				});
			} else if (lxm.length === 0) {
				issues.push({
					message: `lxm can't be empty`,
					path: ['lxm'],
				});
			} else {
				for (let idx = 0, len = lxm.length; idx < len; idx++) {
					const entry = lxm[idx];

					if (typeof entry !== 'string') {
						issues.push({
							message: `lxm entries must be strings`,
							path: ['lxm', idx],
						});
						continue;
					}

					if (entry === '*') {
						issues.push({
							message: `lxm can't be a wildcard`,
							path: ['lxm', idx],
						});
					} else if (!isNsid(entry)) {
						issues.push({
							message: `invalid lxm nsid`,
							path: ['lxm', idx],
						});
					}
				}
			}

			// validate inheritAud and aud
			if (inheritAud !== undefined && typeof inheritAud !== 'boolean') {
				issues.push({
					message: `inheritAud must be a boolean`,
					path: ['inheritAud'],
				});
			} else if (inheritAud) {
				if (aud !== undefined) {
					issues.push({
						message: `aud can't be set when inheritAud is enabled`,
						path: ['aud'],
					});
				}
			} else if (aud === undefined) {
				issues.push({
					message: `aud must be set when inheritAud is disabled`,
					path: ['aud'],
				});
			} else if (typeof aud !== 'string') {
				issues.push({
					message: `aud must be a string`,
					path: ['aud'],
				});
			} else if (aud !== '*') {
				issues.push({
					message: `aud must be a wildcard`,
					path: ['aud'],
				});
			}

			break;
		}
		default: {
			issues.push({
				message: `invalid permission resource '${resource}'`,
				path: ['resource'],
			});
		}
	}

	return issues;
};
// #endregion

// #region Primary types
/**
 * validates constraints in lexicon record definitions.
 * @param spec record type definition to validate
 * @param deep whether nested schemas should be validated
 * @returns validation issues found
 */
export const refineLexRecord = (spec: t.LexRecord, deep: boolean = false): RefineIssue[] => {
	const { key = 'any', record } = spec;
	const issues: RefineIssue[] = [];

	if (!validateRecordKey(key)) {
		issues.push({
			message: `invalid record key`,
			path: ['key'],
		});
	}

	if (deep) {
		for (const { message, path } of refineLexObject(record, deep)) {
			issues.push({
				message,
				path: ['record', ...path],
			});
		}
	}

	return issues;
};

/**
 * validates constraints in lexicon xrpc query definitions.
 * @param spec xrpc query type definition to validate
 * @param deep whether nested schemas should be validated
 * @returns validation issues found
 */
export const refineLexXrpcQuery = (spec: t.LexXrpcQuery, deep: boolean = false): RefineIssue[] => {
	const { parameters, output } = spec;
	const issues: RefineIssue[] = [];

	if (deep) {
		if (parameters !== undefined) {
			for (const { message, path } of refineLexXrpcParameters(parameters, deep)) {
				issues.push({
					message,
					path: ['parameters', ...path],
				});
			}
		}
	}

	if (output !== undefined) {
		for (const { message, path } of refineLexXrpcBody(output, deep)) {
			issues.push({
				message,
				path: ['output', ...path],
			});
		}
	}

	return issues;
};

/**
 * validates constraints in lexicon xrpc procedure definitions.
 * @param spec xrpc procedure type definition to validate
 * @param deep whether nested schemas should be validated
 * @returns validation issues found
 */
export const refineLexXrpcProcedure = (spec: t.LexXrpcProcedure, deep: boolean = false): RefineIssue[] => {
	const { parameters, input, output } = spec;
	const issues: RefineIssue[] = [];

	if (deep) {
		if (parameters !== undefined) {
			for (const { message, path } of refineLexXrpcParameters(parameters, deep)) {
				issues.push({
					message,
					path: ['parameters', ...path],
				});
			}
		}
	}

	if (input !== undefined) {
		for (const { message, path } of refineLexXrpcBody(input, deep)) {
			issues.push({
				message,
				path: ['input', ...path],
			});
		}
	}

	if (output !== undefined) {
		for (const { message, path } of refineLexXrpcBody(output, deep)) {
			issues.push({
				message,
				path: ['output', ...path],
			});
		}
	}

	return issues;
};

/**
 * validates constraints in lexicon xrpc subscription definitions.
 * @param spec xrpc subscription type definition to validate
 * @param deep whether nested schemas should be validated
 * @returns validation issues found
 */
export const refineLexXrpcSubscription = (spec: t.LexXrpcSubscription, deep: boolean): RefineIssue[] => {
	const { parameters, message } = spec;
	const issues: RefineIssue[] = [];

	if (deep) {
		if (parameters !== undefined) {
			for (const { message, path } of refineLexXrpcParameters(parameters, deep)) {
				issues.push({
					message,
					path: ['parameters', ...path],
				});
			}
		}

		if (message !== undefined) {
			const schema = message.schema;

			if (schema !== undefined) {
				for (const { message, path } of refineLexRefUnion(schema)) {
					issues.push({
						message,
						path: ['output', 'schema', ...path],
					});
				}
			}
		}
	}

	return issues;
};

/**
 * validates constraints in lexicon permission sets.
 * @param spec permission set definition to validate
 * @param deep whether nested schemas should be validated
 * @returns validation issues found
 */
export const refineLexPermissionSet = (spec: t.LexPermissionSet, deep: boolean = false): RefineIssue[] => {
	const { 'title:lang': titleLang, 'detail:lang': detailLang, permissions } = spec;
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

	if (deep) {
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
	}

	return issues;
};

// #region Document
const refineUserType = (spec: t.LexUserType, deep: boolean = false): RefineIssue[] => {
	switch (spec.type) {
		// Primary
		case 'record': {
			return refineLexRecord(spec, deep);
		}
		case 'query': {
			return refineLexXrpcQuery(spec, deep);
		}
		case 'procedure': {
			return refineLexXrpcProcedure(spec, deep);
		}
		case 'subscription': {
			return refineLexXrpcSubscription(spec, deep);
		}
		case 'permission-set': {
			return refineLexPermissionSet(spec, deep);
		}

		// Concrete
		case 'boolean': {
			return refineLexBoolean(spec);
		}
		case 'integer': {
			return refineLexInteger(spec);
		}
		case 'string': {
			return refineLexString(spec);
		}
		case 'bytes': {
			return refineLexBytes(spec);
		}
		case 'cid-link': {
			return [];
		}
		case 'blob': {
			return refineLexBlob(spec);
		}

		// Meta
		case 'token': {
			return [];
		}
		case 'unknown': {
			return [];
		}

		// Container
		case 'array': {
			return refineLexArray(spec, deep);
		}
		case 'object': {
			return refineLexObject(spec, deep);
		}
	}
};

/**
 * validates constraints in lexicon documents.
 * @param spec lexicon document input to validate
 * @param deep whether nested schemas should be validated
 * @returns validation issues found
 */
export const refineLexiconDoc = (spec: t.LexiconDoc, deep: boolean = false): RefineIssue[] => {
	const { defs } = spec;
	const issues: RefineIssue[] = [];

	for (const prop in defs) {
		const def = defs[prop];

		if (!KEY_RE.test(prop)) {
			issues.push({
				message: `invalid definition id`,
				path: [prop],
			});
		}

		if (
			prop !== 'main' &&
			(def.type === 'record' ||
				def.type === 'procedure' ||
				def.type === 'query' ||
				def.type === 'subscription' ||
				def.type === 'permission-set')
		) {
			issues.push({
				message: `${def.type} must be the main definition`,
				path: [prop],
			});
		}

		if (deep) {
			for (const { message, path } of refineUserType(def, deep)) {
				issues.push({
					message,
					path: ['defs', prop, ...path],
				});
			}
		}
	}

	return issues;
};
// #endregion
