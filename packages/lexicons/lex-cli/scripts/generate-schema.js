import * as fs from 'node:fs/promises';

import * as t from 'tschema';

const lexiconMappingEntrySchema = t.object({
	type: t.enum(['namespace', 'named']),
	path: t.string({ pattern: /^\.$|^\.\//.source }),
});

const atcuteLexiconsFieldSchema = t.object({
	mappings: t.optional(t.dict(lexiconMappingEntrySchema)),
});

const packageJsonSchema = t.object(
	{
		'atcute:lexicons': t.optional(atcuteLexiconsFieldSchema),
	},
	{
		$schema: 'http://json-schema.org/draft-07/schema#',
		$id: 'https://unpkg.com/@atcute/lex-cli/schema/lexicon-package.schema.json',
		title: 'package.json with atcute:lexicons',
		description: 'JSON Schema for package.json with atcute:lexicons field for lexicon import mappings',
		additionalProperties: true,
	},
);

await fs.mkdir(`schema/`, { recursive: true });
await fs.writeFile(`schema/lexicon-package.schema.json`, JSON.stringify(packageJsonSchema, null, 2) + '\n');
