import { type Nsid, isNsid } from '@atcute/lexicons/syntax';

import type { LexRefVariant, LexUserType, LexiconDoc } from '../types.ts';

/**
 * represents a lexicon definition reference - full NSID: `com.example.lexicon` (refers to #main) - NSID with
 * fragment: `com.example.lexicon#defId` - relative ref: `#defId` (requires context NSID to resolve)
 */
export type LexiconRef = Nsid | `${Nsid}#${string}` | `#${string}`;

export interface ParsedLexiconRef {
	nsid: Nsid;
	defId: string;
}

/**
 * formats a parsed lexicon reference back to a string
 *
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
 *
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
	let stack: { value: SchemaValue; next: typeof stack } | undefined;

	if (defId !== undefined) {
		const def = doc.defs[defId];
		if (def !== undefined) {
			stack = { value: def, next: stack };
		}
	} else {
		for (const defId in doc.defs) {
			stack = { value: doc.defs[defId], next: stack };
		}
	}

	while (stack !== undefined) {
		const def = stack.value;
		stack = stack.next;

		switch (def.type) {
			case 'ref': {
				const id = getInternalDefId(def.ref, doc.id);
				if (id === undefined) {
					if (isValidExternalRef(def.ref)) {
						refs.add(def.ref);
					}
					break;
				}

				if (visited.has(id)) {
					break;
				}

				visited.add(id);

				const child = doc.defs[id];
				if (child !== undefined) {
					stack = { value: child, next: stack };
				}

				break;
			}
			case 'union': {
				for (let idx = 0, len = def.refs.length; idx < len; idx++) {
					const ref = def.refs[idx];
					const id = getInternalDefId(ref, doc.id);
					if (id === undefined) {
						if (isValidExternalRef(ref)) {
							refs.add(ref);
						}
						continue;
					}

					if (visited.has(id)) {
						continue;
					}

					visited.add(id);

					const child = doc.defs[id];
					if (child !== undefined) {
						stack = { value: child, next: stack };
					}
				}

				break;
			}
			case 'record': {
				stack = { value: def.record, next: stack };
				break;
			}
			case 'array': {
				stack = { value: def.items, next: stack };
				break;
			}
			case 'object': {
				const properties = def.properties;
				if (properties === undefined) {
					break;
				}

				for (const key in properties) {
					stack = { value: properties[key], next: stack };
				}

				break;
			}
			case 'procedure': {
				if (def.input?.schema !== undefined) {
					stack = { value: def.input.schema, next: stack };
				}

				if (def.output?.schema !== undefined) {
					stack = { value: def.output.schema, next: stack };
				}

				break;
			}
			case 'subscription': {
				if (def.message?.schema !== undefined) {
					stack = { value: def.message.schema, next: stack };
				}

				break;
			}
			case 'query': {
				if (def.output?.schema !== undefined) {
					stack = { value: def.output.schema, next: stack };
				}

				break;
			}
		}
	}

	return refs;
};

const isValidExternalRef = (ref: string): boolean => {
	const hashIndex = ref.indexOf('#');
	return isNsid(hashIndex === -1 ? ref : ref.slice(0, hashIndex));
};

const getInternalDefId = (ref: string, docId: string): string | undefined => {
	const hashIndex = ref.indexOf('#');
	if (hashIndex === 0) {
		return ref.slice(1);
	}

	if (hashIndex !== docId.length) {
		return undefined;
	}

	if (!ref.startsWith(docId)) {
		return undefined;
	}

	return ref.slice(hashIndex + 1);
};
