import {
	safeParse,
	type ArraySchema,
	type BaseSchema,
	type ObjectSchema,
	type OptionalSchema,
	type ValidationResult,
} from '@atcute/lexicons/validations';

import type { Literal } from '../../types/misc.js';

const isArraySchema = (schema: BaseSchema): schema is ArraySchema => {
	return schema.type === 'array';
};

const isOptionalSchema = (schema: BaseSchema): schema is OptionalSchema => {
	return schema.type === 'optional';
};

const unwrapOptional = (schema: BaseSchema): BaseSchema => {
	return isOptionalSchema(schema) ? schema.wrapped : schema;
};

const unwrapArray = (schema: BaseSchema): BaseSchema => {
	return isArraySchema(schema) ? schema.item : schema;
};

const coerceBoolean = (str: string): boolean => {
	return str === 'true';
};

const coerceInteger = (str: string): number => {
	return Number(str);
};

export const constructParamsHandler = <TSchema extends ObjectSchema>(schema: TSchema) => {
	const entries = Object.entries(schema.shape).map(([key, schema]) => {
		const nonnullable = unwrapOptional(schema);
		const singular = unwrapArray(nonnullable);

		let coerce: ((x: string) => Literal) | undefined;
		switch (singular.type) {
			case 'boolean': {
				coerce = coerceBoolean;
				break;
			}
			case 'integer': {
				coerce = coerceInteger;
				break;
			}
		}

		return {
			key: key,
			coerce: coerce,
			multiple: isArraySchema(nonnullable),
			optional: isOptionalSchema(schema),
		};
	});

	const len = entries.length;

	return (searchParams: URLSearchParams): ValidationResult<Record<string, Literal | Literal[]>> => {
		const input: Record<string, Literal | Literal[]> = {};

		for (let idx = 0; idx < len; idx++) {
			const entry = entries[idx];
			const key = entry.key;
			const coerce = entry.coerce;

			const raw = searchParams.getAll(key);
			const count = raw.length;

			let value: Literal | Literal[];

			if (entry.multiple) {
				if (count === 0 && entry.optional) {
					continue;
				}

				value = coerce !== undefined ? raw.map(coerce) : raw;
			} else {
				if (count === 0) {
					continue;
				}

				value = coerce !== undefined ? coerce(raw[0]) : raw[0];
			}

			/*#__INLINE__*/ set(input, key, value);
		}

		return safeParse(schema, input);
	};
};

const set = <K extends PropertyKey, V>(obj: Record<K, V>, key: NoInfer<K>, value: NoInfer<V>): void => {
	if (key === '__proto__') {
		Object.defineProperty(obj, key, { value });
	} else {
		obj[key] = value;
	}
};
