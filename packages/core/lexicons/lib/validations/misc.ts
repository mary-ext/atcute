import type { BaseSchema, InferInput, InferOutput } from './base.js';

export interface NullableSchema<TItem extends BaseSchema<any>>
	extends BaseSchema<InferInput<TItem> | null, InferOutput<TItem> | null> {
	readonly type: 'nullable';
	readonly wrapped: TItem;
}

export const nullable = <TItem extends BaseSchema<any>>(wrapped: TItem): NullableSchema<TItem> => {
	return {
		kind: 'schema',
		type: 'nullable',
		wrapped: wrapped,
		'~run'(input, flags) {
			if (input === null) {
				return undefined;
			}

			return wrapped['~run'](input, flags);
		},
	};
};

export type DefaultValue<TItem extends BaseSchema<any>> =
	| InferOutput<TItem>
	| (() => InferOutput<TItem>)
	| undefined;

export type InferOptionalOutput<
	TItem extends BaseSchema<any>,
	TDefault extends DefaultValue<TItem>,
> = undefined extends TDefault ? InferOutput<TItem> | undefined : InferOutput<TItem>;

export interface OptionalSchema<TItem extends BaseSchema<any>, TDefault extends DefaultValue<TItem>>
	extends BaseSchema<InferInput<TItem> | undefined, InferOptionalOutput<TItem, TDefault>> {
	readonly type: 'optional';
	readonly wrapped: TItem;
	readonly default: TDefault;
}

export const optional: {
	<TItem extends BaseSchema<any>>(wrapped: TItem): OptionalSchema<TItem, undefined>;
	<TItem extends BaseSchema<any>, TDefault extends DefaultValue<TItem>>(
		wrapped: TItem,
		defaultValue: TDefault,
	): OptionalSchema<TItem, TDefault>;
} = (wrapped: BaseSchema<any>, defaultValue?: any): OptionalSchema<any, any> => {
	return {
		kind: 'schema',
		type: 'optional',
		wrapped: wrapped,
		default: defaultValue,
		'~run'(input, flags) {
			if (input === undefined) {
				if (defaultValue === undefined) {
					return undefined;
				}

				const value = typeof defaultValue === 'function' ? defaultValue() : defaultValue;

				return { ok: true, value };
			}

			return wrapped['~run'](input, flags);
		},
	};
};
