import {
	FLAG_ABORT_EARLY,
	FLAG_EMPTY,
	type BaseSchema,
	type Err,
	type InferInput,
	type InferOutput,
	type Issue,
	type IssueLeaf,
	type IssueTree,
	type Key,
	type Literal,
	type Ok,
	type ValidationResult,
} from './base.js';

const cloneIssueWithPath = (issue: IssueLeaf, path: Key[]): Issue => {
	const code = issue.code;
	switch (code) {
		case 'missing_value': {
			return { code, path };
		}
		case 'invalid_literal': {
			return { code, path, expected: issue.expected };
		}
		case 'invalid_type': {
			return { code, path, expected: issue.expected };
		}
		case 'invalid_variant': {
			return { code, path, expected: issue.expected };
		}
		case 'invalid_integer_range': {
			return { code, path, min: issue.min, max: issue.max };
		}
		case 'invalid_string_format': {
			return { code, path, expected: issue.expected };
		}
		case 'invalid_string_graphemes': {
			return { code, path, minGraphemes: issue.minGraphemes, maxGraphemes: issue.maxGraphemes };
		}
		case 'invalid_string_length': {
			return { code, path, minLength: issue.minLength, maxLength: issue.maxLength };
		}
		case 'invalid_array_length': {
			return { code, path, minLength: issue.minLength, maxLength: issue.maxLength };
		}
		case 'invalid_bytes_size': {
			return { code, path, minSize: issue.minSize, maxSize: issue.maxSize };
		}
	}
};

const collectIssues = (tree: IssueTree, path: Key[] = [], issues: Issue[] = []): Issue[] => {
	for (;;) {
		switch (tree.code) {
			case 'join': {
				collectIssues(tree.left, path.slice(), issues);
				tree = tree.right;
				continue;
			}
			case 'prepend': {
				path.push(tree.key);
				tree = tree.tree;
				continue;
			}
			default: {
				issues.push(cloneIssueWithPath(tree, path));
				return issues;
			}
		}
	}
};

const countIssues = (tree: IssueTree): number => {
	let count = 0;
	for (;;) {
		switch (tree.code) {
			case 'join': {
				count += countIssues(tree.left);
				tree = tree.right;
				continue;
			}
			case 'prepend': {
				tree = tree.tree;
				continue;
			}
			default: {
				return count + 1;
			}
		}
	}
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

const formatLiteral = (value: Literal): string => {
	return JSON.stringify(value);
};

const formatRangeMessage = (
	type: 'a string' | 'an array' | 'a byte array',
	unit: 'character' | 'grapheme' | 'item' | 'byte',
	min: number,
	max: number,
): string => {
	let message = `${type} `;

	if (min > 0) {
		if (max === min) {
			message += `${min}`;
		} else if (max !== Infinity) {
			message += `between ${min} and ${max}`;
		} else {
			message += `at least ${min}`;
		}
	} else {
		message += `at most ${max}`;
	}

	message += ` ${unit}(s)`;
	return message;
};

const formatIssueTree = (tree: IssueTree): string => {
	let path = '';
	let count = 0;
	for (;;) {
		switch (tree.code) {
			case 'join': {
				count += countIssues(tree.right);
				tree = tree.left;
				continue;
			}
			case 'prepend': {
				path += `.${tree.key}`;
				tree = tree.tree;
				continue;
			}
		}

		break;
	}

	let message: string;
	switch (tree.code) {
		case 'missing_value': {
			message = `missing value`;
			break;
		}
		case 'invalid_literal': {
			message = `expected ${separatedList(tree.expected.map(formatLiteral), 'or')}`;
			break;
		}
		case 'invalid_type': {
			message = `expected ${tree.expected}`;
			break;
		}
		case 'invalid_variant': {
			message = `expected ${separatedList(tree.expected, 'or')}`;
			break;
		}
		case 'invalid_integer_range': {
			const min = tree.min;
			const max = tree.max;

			message = `expected an integer `;

			if (min > 0) {
				if (max === min) {
					message += `of exactly ${min}`;
				} else if (max !== Infinity) {
					message += `between ${min} and ${max}`;
				} else {
					message += `of at least ${min}`;
				}
			} else {
				message += `of at most ${max}`;
			}

			break;
		}
		case 'invalid_string_format': {
			message = `expected a string with a format of ${tree.expected}`;
			break;
		}
		case 'invalid_string_graphemes': {
			message = formatRangeMessage('a string', 'grapheme', tree.minGraphemes, tree.maxGraphemes);
			break;
		}
		case 'invalid_string_length': {
			message = formatRangeMessage('a string', 'character', tree.minLength, tree.maxLength);
			break;
		}
		case 'invalid_array_length': {
			message = formatRangeMessage('an array', 'item', tree.minLength, tree.maxLength);
			break;
		}
		case 'invalid_bytes_size': {
			message = formatRangeMessage('a byte array', 'byte', tree.minSize, tree.maxSize);
			break;
		}
	}

	let msg = `${tree.code} at ${path ?? '.'}: ${message}`;
	if (count > 0) {
		msg += ` (+${count} other issue(s))`;
	}

	return msg;
};

export class ValidationError extends Error {
	override readonly name = 'ValidationError';

	#issueTree: IssueTree;

	constructor(issueTree: IssueTree) {
		super();

		this.#issueTree = issueTree;
	}

	override get message(): string {
		return formatIssueTree(this.#issueTree);
	}

	get issues(): readonly Issue[] {
		return collectIssues(this.#issueTree);
	}
}

class ErrImpl implements Err {
	readonly ok = false;

	#issueTree: IssueTree;

	constructor(issueTree: IssueTree) {
		this.#issueTree = issueTree;
	}

	get message(): string {
		return formatIssueTree(this.#issueTree);
	}

	get issues(): readonly Issue[] {
		return collectIssues(this.#issueTree);
	}

	throw(): never {
		throw new ValidationError(this.#issueTree);
	}
}

export const is = <const TSchema extends BaseSchema<any>>(
	schema: TSchema,
	input: unknown,
): input is InferInput<TSchema> => {
	const r = schema['~run'](input, FLAG_ABORT_EARLY);
	return r === undefined || r.ok;
};

export const safeParse = <const TSchema extends BaseSchema<any>>(
	schema: TSchema,
	input: unknown,
): ValidationResult<InferOutput<TSchema>> => {
	const r = schema['~run'](input, FLAG_EMPTY);

	if (r === undefined) {
		return { ok: true, value: input as InferOutput<TSchema> };
	}

	if (r.ok) {
		return r as Ok<InferOutput<TSchema>>;
	}

	return new ErrImpl(r);
};

export const parse = <const TSchema extends BaseSchema<any>>(
	schema: TSchema,
	input: unknown,
): InferOutput<TSchema> => {
	const r = schema['~run'](input, FLAG_EMPTY);

	if (r === undefined) {
		return input as InferOutput<TSchema>;
	}

	if (r.ok) {
		return r.value as InferOutput<TSchema>;
	}

	throw new ValidationError(r);
};
