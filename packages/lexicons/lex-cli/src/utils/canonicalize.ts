import type {
	LexArray,
	LexBlob,
	LexDefinableField,
	LexInteger,
	LexObject,
	LexPrimitive,
	LexPrimitiveArray,
	LexString,
	LexUserType,
	LexXrpcBody,
	LexXrpcParameters,
	LexXrpcSubscriptionMessage,
	LexiconDoc,
} from '@atcute/lexicon-doc';

/**
 * reorders object keys into dag-cbor canonical order (shorter keys first, then lexicographic). valibot
 * rebuilds parsed objects in schema declaration order, so this restores a stable on-disk shape regardless of
 * how fields were declared in the source schema
 *
 * @param value any JSON-compatible value
 * @returns the value with all nested object keys reordered
 */
export const canonicalizeKeys = (value: unknown): unknown => {
	if (Array.isArray(value)) {
		return value.map(canonicalizeKeys);
	}
	if (value !== null && typeof value === 'object') {
		const entries = Object.entries(value).toSorted(([a], [b]) => a.length - b.length || (a < b ? -1 : 1));
		const result: Record<string, unknown> = {};
		for (const [key, v] of entries) {
			result[key] = canonicalizeKeys(v);
		}

		return result;
	}
	return value;
};

// arrays sorted here are set-like per the lexicon spec — their order carries
// no semantic weight — so sorting absorbs upstream churn from authors
// reshuffling entries. arrays whose order may carry meaning (errors,
// permissions) are left alone
const sortStrings = (xs: readonly string[]): string[] => xs.toSorted();
const sortIntegers = (xs: readonly number[]): number[] => xs.toSorted((a, b) => a - b);

const canonicalizeLexBlob = (field: LexBlob): LexBlob => {
	if (!field.accept) {
		return field;
	}
	return { ...field, accept: sortStrings(field.accept) };
};

const canonicalizeLexInteger = (field: LexInteger): LexInteger => {
	if (!field.enum) {
		return field;
	}
	return { ...field, enum: sortIntegers(field.enum) };
};

const canonicalizeLexString = (field: LexString): LexString => {
	const out = { ...field };
	if (field.enum) {
		out.enum = sortStrings(field.enum);
	}
	if (field.knownValues) {
		out.knownValues = sortStrings(field.knownValues);
	}
	return out;
};

const canonicalizePrimitive = (field: LexPrimitive): LexPrimitive => {
	switch (field.type) {
		case 'integer': {
			return canonicalizeLexInteger(field);
		}
		case 'string': {
			return canonicalizeLexString(field);
		}
		default: {
			return field;
		}
	}
};

const canonicalizeDefinableField = (field: LexDefinableField): LexDefinableField => {
	switch (field.type) {
		case 'array': {
			return canonicalizeLexArray(field);
		}
		case 'blob': {
			return canonicalizeLexBlob(field);
		}
		case 'integer': {
			return canonicalizeLexInteger(field);
		}
		case 'string': {
			return canonicalizeLexString(field);
		}
		case 'union': {
			return { ...field, refs: sortStrings(field.refs) };
		}
		default: {
			return field;
		}
	}
};

const canonicalizeLexArray = (field: LexArray): LexArray => {
	return { ...field, items: canonicalizeDefinableField(field.items) };
};

const canonicalizeLexObject = (obj: LexObject): LexObject => {
	const out = { ...obj };
	if (obj.required) {
		out.required = sortStrings(obj.required);
	}
	if (obj.nullable) {
		out.nullable = sortStrings(obj.nullable);
	}
	if (obj.properties) {
		const properties: Record<string, LexDefinableField> = {};
		for (const [key, field] of Object.entries(obj.properties)) {
			properties[key] = canonicalizeDefinableField(field);
		}
		out.properties = properties;
	}
	return out;
};

const canonicalizePrimitiveField = (
	field: LexPrimitive | LexPrimitiveArray,
): LexPrimitive | LexPrimitiveArray => {
	if (field.type === 'array') {
		return { ...field, items: canonicalizePrimitive(field.items) };
	}
	return canonicalizePrimitive(field);
};

const canonicalizeParameters = (params: LexXrpcParameters): LexXrpcParameters => {
	const out = { ...params };
	if (params.required) {
		out.required = sortStrings(params.required);
	}
	if (params.properties) {
		const properties: Record<string, LexPrimitive | LexPrimitiveArray> = {};
		for (const [key, field] of Object.entries(params.properties)) {
			properties[key] = canonicalizePrimitiveField(field);
		}
		out.properties = properties;
	}
	return out;
};

const canonicalizeXrpcBody = (body: LexXrpcBody): LexXrpcBody => {
	if (!body.schema) {
		return body;
	}
	const schema = body.schema;
	switch (schema.type) {
		case 'object': {
			return { ...body, schema: canonicalizeLexObject(schema) };
		}
		case 'union': {
			return { ...body, schema: { ...schema, refs: sortStrings(schema.refs) } };
		}
		case 'ref': {
			return body;
		}
	}
};

const canonicalizeSubscriptionMessage = (msg: LexXrpcSubscriptionMessage): LexXrpcSubscriptionMessage => {
	if (!msg.schema) {
		return msg;
	}
	return { ...msg, schema: { ...msg.schema, refs: sortStrings(msg.schema.refs) } };
};

const canonicalizeUserType = (def: LexUserType): LexUserType => {
	switch (def.type) {
		case 'array': {
			return canonicalizeLexArray(def);
		}
		case 'object': {
			return canonicalizeLexObject(def);
		}
		case 'procedure': {
			const out = { ...def };
			if (def.parameters) {
				out.parameters = canonicalizeParameters(def.parameters);
			}
			if (def.input) {
				out.input = canonicalizeXrpcBody(def.input);
			}
			if (def.output) {
				out.output = canonicalizeXrpcBody(def.output);
			}
			return out;
		}
		case 'query': {
			const out = { ...def };
			if (def.parameters) {
				out.parameters = canonicalizeParameters(def.parameters);
			}
			if (def.output) {
				out.output = canonicalizeXrpcBody(def.output);
			}
			return out;
		}
		case 'record': {
			return { ...def, record: canonicalizeLexObject(def.record) };
		}
		case 'subscription': {
			const out = { ...def };
			if (def.parameters) {
				out.parameters = canonicalizeParameters(def.parameters);
			}
			if (def.message) {
				out.message = canonicalizeSubscriptionMessage(def.message);
			}
			return out;
		}
		case 'blob': {
			return canonicalizeLexBlob(def);
		}
		case 'integer': {
			return canonicalizeLexInteger(def);
		}
		case 'string': {
			return canonicalizeLexString(def);
		}
		default: {
			return def;
		}
	}
};

/**
 * walks a lexicon document and sorts set-like arrays (per the lexicon spec) so the on-disk shape is stable
 * regardless of upstream authoring order
 *
 * @param doc a parsed lexicon document
 * @returns a new document with set-like arrays sorted
 */
export const canonicalizeArrays = (doc: LexiconDoc): LexiconDoc => {
	const defs: Record<string, LexUserType> = {};
	for (const [key, def] of Object.entries(doc.defs)) {
		defs[key] = canonicalizeUserType(def);
	}
	return { ...doc, defs };
};
