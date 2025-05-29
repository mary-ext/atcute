import { dirname as getDirname, relative as getRelativePath } from 'node:path/posix';

import * as prettier from 'prettier';

import type {
	LexArray,
	LexBlob,
	LexiconDoc,
	LexIpldType,
	LexObject,
	LexPrimitive,
	LexRecord,
	LexRefVariant,
	LexXrpcBody,
	LexXrpcParameters,
	LexXrpcProcedure,
	LexXrpcQuery,
	LexXrpcSubscription,
} from '@atcute/lexicon-doc';

export interface SourceFile {
	filename: string;
	code: string;
}

export interface ImportMapping {
	nsid: string[];
	imports: string | ((nsid: string) => { type: 'named' | 'namespace'; from: string });
}

export interface LexiconApiOptions {
	documents: LexiconDoc[];
	mappings: ImportMapping[];
	prettier?: {
		cwd?: string;
	};
}

export interface LexiconApiResult {
	files: SourceFile[];
}

type DocumentMap = Map<string, LexiconDoc>;
type ImportSet = Set<string>;

type Literal = string | number | boolean;

const lit: (val: Literal | Literal[]) => string = JSON.stringify;

const resolveExternalImport = (nsid: string, mappings: ImportMapping[]): ImportMapping | undefined => {
	return mappings.find((mapping) => {
		return mapping.nsid.some((pattern) => {
			if (pattern.endsWith('.*')) {
				return nsid.startsWith(pattern.slice(0, -1));
			}

			return nsid === pattern;
		});
	});
};

const PURE = `/*#__PURE__*/`;

export const generateLexiconApi = async (opts: LexiconApiOptions): Promise<LexiconApiResult> => {
	const documents = opts.documents.toSorted((a, b) => {
		if (a.id < b.id) {
			return -1;
		}
		if (a.id > b.id) {
			return 1;
		}

		return 0;
	});

	const map: DocumentMap = new Map(documents.map((doc) => [doc.id, doc]));
	const files: SourceFile[] = [];

	for (const doc of documents) {
		const filename = `types/${doc.id.replaceAll('.', '/')}.ts`;
		const file = {
			imports: '',
			rawschemas: '',
			schemadefs: '',
			schemas: '',
			interfaces: '',
			sinterfaces: '',
			exports: '',
			ambients: '',
		};

		file.imports += `import type {} from '@atcute/lexicons';\n`;
		file.imports += `import * as v from '@atcute/lexicons/validations';\n`;

		const imports = new Set<string>();

		const sortedDefIds = Object.keys(doc.defs).toSorted((a, b) => {
			if (a < b) {
				return -1;
			}
			if (a > b) {
				return 1;
			}

			return 0;
		});

		for (const defId of sortedDefIds) {
			const def = doc.defs[defId];
			const defUri = `${doc.id}#${defId}`;

			const camelcased = toCamelCase(defId);
			const varname = `${camelcased}Schema`;

			let result: string;
			switch (def.type) {
				case 'query': {
					result = generateXrpcQuery(imports, defUri, def);

					file.imports += `import type {} from '@atcute/lexicons/ambient';\n`;

					file.ambients += `declare module '@atcute/lexicons/ambient' {\n`;
					file.ambients += `  interface XRPCQueries {\n`;
					file.ambients += `    ${lit(stripMainHash(defUri))}: ${camelcased}Schema;\n`;
					file.ambients += `  }\n`;
					file.ambients += `}`;
					break;
				}
				case 'procedure': {
					result = generateXrpcProcedure(imports, defUri, def);

					file.imports += `import type {} from '@atcute/lexicons/ambient';\n`;

					file.ambients += `declare module '@atcute/lexicons/ambient' {\n`;
					file.ambients += `  interface XRPCProcedures {\n`;
					file.ambients += `    ${lit(stripMainHash(defUri))}: ${camelcased}Schema;\n`;
					file.ambients += `  }\n`;
					file.ambients += `}`;
					break;
				}
				case 'subscription': {
					result = generateXrpcSubscription(imports, defUri, def);

					file.imports += `import type {} from '@atcute/lexicons/ambient';\n`;

					file.ambients += `declare module '@atcute/lexicons/ambient' {\n`;
					file.ambients += `  interface XRPCSubscriptions {\n`;
					file.ambients += `    ${lit(stripMainHash(defUri))}: ${camelcased}Schema;\n`;
					file.ambients += `  }\n`;
					file.ambients += `}`;
					break;
				}
				case 'object': {
					result = generateObject(imports, defUri, def);
					break;
				}
				case 'record': {
					result = generateRecord(imports, defUri, def);

					file.imports += `import type {} from '@atcute/lexicons/ambient';\n`;

					file.ambients += `declare module '@atcute/lexicons/ambient' {\n`;
					file.ambients += `  interface Records {\n`;
					file.ambients += `    ${lit(stripMainHash(defUri))}: ${camelcased}Schema;\n`;
					file.ambients += `  }\n`;
					file.ambients += `}`;
					break;
				}
				case 'token': {
					result = `${PURE} v.literal(${lit(stripMainHash(defUri))})`;
					break;
				}
				default: {
					result = generateType(imports, defUri, def);
					break;
				}
			}

			file.rawschemas += `const _${varname} = ${result};\n`;

			file.schemadefs += `type ${camelcased}$schematype = typeof _${varname};\n`;

			file.schemas += `export interface ${camelcased}Schema extends ${camelcased}$schematype {}\n`;

			file.exports += `export const ${varname} = _${varname} as ${camelcased}Schema;\n`;

			switch (def.type) {
				case 'query': {
					if (def.parameters) {
						file.sinterfaces += `export interface $params extends v.InferInput<${camelcased}Schema['params']> {}\n`;
					} else {
						file.sinterfaces += `export interface $params {}\n`;
					}

					if (def.output?.schema) {
						if (def.output?.schema.type === 'object') {
							file.sinterfaces += `export interface $output extends v.InferXRPCBodyInput<${camelcased}Schema['output']> {}\n`;
						} else {
							file.sinterfaces += `export type $output = v.InferXRPCBodyInput<${camelcased}Schema['output']>;\n`;
						}
					} else if (def.output) {
						file.sinterfaces += `export type $output = v.InferXRPCBodyInput<${camelcased}Schema['output']>;\n`;
					}

					break;
				}
				case 'procedure': {
					if (def.parameters) {
						file.sinterfaces += `export interface $params extends v.InferInput<${camelcased}Schema['params']> {}\n`;
					} else {
						file.sinterfaces += `export interface $params {}\n`;
					}

					if (def.input?.schema) {
						if (def.input?.schema.type === 'object') {
							file.sinterfaces += `export interface $input extends v.InferXRPCBodyInput<${camelcased}Schema['input']> {}\n`;
						} else {
							file.sinterfaces += `export type $input = v.InferXRPCBodyInput<${camelcased}Schema['input']>;\n`;
						}
					} else if (def.input) {
						file.sinterfaces += `export type $input = v.InferXRPCBodyInput<${camelcased}Schema['input']>;\n`;
					}

					if (def.output?.schema) {
						if (def.output?.schema.type === 'object') {
							file.sinterfaces += `export interface $output extends v.InferXRPCBodyInput<${camelcased}Schema['output']> {}\n`;
						} else {
							file.sinterfaces += `export type $output = v.InferXRPCBodyInput<${camelcased}Schema['output']>;\n`;
						}
					} else if (def.output) {
						file.sinterfaces += `export type $output = v.InferXRPCBodyInput<${camelcased}Schema['output']>;\n`;
					}

					break;
				}
				case 'subscription': {
					if (def.parameters) {
						file.sinterfaces += `export interface $params extends v.InferInput<${camelcased}Schema['params']> {}\n`;
					} else {
						file.sinterfaces += `export interface $params {}\n`;
					}

					if (def.message?.schema) {
						if (def.message?.schema.type === 'object') {
							file.sinterfaces += `export interface $message extends v.InferInput<${camelcased}Schema['message']> {}\n`;
						} else {
							file.sinterfaces += `export type $message = v.InferInput<${camelcased}Schema['message']>;\n`;
						}
					}

					break;
				}

				case 'array':
				case 'object':
				case 'record':
				case 'unknown': {
					file.interfaces += `export interface ${toTitleCase(defId)} extends v.InferInput<typeof ${varname}> {}\n`;
					break;
				}
				case 'blob':
				case 'boolean':
				case 'bytes':
				case 'cid-link':
				case 'integer':
				case 'string':
				case 'token': {
					file.interfaces += `export type ${toTitleCase(defId)} = v.InferInput<typeof ${varname}>;\n`;
					break;
				}
			}
		}

		{
			const dirname = getDirname(filename);

			const sortedImports = [...imports].toSorted((a, b) => {
				if (a < b) {
					return -1;
				}
				if (a > b) {
					return 1;
				}

				return 0;
			});

			for (const ns of sortedImports) {
				const local = map.get(ns);

				if (local) {
					const target = `types/${ns.replaceAll('.', '/')}.js`;

					let relative = getRelativePath(dirname, target);
					if (!relative.startsWith('.')) {
						relative = `./${relative}`;
					}

					file.imports += `import * as ${toTitleCase(ns)} from ${lit(relative)};\n`;
					continue;
				}

				const external = resolveExternalImport(ns, opts.mappings);

				if (external) {
					if (typeof external.imports === 'function') {
						const res = external.imports(ns);

						if (res.type === 'named') {
							file.imports += `import { ${toTitleCase(ns)} } from ${lit(res.from)};\n`;
						} else if (res.type === 'namespace') {
							file.imports += `import * as ${toTitleCase(ns)} from ${lit(res.from)};\n`;
						}
					} else {
						file.imports += `import { ${toTitleCase(ns)} } from ${lit(external.imports)};\n`;
					}

					continue;
				}

				throw new Error(`'${doc.id}' referenced non-existent '${ns}' namespace`);
			}
		}

		files.push({
			filename: filename,
			code:
				file.imports +
				`\n\n` +
				file.rawschemas +
				`\n\n` +
				file.schemadefs +
				`\n\n` +
				file.schemas +
				`\n\n` +
				file.exports +
				`\n\n` +
				file.interfaces +
				`\n\n` +
				file.sinterfaces +
				`\n\n` +
				file.ambients,
		});
	}

	{
		let code = ``;

		for (const doc of map.values()) {
			code += `export * as ${toTitleCase(doc.id)} from ${lit(`./types/${doc.id.replaceAll('.', '/')}.js`)};\n`;
		}

		files.push({
			filename: 'index.ts',
			code: code,
		});
	}

	if (opts.prettier) {
		const config = await prettier.resolveConfig(opts.prettier.cwd ?? process.cwd(), { editorconfig: true });

		for (const file of files) {
			const formatted = await prettier.format(file.code, { ...config, parser: 'typescript' });
			file.code = formatted;
		}
	}

	return { files };
};

const generateXrpcQuery = (imports: ImportSet, defUri: string, spec: LexXrpcQuery): string => {
	const params = generateXrpcParameters(imports, defUri, spec.parameters);
	const output = generateXrpcBody(imports, defUri, spec.output);

	return `${PURE} v.query(${lit(stripMainHash(defUri))}, {\n"params": ${params}, "output": ${output} })`;
};

const generateXrpcProcedure = (imports: ImportSet, defUri: string, spec: LexXrpcProcedure): string => {
	const params = generateXrpcParameters(imports, defUri, spec.parameters);
	const input = generateXrpcBody(imports, defUri, spec.input);
	const output = generateXrpcBody(imports, defUri, spec.output);

	return `${PURE} v.procedure(${lit(stripMainHash(defUri))}, {\n"params": ${params}, "input": ${input}, "output": ${output} })`;
};

const generateXrpcSubscription = (imports: ImportSet, defUri: string, spec: LexXrpcSubscription): string => {
	const schema = spec.message?.schema;

	const params = generateXrpcParameters(imports, defUri, spec.parameters);

	let inner = ``;

	inner += `"params": ${params},`;

	if (schema) {
		if (schema.type === 'object') {
			const res = generateObject(imports, defUri, schema, 'none');

			inner += `"message": ${res},`;
		} else {
			const res = generateType(imports, defUri, schema);

			inner += `get "message" () { return ${res} },`;
		}
	} else {
		inner += `"message": null,`;
	}

	return `${PURE} v.subscription(${lit(stripMainHash(defUri))}, {\n${inner}})`;
};

const generateXrpcBody = (imports: ImportSet, defUri: string, spec: LexXrpcBody | undefined): string => {
	if (spec === undefined) {
		return `null`;
	}

	const schema = spec.schema;
	const encoding = spec.encoding;

	if (schema) {
		let inner = ``;

		inner += `"type": "lex",`;

		if (schema.type === 'object') {
			const res = generateObject(imports, defUri, schema, 'none');

			inner += `"schema": ${res},`;
		} else {
			const res = generateType(imports, defUri, schema);

			inner += `get "schema" () { return ${res} },`;
		}

		return `{\n${inner}}`;
	}

	if (encoding) {
		const types = encoding.split(',').map((type) => type.trim());

		let inner = ``;

		inner += `"type": "blob",`;

		if (types.length > 1 || types[0] !== '*/*') {
			inner += `"encoding": ${lit(types)},`;
		}

		return `{\n${inner}}`;
	}

	return `null`;
};

const generateXrpcParameters = (
	imports: ImportSet,
	defUri: string,
	spec: LexXrpcParameters | undefined,
): string => {
	if (spec === undefined) {
		return `null`;
	}

	const requiredProps = spec.required;
	const originalProperties = spec.properties;
	let transformedProperties: LexXrpcParameters['properties'] | undefined;

	if (originalProperties) {
		for (const [prop, propSpec] of Object.entries(originalProperties)) {
			if (propSpec.type === 'array') {
				if (!requiredProps?.includes(prop)) {
					continue;
				}

				if (transformedProperties === undefined) {
					transformedProperties = { ...originalProperties };
				}

				transformedProperties[prop] = {
					...propSpec,
					minLength: Math.max(propSpec.minLength ?? 0, 1),
				};
			}
		}
	}

	const mask: LexObject = {
		type: 'object',
		description: spec.description,
		required: spec.required,
		properties: transformedProperties ?? originalProperties,
	};

	return generateObject(imports, defUri, mask, 'none');
};

const generateRecord = (imports: ImportSet, defUri: string, spec: LexRecord): string => {
	const schema = generateObject(imports, defUri, spec.record, 'required');

	let key = `${PURE} v.string()`;
	if (spec.key) {
		if (spec.key === 'tid') {
			key = `${PURE} v.tidString()`;
		} else if (spec.key === 'nsid') {
			key = `${PURE} v.nsidString()`;
		} else if (spec.key.startsWith('literal:')) {
			key = `${PURE} v.literal(${lit(spec.key.slice('literal:'.length))})`;
		}
	}

	return `${PURE} v.record(${key}, ${schema})`;
};

const generateObject = (
	imports: ImportSet,
	defUri: string,
	spec: LexObject,
	writeType: 'required' | 'optional' | 'none' = 'optional',
): string => {
	const required = new Set(spec.required);
	const nullable = new Set(spec.nullable);

	let inner = ``;

	switch (writeType) {
		case 'optional': {
			inner += `"$type": ${PURE} v.optional(${PURE} v.literal(${lit(stripMainHash(defUri))})),`;
			break;
		}
		case 'required': {
			inner += `"$type": ${PURE} v.literal(${lit(stripMainHash(defUri))}),`;
			break;
		}
	}

	const sortedEntries = Object.entries(spec.properties ?? {}).toSorted(([keyA], [keyB]) => {
		if (keyA < keyB) {
			return -1;
		}
		if (keyA > keyB) {
			return 1;
		}

		return 0;
	});

	for (const [prop, propSpec] of sortedEntries) {
		const lazy = isRefVariant(propSpec.type === 'array' ? propSpec.items : propSpec);
		const optional = !required.has(prop) && !('default' in propSpec);
		const nulled = nullable.has(prop);

		let call = generateType(imports, defUri, propSpec, lazy);

		if (nulled) {
			call = `${PURE} v.nullable(${call})`;
		}

		if (optional) {
			call = `${PURE} v.optional(${call})`;
		}

		if (lazy) {
			inner += `get ${lit(prop)} () { return ${call} },`;
		} else {
			inner += `${lit(prop)}: ${call},`;
		}
	}

	return `${PURE} v.object({\n${inner}})`;
};

const generateType = (
	imports: ImportSet,
	defUri: string,
	spec: LexArray | LexPrimitive | LexIpldType | LexRefVariant | LexBlob,
	lazy = false,
): string => {
	switch (spec.type) {
		// LexRefVariant
		case 'ref': {
			const ref = spec.ref;

			if (ref.startsWith('#')) {
				const id = ref.slice(1);

				return `${toCamelCase(id)}Schema`;
			} else {
				const [ns, id = 'main'] = ref.split('#');
				if (ns === stripHash(defUri)) {
					return `${toCamelCase(id)}Schema`;
				}

				imports.add(ns);

				return `${toTitleCase(ns)}.${toCamelCase(id)}Schema`;
			}
		}
		case 'union': {
			const normalizedRefs = spec.refs
				.map((ref): string => {
					if (ref.startsWith('#')) {
						return ref;
					}

					const [ns, id = 'main'] = ref.split('#');
					if (ns === stripHash(defUri)) {
						return `#${id}`;
					}

					return `${ns}#${id}`;
				})
				.sort();

			const refs = normalizedRefs.map((ref): string => {
				if (ref.startsWith('#')) {
					const id = ref.slice(1);

					return `${toCamelCase(id)}Schema`;
				} else {
					const [ns, id = 'main'] = ref.split('#');
					imports.add(ns);

					return `${toTitleCase(ns)}.${toCamelCase(id)}Schema`;
				}
			});

			return `${PURE} v.variant([${refs.join(', ')}]${spec.closed ? `, true` : ``})`;
		}

		// LexArray
		case 'array': {
			let item = generateType(imports, defUri, spec.items);
			if (!lazy && (spec.items.type === 'ref' || spec.items.type === 'union')) {
				item = `(() => { return ${item}; })`;
			}

			let pipe: string[] = [];

			if ((spec.minLength ?? 0) > 0 || spec.maxLength !== undefined) {
				if (spec.maxLength === undefined) {
					pipe.push(`${PURE} v.arrayLength(${lit(spec.minLength ?? 0)})`);
				} else {
					pipe.push(`${PURE} v.arrayLength(${lit(spec.minLength ?? 0)}, ${lit(spec.maxLength)})`);
				}
			}

			let call = `${PURE} v.array(${item})`;

			if (pipe.length !== 0) {
				call = `${PURE} v.constrain(${call}, [ ${pipe.join(', ')} ])`;
			}

			return call;
		}

		// LexPrimitive
		case 'boolean': {
			if (spec.const !== undefined) {
				return `${PURE} v.literal(${spec.const})`;
			}

			let call = `${PURE} v.boolean()`;

			if (spec.default !== undefined) {
				call = `${PURE} v.optional(${call}, ${lit(spec.default)})`;
			}

			return call;
		}
		case 'integer': {
			if (spec.const !== undefined) {
				return `${PURE} v.literal(${lit(spec.const)})`;
			}

			if (spec.enum !== undefined) {
				return `${PURE} v.literalEnum(${lit(spec.enum.toSorted())})`;
			}

			let pipe: string[] = [];

			if ((spec.minimum ?? 0) > 0 || spec.maximum !== undefined) {
				if (spec.maximum === undefined) {
					pipe.push(`${PURE} v.integerRange(${lit(spec.minimum ?? 0)})`);
				} else {
					pipe.push(`${PURE} v.integerRange(${lit(spec.minimum ?? 0)}, ${lit(spec.maximum)})`);
				}
			}

			let call = `${PURE} v.integer()`;

			if (pipe.length !== 0) {
				call = `${PURE} v.constrain(${call}, [ ${pipe.join(', ')} ])`;
			}

			if (spec.default !== undefined) {
				call = `${PURE} v.optional(${call}, ${lit(spec.default)})`;
			}

			return call;
		}
		case 'string': {
			if (spec.const !== undefined) {
				return `${PURE} v.literal(${lit(spec.const)})`;
			}

			if (spec.enum !== undefined) {
				return `${PURE} v.literalEnum(${lit(spec.enum.toSorted())})`;
			}

			let pipe: string[] = [];

			if ((spec.minLength ?? 0) > 0 || spec.maxLength !== undefined) {
				if (spec.maxLength === undefined) {
					pipe.push(`${PURE} v.stringLength(${lit(spec.minLength ?? 0)})`);
				} else {
					pipe.push(`${PURE} v.stringLength(${lit(spec.minLength ?? 0)}, ${lit(spec.maxLength)})`);
				}
			}

			if ((spec.minGraphemes ?? 0) > 0 || spec.maxGraphemes !== undefined) {
				if (spec.maxGraphemes === undefined) {
					pipe.push(`${PURE} v.stringGraphemes(${lit(spec.minGraphemes ?? 0)})`);
				} else {
					pipe.push(`${PURE} v.stringGraphemes(${lit(spec.minGraphemes ?? 0)}, ${lit(spec.maxGraphemes)})`);
				}
			}

			let call = `${PURE} v.string()`;

			if (spec.knownValues?.length) {
				call = `${PURE} v.string<${spec.knownValues.toSorted().map(lit).join(' | ')} | (string & {})>()`;
			}

			switch (spec.format) {
				case 'at-identifier': {
					call = `${PURE} v.actorIdentifierString()`;
					break;
				}
				case 'at-uri': {
					call = `${PURE} v.resourceUriString()`;
					break;
				}
				case 'cid': {
					call = `${PURE} v.cidString()`;
					break;
				}
				case 'datetime': {
					call = `${PURE} v.datetimeString()`;
					break;
				}
				case 'did': {
					call = `${PURE} v.didString()`;
					break;
				}
				case 'handle': {
					call = `${PURE} v.handleString()`;
					break;
				}
				case 'language': {
					call = `${PURE} v.languageCodeString()`;
					break;
				}
				case 'nsid': {
					call = `${PURE} v.nsidString()`;
					break;
				}
				case 'record-key': {
					call = `${PURE} v.recordKeyString()`;
					break;
				}
				case 'tid': {
					call = `${PURE} v.tidString()`;
					break;
				}
				case 'uri': {
					call = `${PURE} v.genericUriString()`;
					break;
				}
			}

			if (pipe.length !== 0) {
				call = `${PURE} v.constrain(${call}, [ ${pipe.join(', ')} ])`;
			}

			if (spec.default !== undefined) {
				call = `${PURE} v.optional(${call}, ${lit(spec.default)})`;
			}

			return call;
		}
		case 'unknown': {
			return `${PURE} v.unknown()`;
		}

		// LexBlob
		case 'blob': {
			return `${PURE} v.blob()`;
		}

		// LexIpldType
		case 'bytes': {
			let pipe: string[] = [];

			if ((spec.minLength ?? 0) > 0 || spec.maxLength !== undefined) {
				if (spec.maxLength === undefined) {
					pipe.push(`${PURE} v.bytesSize(${lit(spec.minLength ?? 0)})`);
				} else {
					pipe.push(`${PURE} v.bytesSize(${lit(spec.minLength ?? 0)}, ${lit(spec.maxLength)})`);
				}
			}

			let call = `${PURE} v.bytes()`;

			if (pipe.length !== 0) {
				call = `${PURE} v.constrain(${call}, [ ${pipe.join(', ')} ])`;
			}

			return call;
		}
		case 'cid-link': {
			return `${PURE} v.cidLink()`;
		}
	}
};

const isRefVariant = (
	spec: LexArray | LexPrimitive | LexIpldType | LexRefVariant | LexBlob,
): spec is LexRefVariant => {
	const type = spec.type;
	return type === 'ref' || type === 'union';
};

const stripHash = (defUri: string): string => {
	const index = defUri.indexOf('#');
	if (index === -1) {
		return defUri;
	}

	return defUri.slice(0, index);
};

const stripMainHash = (defUri: string): string => {
	return defUri.endsWith('#main') ? defUri.slice(0, -'#main'.length) : defUri;
};

const toTitleCase = (v: string): string => {
	v = v.replace(/^([a-z])/gi, (_, g) => g.toUpperCase());
	v = v.replace(/[.#-]([a-z])/gi, (_, g) => g.toUpperCase());
	return v.replace(/[.-]/g, '');
};

const toCamelCase = (v: string): string => {
	v = v.replace(/^([A-Z])/gi, (_, g) => g.toLowerCase());
	v = v.replace(/[.#-]([a-z])/gi, (_, g) => g.toUpperCase());
	return v.replace(/[.-]/g, '');
};
