import type { BaseSchema, IssueLeaf, StringFormat } from '../base.js';

export interface StringSchema<
	TFormat extends StringFormat | undefined = undefined,
	TType extends string = string,
> extends BaseSchema<TType> {
	readonly type: 'string';
	readonly format: TFormat;
}

const ISSUE_TYPE_STRING: IssueLeaf = {
	ok: false,
	code: 'invalid_type',
	expected: 'string',
};

const STRING_SCHEMA: StringSchema = {
	kind: 'schema',
	type: 'string',
	format: undefined,
	'~run'(input, _flags) {
		if (typeof input !== 'string') {
			return ISSUE_TYPE_STRING;
		}

		return undefined;
	},
};

// #__NO_SIDE_EFFECTS__
export const string = (): StringSchema => {
	return STRING_SCHEMA;
};

/** @internal */
// #__NO_SIDE_EFFECTS__
export const _createStringFormat = <TFormat extends StringFormat, TType extends string>(
	format: TFormat,
	validate: (input: unknown) => input is TType,
): (() => StringSchema<TFormat, TType>) => {
	const issue: IssueLeaf = {
		ok: false,
		code: 'invalid_string_format',
		expected: format,
	};

	const schema: StringSchema<TFormat, TType> = {
		kind: 'schema',
		type: 'string',
		format: format,
		'~run'(input, _flags) {
			if (typeof input !== 'string') {
				return ISSUE_TYPE_STRING;
			}

			if (!validate(input)) {
				return issue;
			}

			return undefined;
		},
	};

	return () => schema;
};
