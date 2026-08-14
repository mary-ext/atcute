import { dirname as getDirname, relative as getRelativePath } from 'node:path/posix';

import {
	type LexDefinableField,
	type LexObject,
	type LexRecord,
	type LexRefVariant,
	type LexUnknown,
	type LexUserType,
	type LexXrpcBody,
	type LexXrpcParameters,
	type LexXrpcProcedure,
	type LexXrpcQuery,
	type LexXrpcSubscription,
	type LexiconDoc,
	type ParsedLexiconRef,
	formatLexiconRef,
	parseLexiconRef,
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
	modules: {
		importSuffix: string;
	};
}

type DocumentMap = Map<string, LexiconDoc>;
type ImportSet = Set<string>;

type Literal = string | number | boolean;

const lit: (val: Literal | Literal[]) => string = JSON.stringify;

const resolvePath = (from: ParsedLexiconRef, ref: string): ParsedLexiconRef => {
	return parseLexiconRef(ref, from.nsid);
};

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

const simplifyAccept = (accept: string[] | undefined): string[] | undefined => {
	if (accept === undefined || accept.length === 0 || accept.includes('*/*')) {
		return undefined;
	}

	const wildcards = new Set<string>();
	for (const mime of accept) {
		if (mime.endsWith('/*')) {
			wildcards.add(mime.slice(0, mime.indexOf('/')));
		}
	}

	if (wildcards.size === 0) {
		return accept;
	}

	const simplified = accept.filter((mime) => {
		if (mime.endsWith('/*')) {
			return true;
		}
		return !wildcards.has(mime.slice(0, mime.indexOf('/')));
	});

	return simplified.length > 0 ? simplified : undefined;
};

export function* generateLexiconApi(opts: LexiconApiOptions): Generator<SourceFile> {
	const importExt = opts.modules?.importSuffix;

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
	const generatedIds = new Set<string>();

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
			const path: ParsedLexiconRef = { nsid: doc.id, defId };

			const camelcased = toCamelCase(defId);
			const varname = `${camelcased}Schema`;

			let result: string;
			switch (def.type) {
				case 'query': {
					result = generateXrpcQuery(imports, path, def);

					file.imports += `import type {} from '@atcute/lexicons/ambient';\n`;

					file.ambients += `declare module '@atcute/lexicons/ambient' {\n`;
					file.ambients += `  interface XRPCQueries {\n`;
					file.ambients += `    ${lit(formatLexiconRef(path))}: ${camelcased}Schema;\n`;
					file.ambients += `  }\n`;
					file.ambients += `}`;
					break;
				}
				case 'procedure': {
					result = generateXrpcProcedure(imports, path, def);

					file.imports += `import type {} from '@atcute/lexicons/ambient';\n`;

					file.ambients += `declare module '@atcute/lexicons/ambient' {\n`;
					file.ambients += `  interface XRPCProcedures {\n`;
					file.ambients += `    ${lit(formatLexiconRef(path))}: ${camelcased}Schema;\n`;
					file.ambients += `  }\n`;
					file.ambients += `}`;
					break;
				}
				case 'subscription': {
					result = generateXrpcSubscription(imports, path, def);

					file.imports += `import type {} from '@atcute/lexicons/ambient';\n`;

					file.ambients += `declare module '@atcute/lexicons/ambient' {\n`;
					file.ambients += `  interface XRPCSubscriptions {\n`;
					file.ambients += `    ${lit(formatLexiconRef(path))}: ${camelcased}Schema;\n`;
					file.ambients += `  }\n`;
					file.ambients += `}`;
					break;
				}
				case 'object': {
					result = generateObject(imports, path, def);
					break;
				}
				case 'record': {
					result = generateRecord(imports, path, def);

					file.imports += `import type {} from '@atcute/lexicons/ambient';\n`;

					file.ambients += `declare module '@atcute/lexicons/ambient' {\n`;
					file.ambients += `  interface Records {\n`;
					file.ambients += `    ${lit(formatLexiconRef(path))}: ${camelcased}Schema;\n`;
					file.ambients += `  }\n`;
					file.ambients += `}`;
					break;
				}
				case 'token': {
					result = `${PURE} v.literal(${lit(formatLexiconRef(path))})`;
					break;
				}
				case 'permission-set': {
					// skip permission sets
					continue;
				}
				default: {
					result = generateType(imports, path, def);
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
						file.sinterfaces += `export type $message = v.InferInput<${camelcased}Schema['message']>;\n`;
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
					const target = `types/${ns.replaceAll('.', '/')}${importExt}`;

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

		// skip files that only have imports and no actual content
		if (file.exports) {
			generatedIds.add(doc.id);

			yield {
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
			};
		}
	}

	{
		let code = ``;

		for (const doc of map.values()) {
			if (!generatedIds.has(doc.id)) {
				continue;
			}

			code += `export * as ${toTitleCase(doc.id)} from ${lit(`./types/${doc.id.replaceAll('.', '/')}${importExt}`)};\n`;
		}

		yield {
			filename: 'index.ts',
			code: code,
		};
	}
}

const generateXrpcQuery = (imports: ImportSet, path: ParsedLexiconRef, spec: LexXrpcQuery): string => {
	const params = generateXrpcParameters(imports, path, spec.parameters);
	const output = generateXrpcBody(imports, path, spec.output);

	return `${PURE} v.query(${lit(formatLexiconRef(path))}, {\n"params": ${params}, "output": ${output} })`;
};

const generateXrpcProcedure = (
	imports: ImportSet,
	path: ParsedLexiconRef,
	spec: LexXrpcProcedure,
): string => {
	const params = generateXrpcParameters(imports, path, spec.parameters);
	const input = generateXrpcBody(imports, path, spec.input);
	const output = generateXrpcBody(imports, path, spec.output);

	return `${PURE} v.procedure(${lit(formatLexiconRef(path))}, {\n"params": ${params}, "input": ${input}, "output": ${output} })`;
};

const generateXrpcSubscription = (
	imports: ImportSet,
	path: ParsedLexiconRef,
	spec: LexXrpcSubscription,
): string => {
	const schema = spec.message?.schema;
	const subprotocol = spec.subprotocol;

	const params = generateXrpcParameters(imports, path, spec.parameters);

	let inner = ``;

	inner += `"params": ${params},`;

	if (schema) {
		const res = generateType(imports, path, schema);

		inner += `get "message" () { return ${res} },`;
	} else {
		inner += `"message": null,`;
	}

	if (subprotocol !== undefined) {
		inner += `"subprotocol": ${lit(subprotocol)},`;
	}

	return `${PURE} v.subscription(${lit(formatLexiconRef(path))}, {\n${inner}})`;
};

const generateXrpcBody = (
	imports: ImportSet,
	path: ParsedLexiconRef,
	spec: LexXrpcBody | undefined,
): string => {
	if (spec === undefined) {
		return `null`;
	}

	const schema = spec.schema;
	const encoding = spec.encoding;

	if (schema) {
		let inner = ``;

		inner += `"type": "lex",`;

		if (schema.type === 'object') {
			const res = generateObject(imports, path, schema, 'none');

			inner += `"schema": ${res},`;
		} else {
			const res = generateType(imports, path, schema);

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
	path: ParsedLexiconRef,
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

	return generateObject(imports, path, mask, 'none');
};

const generateRecord = (imports: ImportSet, path: ParsedLexiconRef, spec: LexRecord): string => {
	const schema = generateObject(imports, path, spec.record, 'required');

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
	path: ParsedLexiconRef,
	spec: LexObject,
	writeType: 'required' | 'optional' | 'none' = 'optional',
): string => {
	const required = new Set(spec.required);
	const nullable = new Set(spec.nullable);

	let inner = ``;

	switch (writeType) {
		case 'optional': {
			inner += `"$type": ${PURE} v.optional(${PURE} v.literal(${lit(formatLexiconRef(path))})),`;
			break;
		}
		case 'required': {
			inner += `"$type": ${PURE} v.literal(${lit(formatLexiconRef(path))}),`;
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
		const optional = !required.has(prop) && !('default' in propSpec && propSpec.default !== undefined);
		const nulled = nullable.has(prop);

		let call = generateType(imports, path, propSpec, lazy);

		if (nulled) {
			call = `${PURE} v.nullable(${call})`;
		}

		if (optional) {
			call = `${PURE} v.optional(${call})`;
		}

		const jsdoc = generateJsdocField(propSpec);
		if (jsdoc.length !== 0) {
			inner += `\n${jsdoc}\n`;
		}

		if (lazy) {
			inner += `get ${lit(prop)} () { return ${call} },`;
		} else {
			inner += `${lit(prop)}: ${call},`;
		}
	}

	return `${PURE} v.object({\n${inner}})`;
};

const IS_DEPRECATED_PREFIX_RE = /^\s*(?:\(deprecated\)|deprecated[.:;])/i;
const IS_DEPRECATED_SUFFIX_RE = /\b(?:deprecated(?::[^]+)?)\s*$/i;

const generateJsdocField = (spec: LexUserType | LexRefVariant | LexUnknown) => {
	const lines: string[] = [];

	if ('description' in spec && spec.description) {
		const desc = spec.description
			.replace(/\*\//g, '*\\/')
			.replace(/@/g, '\\@')
			.replace(/\r?\n/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();

		if (desc) {
			lines.push(desc);
		}

		if (IS_DEPRECATED_PREFIX_RE.test(desc) || IS_DEPRECATED_SUFFIX_RE.test(desc)) {
			lines.push(`@deprecated`);
		}
	}

	// Add annotations based on property spec type
	switch (spec.type) {
		case 'boolean': {
			if (spec.default !== undefined) {
				lines.push(`@default ${lit(spec.default)}`);
			}
			break;
		}
		case 'string': {
			if (spec.minLength !== undefined) {
				lines.push(`@minLength ${spec.minLength}`);
			}
			if (spec.maxLength !== undefined) {
				lines.push(`@maxLength ${spec.maxLength}`);
			}
			if (spec.minGraphemes !== undefined) {
				lines.push(`@minGraphemes ${spec.minGraphemes}`);
			}
			if (spec.maxGraphemes !== undefined) {
				lines.push(`@maxGraphemes ${spec.maxGraphemes}`);
			}
			if (spec.default !== undefined) {
				lines.push(`@default ${lit(spec.default)}`);
			}
			break;
		}
		case 'integer': {
			if (spec.minimum !== undefined) {
				lines.push(`@minimum ${spec.minimum}`);
			}
			if (spec.maximum !== undefined) {
				lines.push(`@maximum ${spec.maximum}`);
			}
			if (spec.default !== undefined) {
				lines.push(`@default ${lit(spec.default)}`);
			}
			break;
		}
		case 'bytes': {
			if (spec.minLength !== undefined) {
				lines.push(`@minLength ${spec.minLength}`);
			}
			if (spec.maxLength !== undefined) {
				lines.push(`@maxLength ${spec.maxLength}`);
			}
			break;
		}
		case 'array': {
			if (spec.minLength !== undefined) {
				lines.push(`@minLength ${spec.minLength}`);
			}
			if (spec.maxLength !== undefined) {
				lines.push(`@maxLength ${spec.maxLength}`);
			}
			break;
		}
		case 'blob': {
			const accept = simplifyAccept(spec.accept);
			if (accept) {
				const formatted = accept.map((mime) => mime.replace(/\*\//g, '*\\/')).join(', ');
				lines.push(`@accept ${formatted}`);
			}
			if (spec.maxSize !== undefined) {
				lines.push(`@maxSize ${spec.maxSize}`);
			}
			break;
		}
	}

	let res = ``;
	if (lines.length > 0) {
		res += `/**\n`;

		for (let idx = 0, len = lines.length; idx < len; idx++) {
			const line = lines[idx];
			res += ` * ${line}\n`;
		}

		res += `*/`;
	}

	return res;
};

const generateType = (
	imports: ImportSet,
	path: ParsedLexiconRef,
	spec: LexDefinableField,
	lazy = false,
): string => {
	switch (spec.type) {
		// LexRefVariant
		case 'ref': {
			const refPath = resolvePath(path, spec.ref);

			if (refPath.nsid === path.nsid) {
				return `${toCamelCase(refPath.defId)}Schema`;
			}

			imports.add(refPath.nsid);
			return `${toTitleCase(refPath.nsid)}.${toCamelCase(refPath.defId)}Schema`;
		}
		case 'union': {
			const refs = spec.refs
				.map((ref) => {
					const refPath = resolvePath(path, ref);
					return { path: refPath, uri: formatLexiconRef(refPath) };
				})
				// oxlint-disable-next-line unicorn/no-array-sort -- map already clones
				.sort((a, b) => {
					if (a.uri < b.uri) {
						return -1;
					}
					if (a.uri > b.uri) {
						return 1;
					}

					return 0;
				})
				.map(({ path: refPath }): string => {
					if (refPath.nsid === path.nsid) {
						return `${toCamelCase(refPath.defId)}Schema`;
					}

					imports.add(refPath.nsid);
					return `${toTitleCase(refPath.nsid)}.${toCamelCase(refPath.defId)}Schema`;
				});

			return `${PURE} v.variant([${refs.join(', ')}]${spec.closed ? `, true` : ``})`;
		}

		// LexArray
		case 'array': {
			let item = generateType(imports, path, spec.items);
			if (!lazy && (spec.items.type === 'ref' || spec.items.type === 'union')) {
				item = `(() => { return ${item}; })`;
			}

			const pipe: string[] = [];

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
			let call = `${PURE} v.boolean()`;

			if (spec.const !== undefined) {
				call = `${PURE} v.literal(${spec.const})`;
			}

			if (spec.default !== undefined) {
				call = `${PURE} v.optional(${call}, ${lit(spec.default)})`;
			}

			return call;
		}
		case 'integer': {
			const pipe: string[] = [];

			if ((spec.minimum ?? 0) > 0 || spec.maximum !== undefined) {
				if (spec.maximum === undefined) {
					pipe.push(`${PURE} v.integerRange(${lit(spec.minimum ?? 0)})`);
				} else {
					pipe.push(`${PURE} v.integerRange(${lit(spec.minimum ?? 0)}, ${lit(spec.maximum)})`);
				}
			}

			let call = `${PURE} v.integer()`;

			if (spec.const !== undefined) {
				call = `${PURE} v.literal(${lit(spec.const)})`;
			} else if (spec.enum !== undefined) {
				call = `${PURE} v.literalEnum(${lit(spec.enum.toSorted())})`;
			} else if (pipe.length !== 0) {
				call = `${PURE} v.constrain(${call}, [ ${pipe.join(', ')} ])`;
			}

			if (spec.default !== undefined) {
				call = `${PURE} v.optional(${call}, ${lit(spec.default)})`;
			}

			return call;
		}
		case 'string': {
			const pipe: string[] = [];

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

			if (spec.const !== undefined) {
				call = `${PURE} v.literal(${lit(spec.const)})`;
			} else if (spec.enum !== undefined) {
				call = `${PURE} v.literalEnum(${lit(spec.enum.toSorted())})`;
			} else if (pipe.length !== 0) {
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
			const pipe: string[] = [];

			if (spec.maxSize !== undefined) {
				pipe.push(`${PURE} v.blobSize(${lit(spec.maxSize)})`);
			}

			const accept = simplifyAccept(spec.accept);
			if (accept !== undefined) {
				pipe.push(`${PURE} v.blobAccept(${lit(accept)})`);
			}

			let call = `${PURE} v.blob()`;

			if (pipe.length !== 0) {
				call = `${PURE} v.constrain(${call}, [ ${pipe.join(', ')} ])`;
			}

			return call;
		}

		// LexIpldType
		case 'bytes': {
			const pipe: string[] = [];

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

const isRefVariant = (spec: LexDefinableField): spec is LexRefVariant => {
	const type = spec.type;
	return type === 'ref' || type === 'union';
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
