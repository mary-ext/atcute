import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';

import { isAtprotoDid } from '@atcute/identity';
import { isHandle, isNsid, type Nsid } from '@atcute/lexicons/syntax';

import pc from 'picocolors';
import * as v from 'valibot';

import type { ImportMapping } from './codegen.ts';
import { printValibotIssues } from './utils/issues.ts';

// the schema graph here is deep enough that valibot's inferred output types bottom out at `{}`,
// so each schema is annotated against an explicit interface to keep tsgo happy. the interfaces
// match the schemas one-to-one — no casts are needed.

export interface GitSourceConfig {
	type: 'git';
	remote: string;
	ref?: string;
	pattern: string[];
}

export interface AtprotoNsidsSourceConfig {
	type: 'atproto';
	mode: 'nsids';
	nsids: Nsid[];
}

export interface AtprotoAuthoritySourceConfig {
	type: 'atproto';
	mode: 'authority';
	authority: string;
	pattern?: string[];
}

export type AtprotoSourceConfig = AtprotoNsidsSourceConfig | AtprotoAuthoritySourceConfig;

export type SourceConfig = GitSourceConfig | AtprotoSourceConfig;

export interface PullConfig {
	outdir: string;
	clean?: boolean;
	sources: SourceConfig[];
}

export interface ExportConfig {
	outdir: string;
	files?: string[];
	clean?: boolean;
}

export type FormatterConfig =
	| { type: 'prettier' }
	| { type: 'command'; command: string; concurrency: number }
	| { type: 'lsp'; command: string };

export interface ModulesConfig {
	importSuffix?: string;
}

export interface GenerateConfig {
	outdir?: string;
	files?: string[];
	imports?: string[];
	mappings?: ImportMapping[];
	modules?: ModulesConfig;
	clean?: boolean;
}

export interface LexiconConfig {
	/** @deprecated moved to `generate.outdir` */
	outdir?: string;
	/** @deprecated moved to `generate.files` */
	files?: string[];
	/** @deprecated moved to `generate.imports` */
	imports?: string[];
	/** @deprecated moved to `generate.mappings` */
	mappings?: ImportMapping[];
	/** @deprecated moved to `generate.modules` */
	modules?: ModulesConfig;
	formatter?: FormatterConfig;
	generate?: GenerateConfig;
	pull?: PullConfig;
	export?: ExportConfig;
}

export type NormalizedConfig = Omit<
	LexiconConfig,
	'outdir' | 'files' | 'imports' | 'mappings' | 'modules'
> & {
	formatter: FormatterConfig;
	root: string;
};

const nonEmptyString = v.pipe(v.string(), v.nonEmpty(`must not be empty`));

const isValidLexiconPattern = (pattern: string): boolean => {
	if (pattern.endsWith('.*')) {
		return isNsid(`${pattern.slice(0, -2)}.x`);
	}

	return isNsid(pattern);
};

const gitSourceConfigSchema: v.GenericSchema<unknown, GitSourceConfig> = v.looseObject({
	type: v.literal('git'),
	remote: nonEmptyString,
	ref: v.optional(nonEmptyString),
	pattern: v.pipe(v.array(nonEmptyString), v.minLength(1, `must include at least one glob pattern`)),
});

const atprotoNsidsSourceConfigSchema: v.GenericSchema<unknown, AtprotoNsidsSourceConfig> = v.looseObject({
	type: v.literal('atproto'),
	mode: v.literal('nsids'),
	nsids: v.pipe(
		v.array(
			v.pipe(
				v.string(),
				v.check((value) => isNsid(value), `must be valid nsid`),
				v.transform((value) => value as Nsid),
			),
		),
		v.minLength(1, `must include at least one nsid`),
	),
});

const atprotoAuthoritySourceConfigSchema: v.GenericSchema<unknown, AtprotoAuthoritySourceConfig> =
	v.looseObject({
		type: v.literal('atproto'),
		mode: v.literal('authority'),
		authority: v.pipe(
			v.string(),
			v.check((value) => isHandle(value) || isAtprotoDid(value), `must a valid at-identifier`),
		),
		pattern: v.optional(
			v.array(
				v.pipe(v.string(), v.check(isValidLexiconPattern, `must be valid nsid or pattern ending with .*`)),
			),
		),
	});

const atprotoSourceConfigSchema: v.GenericSchema<unknown, AtprotoSourceConfig> = v.union([
	atprotoNsidsSourceConfigSchema,
	atprotoAuthoritySourceConfigSchema,
]);

const sourceConfigSchema: v.GenericSchema<unknown, SourceConfig> = v.union([
	gitSourceConfigSchema,
	atprotoSourceConfigSchema,
]);

const pullConfigSchema: v.GenericSchema<unknown, PullConfig> = v.looseObject({
	outdir: nonEmptyString,
	clean: v.optional(v.boolean()),
	sources: v.pipe(v.array(sourceConfigSchema), v.minLength(1, `must include at least one source`)),
});

const exportConfigSchema: v.GenericSchema<unknown, ExportConfig> = v.looseObject({
	outdir: nonEmptyString,
	files: v.optional(v.array(nonEmptyString)),
	clean: v.optional(v.boolean()),
});

const formatterConfigSchema: v.GenericSchema<unknown, FormatterConfig> = v.union([
	v.looseObject({ type: v.literal('prettier') }),
	v.looseObject({
		type: v.literal('command'),
		command: nonEmptyString,
		concurrency: v.optional(
			v.pipe(
				v.number(),
				v.check((value) => Number.isInteger(value) && value > 0, `must be a positive integer`),
			),
			() => 1,
		),
	}),
	v.looseObject({
		type: v.literal('lsp'),
		command: nonEmptyString,
	}),
]);

const mappingImports: v.GenericSchema<unknown, ImportMapping['imports']> = v.pipe(
	v.unknown(),
	v.rawTransform<unknown, ImportMapping['imports']>(({ dataset, addIssue, NEVER }) => {
		const value = dataset.value;
		if (typeof value === 'string') {
			if (value.length === 0) {
				addIssue({ message: 'imports must not be empty' });
				return NEVER;
			}
			return value;
		}
		if (typeof value === 'function') {
			return value as ImportMapping['imports'];
		}
		addIssue({ message: 'imports must be a string or function' });
		return NEVER;
	}),
);

const importMappingSchema: v.GenericSchema<unknown, ImportMapping> = v.looseObject({
	nsid: v.pipe(
		v.array(
			v.pipe(
				v.string(),
				v.check(isValidLexiconPattern, `invalid NSID pattern (must be valid NSID or end with .*)`),
			),
		),
		v.minLength(1, `nsid requires at least one pattern`),
	),
	imports: mappingImports,
});

const modulesConfigSchema: v.GenericSchema<unknown, ModulesConfig> = v.looseObject({
	importSuffix: v.optional(nonEmptyString),
});

const generateConfigSchema: v.GenericSchema<unknown, GenerateConfig> = v.looseObject({
	outdir: v.optional(nonEmptyString),
	files: v.optional(
		v.pipe(v.array(nonEmptyString), v.minLength(1, `must include at least one glob pattern`)),
	),
	imports: v.optional(v.array(nonEmptyString)),
	mappings: v.optional(v.array(importMappingSchema)),
	modules: v.optional(modulesConfigSchema),
	clean: v.optional(v.boolean()),
});

export const lexiconConfigSchema: v.GenericSchema<
	unknown,
	Omit<LexiconConfig, 'formatter'> & { formatter: FormatterConfig }
> = v.looseObject({
	/** @deprecated moved to `generate.outdir` */
	outdir: v.optional(nonEmptyString),
	/** @deprecated moved to `generate.files` */
	files: v.optional(
		v.pipe(v.array(nonEmptyString), v.minLength(1, `must include at least one glob pattern`)),
	),
	/** @deprecated moved to `generate.imports` */
	imports: v.optional(v.array(nonEmptyString)),
	/** @deprecated moved to `generate.mappings` */
	mappings: v.optional(v.array(importMappingSchema)),
	/** @deprecated moved to `generate.modules` */
	modules: v.optional(modulesConfigSchema),
	formatter: v.optional(formatterConfigSchema, (): FormatterConfig => ({ type: 'prettier' })),
	generate: v.optional(generateConfigSchema),
	pull: v.optional(pullConfigSchema),
	export: v.optional(exportConfigSchema),
});
export const loadConfig = async (configPath?: string): Promise<NormalizedConfig> => {
	let configFilename: string | undefined;

	if (configPath) {
		configFilename = path.resolve(configPath);
	} else {
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

	const configResult = v.safeParse(lexiconConfigSchema, rawConfig);
	if (!configResult.success) {
		console.error(pc.bold(pc.red(`invalid config:`)));
		printValibotIssues(configResult.issues);
		process.exit(1);
	}

	const { outdir, files, imports, mappings, modules, generate, ...rest } = configResult.output;

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

	return { ...rest, generate: normalizedGenerate, root: configDirname };
};
