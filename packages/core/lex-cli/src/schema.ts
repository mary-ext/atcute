import * as v from '@badrap/valita';

const integerType = v
	.number()
	.assert((v) => Number.isInteger(v) && v >= 0, 'Number is expected to be a positive integer');

export const booleanSchema = v.object({
	type: v.literal('boolean'),
	description: v.string().optional(),
	default: v.boolean().optional(),
	const: v.boolean().optional(),
});

export type BooleanSchema = v.Infer<typeof booleanSchema>;

export const integerSchema = v.object({
	type: v.literal('integer'),
	description: v.string().optional(),
	default: integerType.optional(),
	const: integerType.optional(),
	enum: v.array(v.number()).optional(),
	maximum: integerType.optional(),
	minimum: integerType.optional(),
});

export type IntegerSchema = v.Infer<typeof integerSchema>;

export const stringSchema = v.object({
	type: v.literal('string'),
	description: v.string().optional(),
	format: v
		.union(
			v.literal('at-identifier'),
			v.literal('at-uri'),
			v.literal('cid'),
			v.literal('datetime'),
			v.literal('did'),
			v.literal('handle'),
			v.literal('language'),
			v.literal('nsid'),
			v.literal('record-key'),
			v.literal('tid'),
			v.literal('uri'),
		)
		.optional(),
	default: v.string().optional(),
	const: v.string().optional(),
	enum: v.array(v.string()).optional(),
	knownValues: v.array(v.string()).optional(),
	maxLength: integerType.optional(),
	minLength: integerType.optional(),
	maxGraphemes: integerType.optional(),
	minGraphemes: integerType.optional(),
});

export type StringSchema = v.Infer<typeof stringSchema>;

export const unknownSchema = v.object({
	type: v.literal('unknown'),
	description: v.string().optional(),
});

export type UnknownSchema = v.Infer<typeof unknownSchema>;

export const primitiveSchema = v.union(booleanSchema, integerSchema, stringSchema, unknownSchema);

export type PrimitiveSchema = v.Infer<typeof primitiveSchema>;

export const bytesSchema = v.object({
	type: v.literal('bytes'),
	description: v.string().optional(),
	maxLength: integerType.optional(),
	minLength: integerType.optional(),
});

export type BytesSchema = v.Infer<typeof bytesSchema>;

export const cidLinkSchema = v.object({
	type: v.literal('cid-link'),
	description: v.string().optional(),
});

export type CidLinkSchema = v.Infer<typeof cidLinkSchema>;

export const ipldTypeSchema = v.union(bytesSchema, cidLinkSchema);

export type IpldTypeSchema = v.Infer<typeof ipldTypeSchema>;

export const refSchema = v.object({
	type: v.literal('ref'),
	description: v.string().optional(),
	ref: v.string(),
});

export type RefSchema = v.Infer<typeof refSchema>;

export const refUnionSchema = v
	.object({
		type: v.literal('union'),
		description: v.string().optional(),
		refs: v.array(v.string()),
		closed: v.boolean().default(false),
	})
	.assert((v) => !v.closed || v.refs.length > 0, `A closed union can't have empty refs list`);

export type RefUnionSchema = v.Infer<typeof refUnionSchema>;

export const refVariantSchema = v.union(refSchema, refUnionSchema);

export type RefVariantSchema = v.Infer<typeof refVariantSchema>;

export const blobSchema = v.object({
	type: v.literal('blob'),
	description: v.string().optional(),
	accept: v.array(v.string()).optional(),
	maxSize: integerType.optional(),
});

export type BlobSchema = v.Infer<typeof blobSchema>;

export const arraySchema = v.object({
	type: v.literal('array'),
	description: v.string().optional(),
	items: v.union(primitiveSchema, ipldTypeSchema, blobSchema, blobSchema, refVariantSchema),
	maxLength: integerType.optional(),
	minLength: integerType.optional(),
});

export type ArraySchema = v.Infer<typeof arraySchema>;

export const primitiveArraySchema = arraySchema.extend({
	items: primitiveSchema,
});

export type PrimitiveArraySchema = v.Infer<typeof primitiveArraySchema>;

export const tokenSchema = v.object({
	type: v.literal('token'),
	description: v.string().optional(),
});

export type TokenSchema = v.Infer<typeof tokenSchema>;

const refineRequiredProperties = <T extends { required: string[]; properties: Record<string, unknown> }>(
	obj: T,
): v.ValitaResult<T> => {
	for (const field of obj.required) {
		if (obj.properties[field] === undefined) {
			return v.err(`Required field "${field}" not defined`);
		}
	}

	return v.ok(obj);
};

export const objectSchema = v
	.object({
		type: v.literal('object'),
		description: v.string().optional(),
		required: v.array(v.string()).default<string[]>([]),
		nullable: v.array(v.string()).default<string[]>([]),
		properties: v.record(v.union(refVariantSchema, ipldTypeSchema, arraySchema, blobSchema, primitiveSchema)),
	})
	.chain(refineRequiredProperties);

export type ObjectSchema = v.Infer<typeof objectSchema>;

export const xrpcParametersSchema = v
	.object({
		type: v.literal('params'),
		description: v.string().optional(),
		required: v.array(v.string()).default<string[]>([]),
		properties: v.record(v.union(primitiveSchema, primitiveArraySchema)),
	})
	.chain(refineRequiredProperties);

export type XrpcParametersSchema = v.Infer<typeof xrpcParametersSchema>;

export const xrpcBodySchema = v.object({
	description: v.string().optional(),
	encoding: v.string(),
	schema: v.union(refVariantSchema, objectSchema).optional(),
});

export type XrpcBodySchema = v.Infer<typeof xrpcBodySchema>;

export const xrpcSubscriptionMessageSchema = v.object({
	description: v.string().optional(),
	schema: v.union(refVariantSchema, objectSchema).optional(),
});

export type XrpcSubscriptionMessageSchema = v.Infer<typeof xrpcSubscriptionMessageSchema>;

export const xrpcErrorSchema = v.object({
	name: v.string(),
	description: v.string().optional(),
});

export type XrpcErrorSchema = v.Infer<typeof xrpcErrorSchema>;

export const xrpcQuerySchema = v.object({
	type: v.literal('query'),
	description: v.string().optional(),
	parameters: xrpcParametersSchema.optional(),
	output: xrpcBodySchema.optional(),
	errors: v.array(xrpcErrorSchema).optional(),
});

export type XrpcQuerySchema = v.Infer<typeof xrpcQuerySchema>;

export const xrpcProcedureSchema = v.object({
	type: v.literal('procedure'),
	description: v.string().optional(),
	parameters: xrpcParametersSchema.optional(),
	input: xrpcBodySchema.optional(),
	output: xrpcBodySchema.optional(),
	errors: v.array(xrpcErrorSchema).optional(),
});

export type XrpcProcedureSchema = v.Infer<typeof xrpcProcedureSchema>;

export const xrpcSubscriptionSchema = v.object({
	type: v.literal('subscription'),
	description: v.string().optional(),
	parameters: xrpcParametersSchema.optional(),
	message: xrpcSubscriptionMessageSchema.optional(),
	errors: v.array(xrpcErrorSchema).optional(),
});

export type XrpcSubscriptionSchema = v.Infer<typeof xrpcSubscriptionSchema>;

export const recordSchema = v.object({
	type: v.literal('record'),
	description: v.string().optional(),
	key: v.string().optional(),
	record: objectSchema,
});

export type RecordSchema = v.Infer<typeof objectSchema>;

export const userTypeSchema = v.union(
	recordSchema,
	xrpcQuerySchema,
	xrpcProcedureSchema,
	xrpcSubscriptionSchema,
	blobSchema,
	arraySchema,
	tokenSchema,
	objectSchema,
	booleanSchema,
	integerSchema,
	stringSchema,
	bytesSchema,
	cidLinkSchema,
	unknownSchema,
);

export type UserTypeSchema = v.Infer<typeof userTypeSchema>;

const NSID_RE =
	/^[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(\.[a-zA-Z]([a-zA-Z]{0,61}[a-zA-Z])?)$/;
const nsidType = v.string().assert((v) => NSID_RE.test(v), `string doesn't match nsid format`);

export const documentSchema = v
	.object({
		lexicon: v.literal(1),
		id: nsidType,
		revision: v.number().optional(),
		description: v.string().optional(),
		defs: v.record(userTypeSchema),
	})
	.chain((doc) => {
		const defs = doc.defs;

		for (const id in defs) {
			const def = defs[id];
			const type = def.type;

			if (
				id !== 'main' &&
				(type === 'record' || type === 'query' || type === 'procedure' || type === 'subscription')
			) {
				return v.err({ message: `${type} must be the \`main\` definition`, path: ['defs', id] });
			}
		}

		return v.ok(doc);
	});

export type DocumentSchema = v.Infer<typeof documentSchema>;
