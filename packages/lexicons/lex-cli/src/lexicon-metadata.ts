import * as v from '@badrap/valita';

import { isNsid } from '@atcute/lexicons/syntax';

export type LexiconMappingEntryType = 'namespace' | 'named';
export type LexiconMappingPath = '.' | `./${string}`;

export interface LexiconMappingEntry {
	type: LexiconMappingEntryType;
	path: LexiconMappingPath;
}

export interface AtcuteLexiconsField {
	mappings?: Record<string, LexiconMappingEntry>;
}

export interface PackageJsonWithLexicons {
	'atcute:lexicons'?: AtcuteLexiconsField;
	[key: string]: unknown;
}

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
const lexiconMappingEntry: v.Type<LexiconMappingEntry> = v.object({
	type: v.union(v.literal('namespace'), v.literal('named')),
	path: v
		.string()
		.assert((input): input is LexiconMappingPath => input === '.' || input.startsWith('./'), {
			message: `path must be "." or start with "./"`,
		}),
});

/**
 * Schema for the atcute:lexicons field in package.json
 */
const mappingsSchema: v.Type<Record<string, LexiconMappingEntry>> = v
	.record(lexiconMappingEntry)
	.chain((input) => {
		for (const key in input) {
			if (!isValidLexiconPattern(key)) {
				return v.err({
					message: `invalid NSID pattern (must be valid NSID or end with .*)`,
					path: [key],
				});
			}
		}

		return v.ok(input);
	});

const atcuteLexiconsField: v.Type<AtcuteLexiconsField> = v.object({
	mappings: mappingsSchema.optional(),
});

/**
 * Schema for package.json with atcute:lexicons field
 */
export const packageJsonSchema: v.Type<PackageJsonWithLexicons> = v.object({
	'atcute:lexicons': atcuteLexiconsField.optional(),
});
