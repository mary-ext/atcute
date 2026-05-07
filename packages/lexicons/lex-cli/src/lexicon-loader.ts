import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';

import { lexiconDoc, refineLexiconDoc, type LexiconDoc } from '@atcute/lexicon-doc';
import { build, type LexDocumentBuilder } from '@atcute/lexicon-doc/builder';

import pc from 'picocolors';
import * as v from 'valibot';

/** file extensions recognized as module files */
const MODULE_EXTENSIONS = new Set(['.js', '.cjs', '.mjs', '.ts', '.cts', '.mts']);

/**
 * represents a loaded lexicon document with its source file
 */
export interface LoadedLexicon {
	nsid: string;
	doc: LexiconDoc;
	filename: string;
}

/**
 * checks if a filename is a module file based on extension
 * @param filename the filename to check
 * @returns true if it's a module file
 */
const isModuleFile = (filename: string): boolean => {
	const ext = path.extname(filename);
	return MODULE_EXTENSIONS.has(ext);
};

/**
 * basic validation that a value looks like a LexDocumentBuilder
 * @param value the value to check
 * @returns true if it appears to be a LexDocumentBuilder
 */
const isLexDocumentBuilder = (value: unknown): value is LexDocumentBuilder => {
	return (
		typeof value === 'object' &&
		value !== null &&
		'id' in value &&
		typeof (value as any).id === 'string' &&
		'defs' in value &&
		typeof (value as any).defs === 'object'
	);
};

/**
 * loads and validates a lexicon document from a JSON file
 * @param absolutePath absolute path to the JSON file
 * @param relativePath relative path for error messages
 * @returns parsed and validated lexicon document
 */
const loadJsonFile = async (absolutePath: string, relativePath: string): Promise<LexiconDoc> => {
	let source: string;
	try {
		source = await fs.readFile(absolutePath, 'utf8');
	} catch (err) {
		console.error(pc.bold(pc.red(`file read error with "${relativePath}"`)));
		console.error(err);
		process.exit(1);
	}

	let json: unknown;
	try {
		json = JSON.parse(source);
	} catch (err) {
		console.error(pc.bold(pc.red(`json parse error in "${relativePath}"`)));
		console.error(err);
		process.exit(1);
	}

	const result = v.safeParse(lexiconDoc, json);
	if (!result.success) {
		console.error(pc.bold(pc.red(`schema validation failed for "${relativePath}"`)));

		for (const issue of result.issues) {
			const dotPath = v.getDotPath(issue) ?? '';
			console.log(`- ${issue.type} at .${dotPath}: ${issue.message}`);
		}

		process.exit(1);
	}

	const issues = refineLexiconDoc(result.output, true);
	if (issues.length > 0) {
		console.error(pc.bold(pc.red(`lint validation failed for "${relativePath}"`)));

		for (const issue of issues) {
			console.log(`- ${issue.message} at .${issue.path.join('.')}`);
		}

		process.exit(1);
	}

	return result.output;
};

/**
 * loads a LexDocumentBuilder from a module file
 * @param absolutePath absolute path to the module file
 * @param relativePath relative path for error messages
 * @returns the LexDocumentBuilder from the module's default export
 */
const loadModuleBuilder = async (absolutePath: string, relativePath: string): Promise<LexDocumentBuilder> => {
	let mod: unknown;
	try {
		const fileUrl = url.pathToFileURL(absolutePath);
		mod = await import(fileUrl.href);
	} catch (err) {
		console.error(pc.bold(pc.red(`failed to import module "${relativePath}"`)));
		console.error(err);
		process.exit(1);
	}

	const defaultExport = (mod as any)?.default;
	if (!isLexDocumentBuilder(defaultExport)) {
		console.error(
			pc.bold(pc.red(`module "${relativePath}" default export is not a valid LexDocumentBuilder`)),
		);
		console.error(`expected default export to be a LexDocumentBuilder (object with 'id' and 'defs')`);
		process.exit(1);
	}

	return defaultExport;
};

/**
 * loads lexicon documents from glob patterns
 * @param patterns glob patterns to match files
 * @param root root directory for resolving paths
 * @returns array of loaded lexicon documents
 */
export const loadLexicons = async (patterns: string[], root: string): Promise<LoadedLexicon[]> => {
	const results: LoadedLexicon[] = [];
	const seen = new Map<string, string>();

	// collect JSON docs and module builders separately
	const jsonDocs: Array<{ doc: LexiconDoc; filename: string }> = [];
	const moduleBuilders: Array<{ builder: LexDocumentBuilder; filename: string }> = [];

	for await (const filename of fs.glob(patterns, { cwd: root })) {
		const absolutePath = path.join(root, filename);

		if (isModuleFile(filename)) {
			const builder = await loadModuleBuilder(absolutePath, filename);
			moduleBuilders.push({ builder, filename });
		} else {
			// assume JSON for anything else (including .json)
			const doc = await loadJsonFile(absolutePath, filename);
			jsonDocs.push({ doc, filename });
		}
	}

	// add JSON docs directly (already built)
	for (const { doc, filename } of jsonDocs) {
		const existing = seen.get(doc.id);
		if (existing) {
			console.error(pc.bold(pc.red(`duplicate lexicon "${doc.id}"`)));
			console.error(`- found in ${filename}`);
			console.error(`- already found in ${existing}`);
			process.exit(1);
		}

		seen.set(doc.id, filename);
		results.push({ nsid: doc.id, doc, filename });
	}

	// build all module builders together (for cross-references)
	if (moduleBuilders.length > 0) {
		// check for duplicates in builders
		const buildersByNsid = new Map<string, string>();
		for (const { builder, filename } of moduleBuilders) {
			const existing = buildersByNsid.get(builder.id) ?? seen.get(builder.id);
			if (existing) {
				console.error(pc.bold(pc.red(`duplicate lexicon "${builder.id}"`)));
				console.error(`- found in ${filename}`);
				console.error(`- already found in ${existing}`);
				process.exit(1);
			}
			buildersByNsid.set(builder.id, filename);
		}

		let built: Record<string, LexiconDoc>;
		try {
			built = build({ documents: moduleBuilders.map((m) => m.builder) });
		} catch (err) {
			console.error(pc.bold(pc.red(`build failed for module lexicons`)));
			console.error(err);
			process.exit(1);
		}

		for (const { builder, filename } of moduleBuilders) {
			const doc = built[builder.id];
			seen.set(builder.id, filename);
			results.push({ nsid: builder.id, doc, filename });
		}
	}

	return results;
};
