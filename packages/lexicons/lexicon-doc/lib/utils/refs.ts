import type { LexiconDoc, LexRefVariant, LexUserType } from '../schema.js';

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
