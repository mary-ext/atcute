import * as fs from 'node:fs/promises';

import * as t from '../lib/typedefs.json-schema.ts';

const result = buildJSONSchema(t.lexiconDoc, {
	$id: 'https://unpkg.com/@atcute/lexicon-doc/schema/lexicon-doc.schema.json',
	title: ``,
	description: ``,
	definitions: {
		LexArray: t.lexArray,
		LexBlob: t.lexBlob,
		LexBoolean: t.lexBoolean,
		LexBytes: t.lexBytes,
		LexCidLink: t.lexCidLink,
		LexInteger: t.lexInteger,
		LexIpldType: t.lexIpldType,
		LexObject: t.lexObject,
		LexPrimitive: t.lexPrimitive,
		LexPrimitiveArray: t.lexPrimitiveArray,
		LexRecord: t.lexRecord,
		LexRef: t.lexRef,
		LexRefUnion: t.lexRefUnion,
		LexRefVariant: t.lexRefVariant,
		LexString: t.lexString,
		LexStringFormat: t.lexStringFormat,
		LexToken: t.lexToken,
		LexUnknown: t.lexUnknown,
		LexUserType: t.lexUserType,
		LexXrpcBody: t.lexXrpcBody,
		LexXrpcError: t.lexXrpcError,
		LexXrpcParameters: t.lexXrpcParameters,
		LexXrpcProcedure: t.lexXrpcProcedure,
		LexXrpcQuery: t.lexXrpcQuery,
		LexXrpcSubscription: t.lexXrpcSubscription,
		LexXrpcSubscriptionMessage: t.lexXrpcSubscriptionMessage,
	},
});

await fs.mkdir(`schema/`, { recursive: true });
await fs.writeFile(`schema/lexicon-doc.schema.json`, JSON.stringify(result, null, 2) + '\n');

function buildJSONSchema(root, options) {
	const {
		$schema = 'https://json-schema.org/draft/2020-12/schema',
		$id,
		title,
		description,
		definitions = {},
	} = options;

	const references = new Map();
	for (const [name, schema] of Object.entries(definitions)) {
		references.set(schema, name);
	}

	const seen = new Set();

	function processSchema(schema, skipRef) {
		if (schema == null || typeof schema !== 'object') {
			return schema;
		}

		// Check if this is a reference to a named schema
		const ref = !skipRef ? references.get(schema) : undefined;
		if (ref) {
			return { $ref: `#/$defs/${ref}` };
		}

		// Avoid infinite recursion on circular references
		if (seen.has(schema)) {
			return schema;
		}
		seen.add(schema);

		if (Array.isArray(schema)) {
			const result = schema.map((item) => processSchema(item));
			seen.delete(schema);
			return result;
		}

		const result = {};
		for (const [key, value] of Object.entries(schema)) {
			// Skip symbols (like tschema's optional symbol)
			if (typeof key === 'symbol') {
				continue;
			}
			result[key] = processSchema(value, false);
		}

		seen.delete(schema);
		return result;
	}

	// Process root schema and all definitions
	const defs = {};
	for (const [name, schema] of Object.entries(definitions)) {
		seen.clear();
		defs[name] = processSchema(schema, true);
	}

	seen.clear();
	const processedRoot = processSchema(root, true);

	return {
		$schema,
		$id,
		title,
		description,
		...processedRoot,
		$defs: defs,
	};
}
