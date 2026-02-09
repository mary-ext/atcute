import { describe, expect, it } from 'vitest';

import type { LexiconDoc } from '../types.ts';

import { findExternalReferences, formatLexiconRef, parseLexiconRef } from './refs.ts';

describe('formatLexiconRef', () => {
	it('formats nsid with main defId as bare nsid', () => {
		const result = formatLexiconRef({ nsid: 'com.example.lexicon', defId: 'main' });
		expect(result).toBe('com.example.lexicon');
	});

	it('formats nsid with non-main defId as nsid#defId', () => {
		const result = formatLexiconRef({ nsid: 'com.example.lexicon', defId: 'viewerState' });
		expect(result).toBe('com.example.lexicon#viewerState');
	});

	it('formats as relative ref when context matches nsid', () => {
		const result = formatLexiconRef(
			{ nsid: 'com.example.lexicon', defId: 'viewerState' },
			'com.example.lexicon',
		);
		expect(result).toBe('#viewerState');
	});

	it('formats as absolute ref when context does not match', () => {
		const result = formatLexiconRef(
			{ nsid: 'com.example.lexicon', defId: 'viewerState' },
			'com.example.other',
		);
		expect(result).toBe('com.example.lexicon#viewerState');
	});

	it('formats main defId as relative when context matches', () => {
		const result = formatLexiconRef({ nsid: 'com.example.lexicon', defId: 'main' }, 'com.example.lexicon');
		expect(result).toBe('#main');
	});
});

describe('parseLexiconRef', () => {
	it('parses a bare NSID with defId defaulting to main', () => {
		const result = parseLexiconRef('com.example.lexicon');
		expect(result).toEqual({ nsid: 'com.example.lexicon', defId: 'main' });
	});

	it('parses an NSID with fragment', () => {
		const result = parseLexiconRef('com.example.lexicon#viewerState');
		expect(result).toEqual({ nsid: 'com.example.lexicon', defId: 'viewerState' });
	});

	it('parses a relative ref with context', () => {
		const result = parseLexiconRef('#viewerState', 'com.example.lexicon');
		expect(result).toEqual({ nsid: 'com.example.lexicon', defId: 'viewerState' });
	});

	it('throws on relative ref without context', () => {
		expect(() => parseLexiconRef('#viewerState')).toThrow('relative ref requires context nsid');
	});

	it('throws on invalid nsid', () => {
		expect(() => parseLexiconRef('invalid')).toThrow('invalid nsid');
	});

	it('throws on invalid nsid in ref with fragment', () => {
		expect(() => parseLexiconRef('invalid#main')).toThrow('invalid nsid in ref');
	});

	it('handles NSID with explicit #main fragment', () => {
		const result = parseLexiconRef('app.bsky.feed.post#main');
		expect(result).toEqual({ nsid: 'app.bsky.feed.post', defId: 'main' });
	});
});

describe('findExternalReferences', () => {
	it('returns empty set for document with no references', () => {
		const doc: LexiconDoc = {
			lexicon: 1,
			id: 'com.example.test',
			defs: {
				main: {
					type: 'object',
					properties: {
						name: { type: 'string' },
						age: { type: 'integer' },
					},
				},
			},
		};

		const refs = findExternalReferences(doc);
		expect(refs.size).toBe(0);
	});

	it('finds external references in ref types', () => {
		const doc: LexiconDoc = {
			lexicon: 1,
			id: 'com.example.test',
			defs: {
				main: {
					type: 'object',
					properties: {
						user: { type: 'ref', ref: 'com.example.user#main' },
					},
				},
			},
		};

		const refs = findExternalReferences(doc);
		expect(refs.size).toBe(1);
		expect(refs.has('com.example.user#main')).toBe(true);
	});

	it('finds external references in unions', () => {
		const doc: LexiconDoc = {
			lexicon: 1,
			id: 'com.example.test',
			defs: {
				main: {
					type: 'object',
					properties: {
						item: {
							type: 'union',
							refs: ['com.example.post#main', 'com.example.comment#main', 'com.example.like#main'],
							closed: false,
						},
					},
				},
			},
		};

		const refs = findExternalReferences(doc);
		expect(refs.size).toBe(3);
		expect(refs.has('com.example.post#main')).toBe(true);
		expect(refs.has('com.example.comment#main')).toBe(true);
		expect(refs.has('com.example.like#main')).toBe(true);
	});

	it('ignores internal hash references', () => {
		const doc: LexiconDoc = {
			lexicon: 1,
			id: 'com.example.test',
			defs: {
				main: {
					type: 'object',
					properties: {
						data: { type: 'ref', ref: '#otherDef' },
					},
				},
				otherDef: {
					type: 'object',
					properties: {
						value: { type: 'string' },
					},
				},
			},
		};

		const refs = findExternalReferences(doc);
		expect(refs.size).toBe(0);
	});

	it('ignores references to same document with full NSID', () => {
		const doc: LexiconDoc = {
			lexicon: 1,
			id: 'com.example.test',
			defs: {
				main: {
					type: 'object',
					properties: {
						data: { type: 'ref', ref: 'com.example.test#otherDef' },
					},
				},
				otherDef: {
					type: 'object',
					properties: {
						value: { type: 'string' },
					},
				},
			},
		};

		const refs = findExternalReferences(doc);
		expect(refs.size).toBe(0);
	});

	it('follows internal references to find external references', () => {
		const doc: LexiconDoc = {
			lexicon: 1,
			id: 'com.example.test',
			defs: {
				main: {
					type: 'object',
					properties: {
						data: { type: 'ref', ref: '#internalDef' },
					},
				},
				internalDef: {
					type: 'object',
					properties: {
						user: { type: 'ref', ref: 'com.example.user#main' },
					},
				},
			},
		};

		const refs = findExternalReferences(doc);
		expect(refs.size).toBe(1);
		expect(refs.has('com.example.user#main')).toBe(true);
	});

	it('handles circular references without infinite recursion', () => {
		const doc: LexiconDoc = {
			lexicon: 1,
			id: 'com.example.test',
			defs: {
				main: {
					type: 'object',
					properties: {
						data: { type: 'ref', ref: '#defA' },
					},
				},
				defA: {
					type: 'object',
					properties: {
						b: { type: 'ref', ref: '#defB' },
					},
				},
				defB: {
					type: 'object',
					properties: {
						// Circular reference back to defA
						a: { type: 'ref', ref: '#defA' },
					},
				},
			},
		};

		// Should not throw or hang
		const refs = findExternalReferences(doc);
		expect(refs.size).toBe(0);
	});

	it('handles self-referential circular references', () => {
		const doc: LexiconDoc = {
			lexicon: 1,
			id: 'com.example.test',
			defs: {
				main: {
					type: 'object',
					properties: {
						// Self reference
						child: { type: 'ref', ref: '#main' },
					},
				},
			},
		};

		// Should not throw or hang
		const refs = findExternalReferences(doc);
		expect(refs.size).toBe(0);
	});

	it('handles circular references with full NSID', () => {
		const doc: LexiconDoc = {
			lexicon: 1,
			id: 'com.example.test',
			defs: {
				main: {
					type: 'object',
					properties: {
						data: { type: 'ref', ref: 'com.example.test#defA' },
					},
				},
				defA: {
					type: 'object',
					properties: {
						// Circular reference using full NSID
						back: { type: 'ref', ref: 'com.example.test#main' },
					},
				},
			},
		};

		// Should not throw or hang
		const refs = findExternalReferences(doc);
		expect(refs.size).toBe(0);
	});

	it('handles circular references in unions', () => {
		const doc: LexiconDoc = {
			lexicon: 1,
			id: 'com.example.test',
			defs: {
				main: {
					type: 'object',
					properties: {
						data: {
							type: 'union',
							refs: ['#defA', '#defB'],
							closed: false,
						},
					},
				},
				defA: {
					type: 'object',
					properties: {
						item: {
							type: 'union',
							refs: ['#defB', '#main'],
							closed: false,
						},
					},
				},
				defB: {
					type: 'object',
					properties: {
						item: {
							type: 'union',
							refs: ['#defA', 'com.example.external#main'],
							closed: false,
						},
					},
				},
			},
		};

		// Should not throw or hang, and should find the external ref
		const refs = findExternalReferences(doc);
		expect(refs.size).toBe(1);
		expect(refs.has('com.example.external#main')).toBe(true);
	});

	it('finds references in arrays', () => {
		const doc: LexiconDoc = {
			lexicon: 1,
			id: 'com.example.test',
			defs: {
				main: {
					type: 'object',
					properties: {
						items: {
							type: 'array',
							items: { type: 'ref', ref: 'com.example.item#main' },
						},
					},
				},
			},
		};

		const refs = findExternalReferences(doc);
		expect(refs.size).toBe(1);
		expect(refs.has('com.example.item#main')).toBe(true);
	});

	it('finds references in procedures', () => {
		const doc: LexiconDoc = {
			lexicon: 1,
			id: 'com.example.test',
			defs: {
				main: {
					type: 'procedure',
					input: {
						encoding: 'application/json',
						schema: {
							type: 'object',
							properties: {
								user: { type: 'ref', ref: 'com.example.user#main' },
							},
						},
					},
					output: {
						encoding: 'application/json',
						schema: {
							type: 'object',
							properties: {
								result: { type: 'ref', ref: 'com.example.result#main' },
							},
						},
					},
				},
			},
		};

		const refs = findExternalReferences(doc);
		expect(refs.size).toBe(2);
		expect(refs.has('com.example.user#main')).toBe(true);
		expect(refs.has('com.example.result#main')).toBe(true);
	});

	it('finds references in queries', () => {
		const doc: LexiconDoc = {
			lexicon: 1,
			id: 'com.example.test',
			defs: {
				main: {
					type: 'query',
					output: {
						encoding: 'application/json',
						schema: {
							type: 'object',
							properties: {
								data: { type: 'ref', ref: 'com.example.data#main' },
							},
						},
					},
				},
			},
		};

		const refs = findExternalReferences(doc);
		expect(refs.size).toBe(1);
		expect(refs.has('com.example.data#main')).toBe(true);
	});

	it('finds references in subscriptions', () => {
		const doc: LexiconDoc = {
			lexicon: 1,
			id: 'com.example.test',
			defs: {
				main: {
					type: 'subscription',
					message: {
						schema: {
							type: 'union',
							refs: ['com.example.event#main'],
						},
					},
				},
			},
		};

		const refs = findExternalReferences(doc);
		expect(refs.size).toBe(1);
		expect(refs.has('com.example.event#main')).toBe(true);
	});

	it('finds references in records', () => {
		const doc: LexiconDoc = {
			lexicon: 1,
			id: 'com.example.test',
			defs: {
				main: {
					type: 'record',
					key: 'tid',
					record: {
						type: 'object',
						properties: {
							author: { type: 'ref', ref: 'com.example.author#main' },
						},
					},
				},
			},
		};

		const refs = findExternalReferences(doc);
		expect(refs.size).toBe(1);
		expect(refs.has('com.example.author#main')).toBe(true);
	});

	it('finds references when specifying a specific defId', () => {
		const doc: LexiconDoc = {
			lexicon: 1,
			id: 'com.example.test',
			defs: {
				main: {
					type: 'object',
					properties: {
						data: { type: 'ref', ref: 'com.example.data#main' },
					},
				},
				other: {
					type: 'object',
					properties: {
						user: { type: 'ref', ref: 'com.example.user#main' },
					},
				},
			},
		};

		const refs = findExternalReferences(doc, 'other');
		expect(refs.size).toBe(1);
		expect(refs.has('com.example.user#main')).toBe(true);
		expect(refs.has('com.example.data#main')).toBe(false);
	});

	it('deduplicates external references', () => {
		const doc: LexiconDoc = {
			lexicon: 1,
			id: 'com.example.test',
			defs: {
				main: {
					type: 'object',
					properties: {
						user1: { type: 'ref', ref: 'com.example.user#main' },
						user2: { type: 'ref', ref: 'com.example.user#main' },
						user3: { type: 'ref', ref: 'com.example.user#main' },
					},
				},
			},
		};

		const refs = findExternalReferences(doc);
		expect(refs.size).toBe(1);
		expect(refs.has('com.example.user#main')).toBe(true);
	});

	it('handles complex nested circular references with external refs', () => {
		const doc: LexiconDoc = {
			lexicon: 1,
			id: 'com.example.test',
			defs: {
				main: {
					type: 'object',
					properties: {
						tree: { type: 'ref', ref: '#treeNode' },
					},
				},
				treeNode: {
					type: 'object',
					properties: {
						value: { type: 'string' },
						children: {
							type: 'array',
							items: { type: 'ref', ref: '#treeNode' },
						},
						metadata: { type: 'ref', ref: 'com.example.metadata#main' },
					},
				},
			},
		};

		const refs = findExternalReferences(doc);
		expect(refs.size).toBe(1);
		expect(refs.has('com.example.metadata#main')).toBe(true);
	});

	it('handles missing definition gracefully', () => {
		const doc: LexiconDoc = {
			lexicon: 1,
			id: 'com.example.test',
			defs: {
				main: {
					type: 'object',
					properties: {
						data: { type: 'ref', ref: '#nonExistent' },
					},
				},
			},
		};

		const refs = findExternalReferences(doc);
		expect(refs.size).toBe(0);
	});

	it('handles non-existent defId parameter', () => {
		const doc: LexiconDoc = {
			lexicon: 1,
			id: 'com.example.test',
			defs: {
				main: {
					type: 'object',
					properties: {
						data: { type: 'ref', ref: 'com.example.data#main' },
					},
				},
			},
		};

		const refs = findExternalReferences(doc, 'nonExistent');
		expect(refs.size).toBe(0);
	});
});
