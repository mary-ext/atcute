import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';

import { isAtprotoDid } from '@atcute/identity';
import { isHandle, isNsid } from '@atcute/lexicons/syntax';

import * as v from '@badrap/valita';
import pc from 'picocolors';

import type { ImportMapping } from './codegen.ts';

const gitSourceConfigSchema = v.object({
	type: v.literal('git'),
	remote: v.string().assert((value) => value.length > 0, `must not be empty`),
	ref: v
		.string()
		.assert((value) => value.length > 0, `must not be empty`)
		.optional(),
	pattern: v
		.array(v.string().assert((value) => value.length > 0, `must not be empty`))
		.assert((value) => value.length > 0, `must include at least one glob pattern`),
});

const atprotoNsidsSourceConfigSchema = v.object({
	type: v.literal('atproto'),
	mode: v.literal('nsids'),
	nsids: v
		.array(v.string().assert((value) => isNsid(value), `must be valid nsid`))
		.assert((value) => value.length > 0, `must include at least one nsid`),
});

const atprotoAuthoritySourceConfigSchema = v.object({
	type: v.literal('atproto'),
	mode: v.literal('authority'),
	authority: v
		.string()
		.assert((value) => isHandle(value) || isAtprotoDid(value), `must a valid at-identifier`),
	pattern: v
		.array(
			v
				.string()
				.assert((value) => isValidLexiconPattern(value), `must be valid nsid or pattern ending with .*`),
		)
		.optional(),
});

const atprotoSourceConfigSchema = v.union(atprotoNsidsSourceConfigSchema, atprotoAuthoritySourceConfigSchema);

const sourceConfigSchema = v.union(gitSourceConfigSchema, atprotoSourceConfigSchema);

const pullConfigSchema = v.object({
	outdir: v.string().assert((value) => value.length > 0, `must not be empty`),
	clean: v.boolean().optional(),
	sources: v
		.array(sourceConfigSchema)
		.assert((value) => value.length > 0, `must include at least one source`),
});

const exportConfigSchema = v.object({
	outdir: v.string().assert((value) => value.length > 0, `must not be empty`),
	files: v.array(v.string().assert((value) => value.length > 0, `must not be empty`)).optional(),
	clean: v.boolean().optional(),
});

const formatterConfigSchema = v.union(
	v.object({ type: v.literal('prettier') }),
	v.object({
		type: v.literal('command'),
		command: v.string().assert((value) => value.length > 0, `must not be empty`),
		concurrency: v
			.number()
			.assert((value) => Number.isInteger(value) && value > 0, `must be a positive integer`)
			.optional(() => 1),
	}),
	v.object({
		type: v.literal('lsp'),
		command: v.string().assert((value) => value.length > 0, `must not be empty`),
	}),
);

const isValidLexiconPattern = (pattern: string): boolean => {
	if (pattern.endsWith('.*')) {
		return isNsid(`${pattern.slice(0, -2)}.x`);
	}

	return isNsid(pattern);
};

const mappingImports: v.Type<ImportMapping['imports']> = v.unknown().chain((value) => {
	if (typeof value === 'string') {
		if (value.length === 0) {
			return v.err('imports must not be empty');
		}

		return v.ok(value);
	}

	if (typeof value === 'function') {
		return v.ok(value as ImportMapping['imports']);
	}

	return v.err('imports must be a string or function');
});

const importMappingSchema: v.Type<ImportMapping> = v.object({
	nsid: v
		.array(
			v.string().chain((value) => {
				if (!isValidLexiconPattern(value)) {
					return v.err(`invalid NSID pattern (must be valid NSID or end with .*)`);
				}

				return v.ok(value);
			}),
		)
		.assert((patterns) => patterns.length > 0, `nsid requires at least one pattern`),
	imports: mappingImports,
});

const modulesConfigSchema = v
	.object({
		importSuffix: v
			.string()
			.assert((value) => value.length > 0, `must not be empty`)
			.optional(),
	})
	.partial();

const generateConfigSchema = v.object({
	outdir: v
		.string()
		.assert((value) => value.length > 0, `must not be empty`)
		.optional(),
	files: v
		.array(v.string().assert((value) => value.length > 0, `must not be empty`))
		.assert((value) => value.length > 0, `must include at least one glob pattern`)
		.optional(),
	imports: v.array(v.string().assert((value) => value.length > 0, `must not be empty`)).optional(),
	mappings: v.array(importMappingSchema).optional(),
	modules: modulesConfigSchema.optional(),
	clean: v.boolean().optional(),
});

export type GitSourceConfig = v.Infer<typeof gitSourceConfigSchema>;
export type AtprotoNsidsSourceConfig = v.Infer<typeof atprotoNsidsSourceConfigSchema>;
export type AtprotoAuthoritySourceConfig = v.Infer<typeof atprotoAuthoritySourceConfigSchema>;
export type AtprotoSourceConfig = v.Infer<typeof atprotoSourceConfigSchema>;
export type SourceConfig = v.Infer<typeof sourceConfigSchema>;
export type PullConfig = v.Infer<typeof pullConfigSchema>;
export type ExportConfig = v.Infer<typeof exportConfigSchema>;
export type FormatterConfig = v.Infer<typeof formatterConfigSchema>;
export type GenerateConfig = v.Infer<typeof generateConfigSchema>;

export const lexiconConfigSchema = v.object({
	/** @deprecated moved to `generate.outdir` */
	outdir: v
		.string()
		.assert((value) => value.length > 0, `must not be empty`)
		.optional(),
	/** @deprecated moved to `generate.files` */
	files: v
		.array(v.string().assert((value) => value.length > 0, `must not be empty`))
		.assert((value) => value.length > 0, `must include at least one glob pattern`)
		.optional(),
	/** @deprecated moved to `generate.imports` */
	imports: v.array(v.string().assert((value) => value.length > 0, `must not be empty`)).optional(),
	/** @deprecated moved to `generate.mappings` */
	mappings: v.array(importMappingSchema).optional(),
	/** @deprecated moved to `generate.modules` */
	modules: modulesConfigSchema.optional(),
	formatter: formatterConfigSchema.optional(),
	generate: generateConfigSchema.optional(),
	pull: pullConfigSchema.optional(),
	export: exportConfigSchema.optional(),
});

export type LexiconConfig = v.Infer<typeof lexiconConfigSchema>;

export type NormalizedConfig = Omit<
	LexiconConfig,
	'formatter' | 'outdir' | 'files' | 'imports' | 'mappings' | 'modules'
> & {
	formatter: FormatterConfig;
	root: string;
};

export const loadConfig = async (configPath?: string): Promise<NormalizedConfig> => {
	let configFilename: string | undefined;

	if (configPath) {
		configFilename = path.resolve(configPath);
	} else {
		// try to find lex.config.js or lex.config.ts in the current directory
		const candidates = ['lex.config.js', 'lex.config.ts'];

		for (const candidate of candidates) {
			const candidatePath = path.resolve(candidate);
			try {
				await fs.access(candidatePath);
				configFilename = candidatePath;
				break;
			} catch {
				// file doesn't exist, try next candidate
			}
		}

		if (!configFilename) {
			console.error(pc.bold(pc.red(`config file not found`)));
			console.error(`looked for: ${candidates.join(', ')}`);
			process.exit(1);
		}
	}

	const configDirname = path.dirname(configFilename);

	let rawConfig: unknown;
	try {
		const configURL = url.pathToFileURL(configFilename);
		const configMod = (await import(configURL.href)) as { default: unknown };
		rawConfig = configMod.default;
	} catch (err) {
		console.error(pc.bold(pc.red(`failed to import config:`)));
		console.error(err);

		process.exit(1);
	}

	const configResult = lexiconConfigSchema.try(rawConfig, { mode: 'passthrough' });
	if (!configResult.ok) {
		console.error(pc.bold(pc.red(`invalid config:`)));
		console.error(configResult.message);

		for (const issue of configResult.issues) {
			console.log(`- ${issue.code} at .${issue.path.join('.')}`);
		}

		process.exit(1);
	}

	const {
		formatter = { type: 'prettier' },
		outdir,
		files,
		imports,
		mappings,
		modules,
		generate,
		...rest
	} = configResult.value;

	// back-compat: top-level generate options were moved into `generate.*`. merge the legacy
	// top-level values into `generate`, with nested `generate.*` winning on conflicts. the result
	// is only present if at least one generate-related option was provided anywhere.
	const hasLegacyTopLevel =
		outdir !== undefined ||
		files !== undefined ||
		imports !== undefined ||
		mappings !== undefined ||
		modules !== undefined;

	let normalizedGenerate: GenerateConfig | undefined;
	if (generate || hasLegacyTopLevel) {
		normalizedGenerate = {
			outdir: generate?.outdir ?? outdir,
			files: generate?.files ?? files,
			imports: generate?.imports ?? imports,
			mappings: generate?.mappings ?? mappings,
			modules: generate?.modules ?? modules,
			clean: generate?.clean,
		};
	}

	return { ...rest, formatter, generate: normalizedGenerate, root: configDirname };
};
