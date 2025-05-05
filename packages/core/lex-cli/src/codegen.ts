import { dirname as getDirname, relative as getRelativePath } from 'node:path/posix';

import * as prettier from 'prettier';
import type { Literal } from 'valibot';

import type {
	LexArray,
	LexBlob,
	LexiconDoc,
	LexIpldType,
	LexObject,
	LexPrimitive,
	LexRecord,
	LexRefVariant,
	LexUserType,
	LexXrpcBody,
	LexXrpcParameters,
	LexXrpcProcedure,
	LexXrpcQuery,
	LexXrpcSubscription,
} from './schema.js';

interface RawSourceFile {
	body: string;
	prologue: string;
	epilogue: string;
}

export interface SourceFile {
	filename: string;
	code: string;
}

export interface ImportMapping {
	nsid: string[];
	imports: string;
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

const INTERFACE_INFER: LexUserType['type'][] = [
	'array',
	'blob',
	'bytes',
	'cid-link',
	'object',
	'record',
	'unknown',
];
const TYPE_INFER: LexUserType['type'][] = ['boolean', 'integer', 'string', 'token'];

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
		const file: RawSourceFile = {
			body: '',
			prologue: '',
			epilogue: '',
		};

		file.prologue += `import type {} from '@atcute/lexicons';\n`;
		file.prologue += `import * as v from '@atcute/lexicons/validations';\n`;

		const imports = new Set<string>();

		for (const defId in doc.defs) {
			const def = doc.defs[defId];
			const defUri = `${doc.id}#${defId}`;

			const varName = `${toCamelCase(defId)}Schema`;

			let result: string;
			switch (def.type) {
				case 'query': {
					result = generateXrpcQuery(imports, defUri, def);

					file.prologue += `import type {} from '@atcute/lexicons/ambient';\n`;

					file.epilogue += `declare module '@atcute/lexicons/ambient' {\n`;
					file.epilogue += `  interface XRPCQueries {\n`;
					file.epilogue += `    ${lit(stripMainHash(defUri))}: ${varName}.$schema;\n`;
					file.epilogue += `  }\n`;
					file.epilogue += `}`;
					break;
				}
				case 'procedure': {
					result = generateXrpcProcedure(imports, defUri, def);

					file.prologue += `import type {} from '@atcute/lexicons/ambient';\n`;

					file.epilogue += `declare module '@atcute/lexicons/ambient' {\n`;
					file.epilogue += `  interface XRPCProcedures {\n`;
					file.epilogue += `    ${lit(stripMainHash(defUri))}: ${varName}.$schema;\n`;
					file.epilogue += `  }\n`;
					file.epilogue += `}`;
					break;
				}
				case 'subscription': {
					result = generateXrpcSubscription(imports, defUri, def);

					file.prologue += `import type {} from '@atcute/lexicons/ambient';\n`;

					file.epilogue += `declare module '@atcute/lexicons/ambient' {\n`;
					file.epilogue += `  interface XRPCSubscriptions {\n`;
					file.epilogue += `    ${lit(stripMainHash(defUri))}: ${varName}.$schema;\n`;
					file.epilogue += `  }\n`;
					file.epilogue += `}`;
					break;
				}
				case 'object': {
					result = generateObject(imports, defUri, def);
					break;
				}
				case 'record': {
					result = generateRecord(imports, defUri, def);

					file.prologue += `import type {} from '@atcute/lexicons/ambient';\n`;

					file.epilogue += `declare module '@atcute/lexicons/ambient' {\n`;
					file.epilogue += `  interface Records {\n`;
					file.epilogue += `    ${lit(stripMainHash(defUri))}: ${varName}.$schema;\n`;
					file.epilogue += `  }\n`;
					file.epilogue += `}`;
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

			file.body += `const _${varName} = ${result};\n`;
			file.body += `export const ${varName} = _${varName} as ${varName}.$schema;\n`;

			if (INTERFACE_INFER.includes(def.type)) {
				file.body += `export interface ${toTitleCase(defId)} extends v.InferInput<typeof ${varName}> {}\n`;
			} else if (TYPE_INFER.includes(def.type)) {
				file.body += `export type ${toTitleCase(defId)} = v.InferInput<typeof ${varName}>;\n`;
			}

			file.body += `export declare namespace ${varName} {\n`;
			file.body += `  export {};\n`;
			file.body += `  type $schematype = typeof _${varName};\n`;
			file.body += `  export interface $schema extends $schematype {}\n`;
			file.body += `}\n\n`;
		}

		{
			const dirname = getDirname(filename);

			for (const ns of imports) {
				const local = map.get(ns);

				if (local) {
					const target = `types/${ns.replaceAll('.', '/')}.js`;

					let relative = getRelativePath(dirname, target);
					if (!relative.startsWith('.')) {
						relative = `./${relative}`;
					}

					file.prologue += `import * as ${toTitleCase(ns)} from ${lit(relative)};\n`;
					continue;
				}

				const external = resolveExternalImport(ns, opts.mappings);

				if (external) {
					file.prologue += `import { ${toTitleCase(ns)} } from ${lit(external.imports)};\n`;
					continue;
				}

				throw new Error(`'${doc.id}' referenced non-existent '${ns}' namespace`);
			}
		}

		files.push({
			filename: filename,
			code: `${file.prologue}\n\n${file.body}\n\n${file.epilogue}`,
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

	return `${PURE} v.xrpcQuery(${lit(stripMainHash(defUri))}, {\n"params": ${params}, "output": ${output} })`;
};

const generateXrpcProcedure = (imports: ImportSet, defUri: string, spec: LexXrpcProcedure): string => {
	const params = generateXrpcParameters(imports, defUri, spec.parameters);
	const input = generateXrpcBody(imports, defUri, spec.input);
	const output = generateXrpcBody(imports, defUri, spec.output);

	return `${PURE} v.xrpcProcedure(${lit(stripMainHash(defUri))}, {\n"params": ${params}, "input": ${input}, "output": ${output} })`;
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

	return `${PURE} v.xrpcSubscription(${lit(stripMainHash(defUri))}, {\n${inner}})`;
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
		return `{\n"type": "blob" }`;
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

	const mask: LexObject = {
		type: 'object',
		description: spec.description,
		required: spec.required,
		properties: spec.properties,
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

	for (const [prop, propSpec] of Object.entries(spec.properties ?? {})) {
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
			const refs = spec.refs.map((ref): string => {
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

			if (spec.minLength !== undefined || spec.maxLength !== undefined) {
				if (spec.maxLength === undefined) {
					pipe.push(`${PURE} v.arrayLength(${lit(spec.minLength ?? 0)})`);
				} else {
					pipe.push(`${PURE} v.arrayLength(${lit(spec.minLength ?? 0)}, ${lit(spec.maxLength)})`);
				}
			}

			if (pipe.length === 0) {
				return `${PURE} v.array(${item})`;
			} else {
				return `${PURE} v.pipe(v.array(${item}), ${pipe.join(', ')})`;
			}
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
				return `${PURE} v.literalUnion(${lit(spec.enum)})`;
			}

			let pipe: string[] = [];

			if (spec.minimum !== undefined || spec.maximum !== undefined) {
				if (spec.maximum === undefined) {
					pipe.push(`${PURE} v.integerRange(${lit(spec.minimum ?? 0)})`);
				} else {
					pipe.push(`${PURE} v.integerRange(${lit(spec.minimum ?? 0)}, ${lit(spec.maximum)})`);
				}
			}

			let call = `${PURE} v.integer()`;

			if (pipe.length !== 0) {
				call = `${PURE} v.pipe(${call}, ${pipe.join(', ')})`;
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
				return `${PURE} v.literalUnion(${lit(spec.enum)})`;
			}

			let pipe: string[] = [];

			if (spec.minLength !== undefined || spec.maxLength !== undefined) {
				if (spec.maxLength === undefined) {
					pipe.push(`${PURE} v.stringLength(${lit(spec.minLength ?? 0)})`);
				} else {
					pipe.push(`${PURE} v.stringLength(${lit(spec.minLength ?? 0)}, ${lit(spec.maxLength)})`);
				}
			}

			if (spec.minGraphemes !== undefined || spec.maxGraphemes !== undefined) {
				if (spec.maxGraphemes === undefined) {
					pipe.push(`${PURE} v.stringGraphemes(${lit(spec.minGraphemes ?? 0)})`);
				} else {
					pipe.push(`${PURE} v.stringGraphemes(${lit(spec.minGraphemes ?? 0)}, ${lit(spec.maxGraphemes)})`);
				}
			}

			let call = `${PURE} v.string()`;
			switch (spec.format) {
				case 'at-identifier': {
					call = `${PURE} v.actorIdentifierString()`;
					break;
				}
				case 'at-uri': {
					call = `${PURE} v.resourceUriString()`;
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
				call = `${PURE} v.pipe(${call}, ${pipe.join(', ')})`;
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

			if (spec.minLength !== undefined || spec.maxLength !== undefined) {
				if (spec.maxLength === undefined) {
					pipe.push(`${PURE} v.bytesSize(${lit(spec.minLength ?? 0)})`);
				} else {
					pipe.push(`${PURE} v.bytesSize(${lit(spec.minLength ?? 0)}, ${lit(spec.maxLength)})`);
				}
			}

			let call = `${PURE} v.bytes()`;

			if (pipe.length !== 0) {
				call = `${PURE} v.pipe(${call}, ${pipe.join(', ')})`;
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
