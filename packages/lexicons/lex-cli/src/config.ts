import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';

import { isAtprotoDid } from '@atcute/identity';
import { type Nsid, isHandle, isNsid } from '@atcute/lexicons/syntax';

import pc from 'picocolors';
import * as v from 'valibot';

import type { ImportMapping } from './codegen.ts';
import { printValibotIssues } from './utils/issues.ts';
import { isValidLexiconPattern } from './utils/nsid-pattern.ts';

// `lexiconConfigSchema` is wide and deep enough that valibot's inferred output bottoms out at
// `{}` for its nested fields. annotating it against an explicit interface forces tsgo to use the
// declared shape; inner schemas infer cleanly without help. the interfaces also strip the
// `{ [key: string]: unknown }` index signature that `looseObject` would otherwise expose.

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
	| { type: 'prettier'; passes: 'auto' | number }
	| { type: 'command'; command: string; concurrency: number; passes: 'auto' | number }
	| { type: 'lsp'; command: string; passes: 'auto' | number };

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
	formatter?: FormatterConfig;
	generate?: GenerateConfig;
	pull?: PullConfig;
	export?: ExportConfig;
}

export type NormalizedConfig = LexiconConfig & {
	formatter: FormatterConfig;
	root: string;
};

const nonEmptyString = v.pipe(v.string(), v.nonEmpty(`must not be empty`));

const gitSourceConfigSchema = v.looseObject({
	type: v.literal('git'),
	remote: nonEmptyString,
	ref: v.optional(nonEmptyString),
	pattern: v.pipe(v.array(nonEmptyString), v.minLength(1, `must include at least one glob pattern`)),
});

const atprotoNsidsSourceConfigSchema = v.looseObject({
	type: v.literal('atproto'),
	mode: v.literal('nsids'),
	nsids: v.pipe(
		v.array(v.custom<Nsid>(isNsid, `must be valid nsid`)),
		v.minLength(1, `must include at least one nsid`),
	),
});

const atprotoAuthoritySourceConfigSchema = v.looseObject({
	type: v.literal('atproto'),
	mode: v.literal('authority'),
	authority: v.pipe(
		v.string(),
		v.check((value) => isHandle(value) || isAtprotoDid(value), `must be a valid at-identifier`),
	),
	pattern: v.optional(
		v.array(
			v.pipe(v.string(), v.check(isValidLexiconPattern, `must be valid nsid or pattern ending with .*`)),
		),
	),
});

const atprotoSourceConfigSchema = v.union([
	atprotoNsidsSourceConfigSchema,
	atprotoAuthoritySourceConfigSchema,
]);

const sourceConfigSchema = v.union([gitSourceConfigSchema, atprotoSourceConfigSchema]);

const pullConfigSchema = v.looseObject({
	outdir: nonEmptyString,
	clean: v.optional(v.boolean()),
	sources: v.pipe(v.array(sourceConfigSchema), v.minLength(1, `must include at least one source`)),
});

const exportConfigSchema = v.looseObject({
	outdir: nonEmptyString,
	files: v.optional(v.array(nonEmptyString)),
	clean: v.optional(v.boolean()),
});

// some formatters are not idempotent; running them once can leave output that a second run would
// still change. `passes` lets a config compensate: a fixed count, or `'auto'` to repeat until the
// output stabilizes.
const formatterPassesSchema = v.optional(
	v.union([
		v.literal('auto'),
		v.pipe(
			v.number(),
			v.check((value) => Number.isInteger(value) && value > 0, `must be a positive integer or "auto"`),
		),
	]),
	1,
);

const formatterConfigSchema = v.union([
	v.looseObject({ type: v.literal('prettier'), passes: formatterPassesSchema }),
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
		passes: formatterPassesSchema,
	}),
	v.looseObject({
		type: v.literal('lsp'),
		command: nonEmptyString,
		passes: formatterPassesSchema,
	}),
]);

const mappingImports = v.pipe(
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

const importMappingSchema = v.looseObject({
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

const modulesConfigSchema = v.looseObject({
	importSuffix: v.optional(nonEmptyString),
});

const generateConfigSchema = v.looseObject({
	outdir: v.optional(nonEmptyString),
	files: v.optional(
		v.pipe(v.array(nonEmptyString), v.minLength(1, `must include at least one glob pattern`)),
	),
	imports: v.optional(v.array(nonEmptyString)),
	mappings: v.optional(v.array(importMappingSchema)),
	modules: v.optional(modulesConfigSchema),
	clean: v.optional(v.boolean()),
});

export const lexiconConfigSchema: v.GenericSchema<unknown, Omit<NormalizedConfig, 'root'>> = v.looseObject({
	formatter: v.optional(formatterConfigSchema, (): FormatterConfig => ({ type: 'prettier', passes: 1 })),
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

	return { ...configResult.output, root: configDirname };
};
