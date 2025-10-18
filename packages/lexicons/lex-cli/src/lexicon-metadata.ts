import * as v from 'valibot';

import { isNsid } from '@atcute/lexicons/syntax';

/**
 * Validates if a string is a valid NSID pattern (exact or wildcard)
 * - Exact: "com.atproto.repo.getRecord"
 * - Wildcard: "com.atproto.*"
 */
const isValidLexiconPattern = (pattern: string): boolean => {
	if (pattern.endsWith('.*')) {
		// For wildcards, remove the .* and validate the prefix as an NSID segment
		const prefix = pattern.slice(0, -2);
		// Add a dummy segment to make it a valid NSID for validation
		return isNsid(prefix + '.x');
	}
	return isNsid(pattern);
};

/**
 * Schema for a single lexicon mapping entry
 */
const lexiconMappingEntry = v.object({
	type: v.picklist(['namespace', 'named']),
	path: v.pipe(v.string(), v.startsWith('./')),
});

/**
 * Schema for the atcute:lexicons field in package.json
 */
const atcuteLexiconsField = v.object({
	mapping: v.optional(
		v.record(
			v.pipe(
				v.string(),
				v.check(isValidLexiconPattern, 'Invalid NSID pattern (must be valid NSID or end with .*)'),
			),
			lexiconMappingEntry,
		),
	),
});

/**
 * Schema for package.json with atcute:lexicons field
 */
export const packageJsonSchema = v.looseObject({
	'atcute:lexicons': v.optional(atcuteLexiconsField),
});

export type LexiconMappingEntry = v.InferOutput<typeof lexiconMappingEntry>;
export type AtcuteLexiconsField = v.InferOutput<typeof atcuteLexiconsField>;
export type PackageJsonWithLexicons = v.InferOutput<typeof packageJsonSchema>;

/**
 * Validates a package.json object against the schema
 */
export const validatePackageJson = (data: unknown): v.SafeParseResult<typeof packageJsonSchema> => {
	return v.safeParse(packageJsonSchema, data);
};
