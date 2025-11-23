import * as path from 'node:path';
import * as url from 'node:url';

import * as v from '@badrap/valita';
import pc from 'picocolors';

import { isNsid } from '@atcute/lexicons/syntax';

import type { ImportMapping } from './codegen.js';

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

const sourceConfigSchema = v.union(gitSourceConfigSchema);

const pullConfigSchema = v.object({
	outdir: v.string().assert((value) => value.length > 0, `must not be empty`),
	clean: v.boolean().optional(),
	sources: v
		.array(sourceConfigSchema)
		.assert((value) => value.length > 0, `must include at least one source`),
});

export type GitSourceConfig = v.Infer<typeof gitSourceConfigSchema>;
export type SourceConfig = v.Infer<typeof sourceConfigSchema>;
export type PullConfig = v.Infer<typeof pullConfigSchema>;

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

export const lexiconConfigSchema = v.object({
	outdir: v.string().assert((value) => value.length > 0, `must not be empty`),
	files: v
		.array(v.string().assert((value) => value.length > 0, `must not be empty`))
		.assert((value) => value.length > 0, `must include at least one glob pattern`),
	imports: v.array(v.string().assert((value) => value.length > 0, `must not be empty`)).optional(),
	mappings: v.array(importMappingSchema).optional(),
	modules: v
		.object({
			importSuffix: v
				.string()
				.assert((value) => value.length > 0, `must not be empty`)
				.optional(),
		})
		.partial()
		.optional(),
	pull: pullConfigSchema.optional(),
});

export type LexiconConfig = v.Infer<typeof lexiconConfigSchema>;

export interface NormalizedConfig extends LexiconConfig {
	root: string;
}

export const loadConfig = async (configPath: string): Promise<NormalizedConfig> => {
	const configFilename = path.resolve(configPath);
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

	return { ...configResult.value, root: configDirname };
};
