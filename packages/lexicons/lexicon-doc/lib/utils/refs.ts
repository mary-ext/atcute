import { isNsid, type Nsid } from '@atcute/lexicons/syntax';

import type { LexiconDoc, LexRefVariant, LexUserType } from '../types.js';

/**
 * represents a lexicon definition reference
 * - full NSID: `com.example.lexicon` (refers to #main)
 * - NSID with fragment: `com.example.lexicon#defId`
 * - relative ref: `#defId` (requires context NSID to resolve)
 */
export type LexiconRef = Nsid | `${Nsid}#${string}` | `#${string}`;

export interface ParsedLexiconRef {
	nsid: Nsid;
	defId: string;
}

/**
 * formats a parsed lexicon reference back to a string
 * @param parsed the parsed reference
 * @param context if provided and matches parsed.nsid, outputs a relative ref (#defId)
 * @returns formatted lexicon reference string
 */
export const formatLexiconRef = (parsed: ParsedLexiconRef, context?: Nsid): string => {
	const { nsid, defId } = parsed;

	if (context !== undefined && context === nsid) {
		return `#${defId}`;
	}

	return defId === 'main' ? nsid : `${nsid}#${defId}`;
};

/**
 * parses a lexicon definition reference into its components
 * @param ref the lexicon reference to parse
 * @param context context NSID, required for relative refs (e.g., `#defId`)
 * @returns parsed reference with nsid and defId (defId defaults to 'main' if not specified)
 * @throws if the ref is invalid or a relative ref is passed without context
 */
export const parseLexiconRef = (ref: string, context?: Nsid): ParsedLexiconRef => {
	const hashIndex = ref.indexOf('#');

	if (hashIndex === 0) {
		if (context === undefined) {
			throw new SyntaxError(`relative ref requires context nsid: ${ref}`);
		}

		return { nsid: context, defId: ref.slice(1) };
	}

	if (hashIndex === -1) {
		if (!isNsid(ref)) {
			throw new SyntaxError(`invalid nsid: ${ref}`);
		}

		return { nsid: ref, defId: 'main' };
	}

	const nsid = ref.slice(0, hashIndex);
	const defId = ref.slice(hashIndex + 1);
	if (!isNsid(nsid)) {
		throw new SyntaxError(`invalid nsid in ref: ${nsid}`);
	}

	return { nsid: nsid, defId };
};

type SchemaValue = LexUserType | LexRefVariant;

export const findExternalReferences = (doc: LexiconDoc, defId?: string): Set<string> => {
	const refs = new Set<string>();
	const visited = new Set<string>();

	const extract = (def: SchemaValue): void => {
		switch (def.type) {
			case 'ref': {
				const ref = def.ref;
				if (ref.startsWith('#')) {
					const id = extractDefId(ref)!;

					if (visited.has(id)) {
						break;
					}

					visited.add(id);

					const child = doc.defs[id];
					if (child !== undefined) {
						extract(child);
					}

					break;
				}

				const nsid = stripHash(ref);
				if (nsid === doc.id) {
					const id = extractDefId(ref)!;

					if (visited.has(id)) {
						break;
					}

					visited.add(id);

					const child = doc.defs[id];
					if (child !== undefined) {
						extract(child);
					}

					break;
				}

				refs.add(ref);
				break;
			}
			case 'union': {
				for (const ref of def.refs) {
					if (ref.startsWith('#')) {
						const id = extractDefId(ref)!;

						if (visited.has(id)) {
							continue;
						}

						visited.add(id);

						const child = doc.defs[id];
						if (child !== undefined) {
							extract(child);
						}

						continue;
					}

					const nsid = stripHash(ref);
					if (nsid === doc.id) {
						const id = extractDefId(ref)!;

						if (visited.has(id)) {
							continue;
						}

						visited.add(id);

						const child = doc.defs[id];
						if (child !== undefined) {
							extract(child);
						}

						continue;
					}

					refs.add(ref);
				}

				break;
			}

			case 'record': {
				extract(def.record);
				break;
			}

			case 'array': {
				extract(def.items);
				break;
			}

			case 'object': {
				const properties = def.properties;
				if (properties === undefined) {
					break;
				}

				for (const item of Object.values(properties)) {
					extract(item);
				}

				break;
			}

			case 'procedure': {
				const { input, output } = def;

				if (input?.schema !== undefined) {
					extract(input.schema);
				}

				if (output?.schema !== undefined) {
					extract(output.schema);
				}

				break;
			}
			case 'subscription': {
				const { message } = def;

				if (message?.schema !== undefined) {
					extract(message.schema);
				}

				break;
			}
			case 'query': {
				const { output } = def;

				if (output?.schema !== undefined) {
					extract(output.schema);
				}

				break;
			}
		}
	};

	if (defId !== undefined) {
		const def = doc.defs[defId];
		if (def !== undefined) {
			extract(def);
		}
	} else {
		for (const defId in doc.defs) {
			const def = doc.defs[defId];
			extract(def);
		}
	}

	return refs;
};

const stripHash = (defUri: string): string => {
	const index = defUri.indexOf('#');
	if (index === -1) {
		return defUri;
	}

	return defUri.slice(0, index);
};

const extractDefId = (ref: string): string | undefined => {
	const hashIndex = ref.indexOf('#');
	if (hashIndex === -1) {
		return undefined;
	}

	return ref.slice(hashIndex + 1);
};
