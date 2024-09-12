import { readFile } from 'node:fs/promises';

import {
	documentSchema,
	type DocumentSchema,
	type RefVariantSchema,
	type UserTypeSchema,
	type XrpcParametersSchema,
} from './schema.js';

const toUpperCache: Record<string, string> = Object.create(null);
const toNamespaceCache: Record<string, string> = Object.create(null);

const toUpper = (s: string) => {
	return (toUpperCache[s] ??= s[0].toUpperCase() + s.slice(1));
};
const toNamespace = (s: string) => {
	return (toNamespaceCache[s] ??= s.replace(/^\w|\.\w/g, (m) => m[m.length === 1 ? 0 : 1].toUpperCase()));
};

const sortName: (a: string, b: string) => number = (() => {
	const collator = new Intl.Collator('en-US');
	return (a, b) => collator.compare(a, b);
})();

const sortDefinition = (a: string, b: string) => {
	const aIsMain = a === 'main';
	const bIsMain = b === 'main';

	if (aIsMain === bIsMain) {
		return sortName(a, b);
	}

	return +bIsMain - +aIsMain;
};

const writeJsdoc = (descriptions: string[]) => {
	const len = descriptions.length;

	if (len === 0) {
		return '';
	}

	if (len === 1) {
		return `\n/** ${descriptions[0]} */\n`;
	}

	let jsdoc = '\n/**';

	for (let idx = 0; idx < len; idx++) {
		const suffix = idx !== len - 1 && descriptions[idx + 1][0] !== '@';
		jsdoc += `\n * ${descriptions[idx]}${suffix ? ` \\` : ''}`;
	}

	jsdoc += `\n */\n`;
	return jsdoc;
};

const resolveType = (
	nsid: string,
	def: UserTypeSchema | RefVariantSchema | XrpcParametersSchema,
): { value: string; descriptions: string[] } => {
	const type = def.type;

	/** @type {string[]} */
	let descs = [];
	let val = 'unknown';

	if (def.description) {
		descs.push(def.description);

		if (def.description.toLowerCase().startsWith('deprecated')) {
			descs.push(`@deprecated`);
		}
	}

	if (type === 'unknown') {
		val = 'unknown';
	} else if (type === 'cid-link') {
		val = 'At.CIDLink';
	} else if (type === 'integer') {
		val = 'number';

		if (def.minimum !== undefined) {
			descs.push(`Minimum: ${def.minimum}`);
		}

		if (def.maximum !== undefined) {
			descs.push(`Maximum: ${def.maximum}`);
		}

		if (def.default !== undefined) {
			descs.push(`@default ${def.default}`);
		}
	} else if (type === 'boolean') {
		val = 'boolean';

		if (def.default !== undefined) {
			descs.push(`@default ${def.default}`);
		}
	} else if (type === 'string') {
		const enums = def.enum;
		const known = def.knownValues;
		const format = def.format;

		if (format !== undefined) {
			if (format === 'did') {
				val = 'At.DID';
			} else if (format === 'cid') {
				val = 'At.CID';
			} else if (format === 'handle') {
				val = 'At.Handle';
			} else if (format === 'at-uri') {
				val = 'At.Uri';
			} else if (
				format === 'at-identifier' ||
				format === 'datetime' ||
				format === 'language' ||
				format === 'nsid' ||
				format === 'uri'
			) {
				// deliberately ignored
				val = 'string';
			} else {
				console.warn(`${nsid}: unknown format ${format}`);
				val = 'string';
			}
		} else {
			if (def.minLength !== undefined) {
				descs.push(`Minimum string length: ${def.minLength}`);
			}

			if (def.maxLength !== undefined) {
				descs.push(`Maximum string length: ${def.maxLength}`);
			}

			if (def.maxGraphemes !== undefined) {
				descs.push(`Maximum grapheme length: ${def.maxGraphemes}`);
			}

			if (def.default !== undefined) {
				descs.push(`@default ${JSON.stringify(def.default)}`);
			}

			if (enums) {
				val = enums.map((val) => JSON.stringify(val)).join('|');
			} else if (known) {
				val = `${known
					.toSorted(sortName)
					.map((val) => JSON.stringify(val))
					.join('|')} | (string & {})`;
			} else {
				val = 'string';
			}
		}
	} else if (type === 'array') {
		const { value, descriptions } = resolveType(`${nsid}/0`, def.items);

		if (def.minLength !== undefined) {
			descs.push(`Minimum array length: ${def.minLength}`);
		}

		if (def.maxLength !== undefined) {
			descs.push(`Maximum array length: ${def.maxLength}`);
		}

		val = `(${value})[]`;
		descs = descs.concat(descriptions);
	} else if (type === 'blob') {
		// const accept = def.accept?.map((mime) => `\`${mime.replaceAll('*', '${string}')}\``);
		// val = `At.Blob${accept ? `<${accept.join('|')}>` : ''}`;

		val = `At.Blob`;
	} else if (type === 'ref') {
		const [ns, ref] = def.ref.split('#');
		val = (ns ? toNamespace(ns) + '.' : '') + (ref ? toUpper(ref) : 'Main');
	} else if (type === 'union') {
		const refs = def.refs.toSorted(sortName).map((raw) => {
			const [ns, ref] = raw.split('#');
			return (ns ? toNamespace(ns) + '.' : '') + (ref ? toUpper(ref) : 'Main');
		});

		val = `Brand.Union<${refs.join('|')}>`;
	} else if (type === 'object' || type === 'params') {
		const required = def.required;
		const nullable = type === 'object' ? def.nullable : [];
		const properties = def.properties;

		const propKeys = Object.keys(properties).sort((a, b) => {
			const aIsOptional = !required || !required.includes(a);
			const bIsOptional = !required || !required.includes(b);

			if (aIsOptional === bIsOptional) {
				return sortName(a, b);
			}

			return +aIsOptional - +bIsOptional;
		});

		let chunk = '{';

		for (const prop of propKeys) {
			const isOptional = !required || !required.includes(prop);
			const isNullable = nullable !== undefined && nullable.includes(prop);
			const { value, descriptions } = resolveType(`${nsid}/${prop}`, properties[prop]);

			chunk += writeJsdoc(descriptions);
			chunk += `${prop}${isOptional ? `?` : ``}:${value}${isNullable ? `| null` : ``};`;
		}

		chunk += '}';
		val = chunk;
	} else if (type === 'bytes') {
		val = `At.Bytes`;
	} else {
		console.log(`${nsid}: unknown type ${type}`);
	}

	return { value: val, descriptions: descs };
};

export interface GenerateDefinitionsOptions {
	files: string[];
	main: boolean;
	banner?: string;
	description?: string;
}

const mainPrelude = `type ObjectOmit<T, K extends keyof any> = Omit<T, K>;

/** Handles type branding in objects */
export declare namespace Brand {
	/** Symbol used to brand objects, this does not actually exist in runtime */
	const Type: unique symbol;

	/** Get the intended \`$type\` field */
	type GetType<T extends { [Type]?: string }> = NonNullable<T[typeof Type]>;

	/** Creates a union of objects where it's discriminated by \`$type\` field. */
	type Union<T extends { [Type]?: string }> = T extends any ? T & { $type: GetType<T> } : never;

	/** Omits the type branding from object */
	type Omit<T extends { [Type]?: string }> = ObjectOmit<T, typeof Type>;
}

/** Base AT Protocol schema types */
export declare namespace At {
	/** CID string */
	type CID = string;

	/** DID of a user */
	type DID = \`did:\${string}\`;

	/** User handle */
	type Handle = string;

	/** URI string */
	type Uri = string;

	/** Object containing a CID string */
	interface CIDLink {
		$link: CID;
	}

	/** Object containing a base64-encoded bytes */
	interface Bytes {
		$bytes: string;
	}

	/** Blob interface */
	interface Blob<T extends string = string> {
		$type: 'blob';
		mimeType: T;
		ref: {
			$link: string;
		};
		size: number;
	}
}`;

export const generateDefinitions = async (opts: GenerateDefinitionsOptions) => {
	const { files, main, banner, description } = opts;

	let queries = '';
	let procedures = '';
	let records = '';

	let code = `/* eslint-disable */
// This file is automatically generated, do not edit!`;

	if (description) {
		code += `\n\n/**
 * @module
 * ${description}
 */`;
	}

	if (main) {
		code += `\n\n${banner ?? ''}\n${mainPrelude}`;
	} else {
		code += `\n\nimport "@atcute/client/lexicons";${banner ?? ''}

declare module "@atcute/client/lexicons" {`;
	}

	for await (const filename of files.sort(sortName)) {
		let document: DocumentSchema;

		try {
			const jsonString = await readFile(filename, 'utf8');
			document = documentSchema.parse(JSON.parse(jsonString));
		} catch (err) {
			throw new Error(`failed to read ${filename}`, { cause: err });
		}

		const ns = document.id;
		const tsNamespace = toNamespace(ns);

		const descs = [];

		let chunk = '';

		const definitions = document.defs;
		const keys = Object.keys(definitions).sort(sortDefinition);

		for (const key of keys) {
			const def = definitions[key];
			const type = def.type;

			const nsid = `${ns}${key !== 'main' ? `#${key}` : ''}`;
			const typeName = key[0].toUpperCase() + key.slice(1);

			if (type === 'string') {
				const { value, descriptions } = resolveType(nsid, def);

				chunk += writeJsdoc(descriptions);
				chunk += `type ${typeName} = ${value};`;
			} else if (type === 'token') {
				chunk += `type ${typeName} = '${nsid}';`;
			} else if (type === 'object') {
				const required = def.required;
				const nullable = def.nullable;
				const properties = def.properties;

				const propKeys = Object.keys(properties).sort((a, b) => {
					const aIsOptional = !required || !required.includes(a);
					const bIsOptional = !required || !required.includes(b);

					if (aIsOptional === bIsOptional) {
						return sortName(a, b);
					}

					return +aIsOptional - +bIsOptional;
				});

				const descs = [];

				if (def.description) {
					descs.push(def.description);

					if (def.description.toLowerCase().startsWith('deprecated')) {
						descs.push(`@deprecated`);
					}
				}

				chunk += writeJsdoc(descs);
				chunk += `interface ${typeName} {`;
				chunk += `[Brand.Type]?: '${nsid}';`;

				for (const prop of propKeys) {
					const isOptional = !required || !required.includes(prop);
					const isNullable = nullable !== undefined && nullable.includes(prop);
					const { value, descriptions } = resolveType(`${nsid}/${prop}`, properties[prop]);

					chunk += writeJsdoc(descriptions);
					chunk += `${prop}${isOptional ? `?` : ``}:${value}${isNullable ? `| null` : ``};`;
				}

				chunk += '}';
			} else if (type === 'array') {
				const { value, descriptions } = resolveType(nsid, def.items);
				const descs = [];

				if (def.maxLength !== undefined) {
					descs.push(`Maximum array length: ${def.maxLength}`);
				}

				if (def.minLength !== undefined) {
					descs.push(`Minimum array length: ${def.minLength}`);
				}

				chunk += writeJsdoc(descs.concat(descriptions));
				chunk += `type ${typeName} = (${value})[];`;
			} else if (type === 'record') {
				const obj = def.record;

				const required = obj.required;
				const nullable = obj.nullable;
				const properties = obj.properties;

				const propKeys = Object.keys(properties).sort((a, b) => {
					const aIsOptional = !required || !required.includes(a);
					const bIsOptional = !required || !required.includes(b);

					if (aIsOptional === bIsOptional) {
						return sortName(a, b);
					}

					return +aIsOptional - +bIsOptional;
				});

				const descs = [];

				if (def.description) {
					descs.push(def.description);

					if (def.description.toLowerCase().startsWith('deprecated')) {
						descs.push(`@deprecated`);
					}
				}

				chunk += writeJsdoc(descs);
				chunk += `interface Record {`;
				chunk += `$type: '${nsid}';`;

				for (const prop of propKeys) {
					const isOptional = !required || !required.includes(prop);
					const isNullable = nullable !== undefined && nullable.includes(prop);
					const { value, descriptions } = resolveType(`${nsid}/${prop}`, properties[prop]);

					chunk += writeJsdoc(descriptions);
					chunk += `${prop}${isOptional ? `?` : ``}:${value}${isNullable ? `| null` : ``};`;
				}

				chunk += '}';

				records += `\n'${nsid}': ${tsNamespace}.Record;`;
			} else if (type === 'query' || type === 'procedure') {
				let parameters = def.parameters;

				const input = type === 'procedure' ? def.input : undefined;
				const output = def.output;
				const errors = def.errors;

				if (def.description) {
					descs.push(def.description);

					if (def.description.toLowerCase().startsWith('deprecated')) {
						descs.push(`@deprecated`);
					}
				}

				if (parameters) {
					if (Object.values(parameters.properties).length === 0) {
						parameters = undefined;
					} else {
						const { value, descriptions } = resolveType(nsid, parameters);

						chunk += writeJsdoc(descriptions);
						chunk += `interface Params ${value}`;
					}
				} else {
					chunk += `interface Params {}`;
				}

				if (input) {
					if (input.encoding === 'application/json') {
						const { value, descriptions } = resolveType(nsid, input.schema!);

						chunk += writeJsdoc(descriptions);

						if (input.schema!.type === 'object') {
							chunk += `interface Input ${value}`;
						} else {
							chunk += `type Input = ${value};`;
						}
					} else {
						chunk += `type Input = Blob | ArrayBufferView;`;
					}
				} else {
					chunk += `type Input = undefined;`;
				}

				if (output) {
					if (output.encoding === 'application/json') {
						const { value, descriptions } = resolveType(nsid, output.schema!);

						chunk += writeJsdoc(descriptions);

						if (output.schema!.type === 'object') {
							chunk += `interface Output ${value}`;
						} else {
							chunk += `type Output = ${value};`;
						}
					} else {
						chunk += `type Output = Uint8Array;`;
					}
				} else {
					chunk += `type Output = undefined;`;
				}

				if (errors) {
					chunk += `interface Errors {`;

					for (const error of errors) {
						chunk += `${error.name}: {};`;
					}

					chunk += '}';
				}

				{
					let rc = `'${ns}':{\n`;

					if (parameters) {
						rc += `params: ${tsNamespace}.Params;`;
					}
					if (input) {
						rc += `input: ${tsNamespace}.Input;`;
					}
					if (output) {
						rc += `output: ${tsNamespace}.Output;`;
					}

					rc += '};';

					if (type === 'query') {
						queries += rc;
					} else if (type === 'procedure') {
						procedures += rc;
					}
				}
			} else if (type === 'blob') {
				const { value, descriptions } = resolveType(nsid, def);

				chunk += writeJsdoc(descriptions);
				chunk += `type ${typeName} = ${value};`;
			} else if (type === 'bytes') {
				const { value, descriptions } = resolveType(nsid, def);

				chunk += writeJsdoc(descriptions);
				chunk += `type ${typeName} = ${value};`;
			} else {
				console.log(`${nsid}: unhandled type ${type}`);
			}
		}

		code += writeJsdoc(descs);

		if (main) {
			code += `export declare namespace ${tsNamespace} {`;
		} else {
			code += `namespace ${tsNamespace} {`;
		}

		code += chunk;
		code += `}\n\n`;
	}

	if (main) {
		code += `export declare interface Records {${records}}\n\n`;
		code += `export declare interface Queries {${queries}}\n\n`;
		code += `export declare interface Procedures {${procedures}}\n\n`;
	} else {
		code += `interface Records {${records}}\n\n`;
		code += `interface Queries {${queries}}\n\n`;
		code += `interface Procedures {${procedures}}\n\n`;
		code += '}';
	}

	return code;
};
