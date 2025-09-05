import type { LexiconDoc, LexRefVariant, LexUserType } from '../schema.js';

type SchemaValue = LexUserType | LexRefVariant;

export const findExternalReferences = (doc: LexiconDoc): string[] => {
	const refs = new Set<string>();

	const extract = (def: SchemaValue): void => {
		switch (def.type) {
			case 'ref': {
				const ref = def.ref;
				if (ref.startsWith('#')) {
					break;
				}

				const nsid = stripHash(ref);
				if (nsid === doc.id) {
					break;
				}

				refs.add(nsid);
				break;
			}
			case 'union': {
				for (const ref of def.refs) {
					if (ref.startsWith('#')) {
						continue;
					}

					const nsid = stripHash(ref);
					if (nsid === doc.id) {
						continue;
					}

					refs.add(nsid);
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

	for (const def of Object.values(doc.defs)) {
		extract(def);
	}

	return Array.from(refs).sort();
};

const stripHash = (defUri: string): string => {
	const index = defUri.indexOf('#');
	if (index === -1) {
		return defUri;
	}

	return defUri.slice(0, index);
};
