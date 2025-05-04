import {
	FLAG_ABORT_EARLY,
	joinIssues,
	prependPath,
	type BaseSchema,
	type InferInput,
	type InferOutput,
	type IssueLeaf,
	type IssueTree,
} from '../base.js';
import { isArray, lazy } from '../utils.js';

export interface ArraySchema<TItem extends BaseSchema<any>>
	extends BaseSchema<InferInput<TItem>[], InferOutput<TItem>[]> {
	readonly type: 'array';
	readonly item: TItem;
}

const ISSUE_TYPE_ARRAY: IssueLeaf = {
	ok: false,
	code: 'invalid_type',
	expected: 'array',
};

// #__NO_SIDE_EFFECTS__
export const array = <TItem extends BaseSchema<any>>(item: TItem | (() => TItem)): ArraySchema<TItem> => {
	const resolvedShape = lazy(() => {
		return typeof item === 'function' ? item() : item;
	});

	return {
		kind: 'schema',
		type: 'array',
		get item() {
			return resolvedShape.value;
		},
		'~run'(input, flags) {
			if (!isArray(input)) {
				return ISSUE_TYPE_ARRAY;
			}

			const shape = resolvedShape.value;

			let issues: IssueTree | undefined;
			let output: any[] | undefined;

			for (let idx = 0, len = input.length; idx < len; idx++) {
				const val = input[idx];
				const r = shape['~run'](val, flags);

				if (r !== undefined) {
					if (r.ok) {
						if (output === undefined) {
							output = input.slice();
						}

						output[idx] = r.value;
					} else {
						if (flags & FLAG_ABORT_EARLY) {
							return r;
						}

						issues = joinIssues(issues, prependPath(idx, r));
					}
				}
			}

			if (issues !== undefined) {
				return issues;
			}

			if (output !== undefined) {
				return { ok: true, value: output };
			}

			return undefined;
		},
	};
};
