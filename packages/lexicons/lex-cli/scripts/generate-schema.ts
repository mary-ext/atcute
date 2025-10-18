import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';

import { toJsonSchema } from '@valibot/to-json-schema';

import { packageJsonSchema } from '../src/lexicon-metadata.ts';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// Generate JSON Schema from Valibot schema
// Use errorMode: 'ignore' to skip unsupported validations like startsWith
const jsonSchema = toJsonSchema(packageJsonSchema, { errorMode: 'ignore' });

// Add schema metadata
const schemaWithMetadata = {
	$schema: 'http://json-schema.org/draft-07/schema#',
	$id: 'https://unpkg.com/@atcute/lex-cli/schema/lexicon-package.schema.json',
	title: 'package.json with atcute:lexicons',
	description: 'JSON Schema for package.json with atcute:lexicons field for lexicon import mappings',
	...jsonSchema,
};

// Ensure schema directory exists
const schemaDir = path.join(__dirname, '..', 'schema');
await fs.mkdir(schemaDir, { recursive: true });

// Write to file
const schemaPath = path.join(schemaDir, 'lexicon-package.schema.json');
await fs.writeFile(schemaPath, JSON.stringify(schemaWithMetadata, null, 2) + '\n');

console.log(`generated JSON Schema at ${schemaPath}`);
