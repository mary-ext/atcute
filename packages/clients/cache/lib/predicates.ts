import type {
	ArraySchema,
	BaseSchema,
	LiteralSchema,
	NullableSchema,
	ObjectSchema,
	OptionalSchema,
	VariantSchema,
} from '@atcute/lexicons/validations';

/** check if schema is an object schema */
export const isObjectSchema = (schema: BaseSchema): schema is ObjectSchema => {
	return schema.type === 'object';
};

/** check if schema is an array schema */
export const isArraySchema = (schema: BaseSchema): schema is ArraySchema => {
	return schema.type === 'array';
};

/** check if schema is a variant schema */
export const isVariantSchema = (schema: BaseSchema): schema is VariantSchema => {
	return schema.type === 'variant';
};

/** check if schema is an optional schema */
export const isOptionalSchema = (schema: BaseSchema): schema is OptionalSchema => {
	return schema.type === 'optional';
};

/** check if schema is a nullable schema */
export const isNullableSchema = (schema: BaseSchema): schema is NullableSchema => {
	return schema.type === 'nullable';
};

/** check if schema is a literal schema */
export const isLiteralSchema = (schema: BaseSchema): schema is LiteralSchema => {
	return schema.type === 'literal';
};
