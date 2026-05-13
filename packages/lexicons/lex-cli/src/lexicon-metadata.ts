import * as v from 'valibot';

import { isValidLexiconPattern } from './utils/nsid-pattern.ts';

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

/** Schema for a single lexicon mapping entry */
const lexiconMappingEntry: v.GenericSchema<unknown, LexiconMappingEntry> = v.looseObject({
	type: v.picklist(['namespace', 'named']),
	path: v.custom<LexiconMappingPath>(
		(input) => typeof input === 'string' && (input === '.' || input.startsWith('./')),
		`path must be "." or start with "./"`,
	),
});

/** Schema for the atcute:lexicons field in package.json */
const mappingsSchema: v.GenericSchema<unknown, Record<string, LexiconMappingEntry>> = v.pipe(
	v.record(v.string(), lexiconMappingEntry),
	v.check((input) => {
		for (const key in input) {
			if (!isValidLexiconPattern(key)) {
				return false;
			}
		}
		return true;
	}, `invalid NSID pattern (must be valid NSID or end with .*)`),
);

const atcuteLexiconsField: v.GenericSchema<unknown, AtcuteLexiconsField> = v.looseObject({
	mappings: v.optional(mappingsSchema),
});

/** Schema for package.json with atcute:lexicons field */
export const packageJsonSchema: v.GenericSchema<unknown, PackageJsonWithLexicons> = v.looseObject({
	'atcute:lexicons': v.optional(atcuteLexiconsField),
});
