import * as fs from 'node:fs/promises';

const LEXICONS_DIR = new URL('../lexicons/', import.meta.url);
const OUTPUT_PATH = new URL('../lib/limits.ts', import.meta.url);

// #region configuration

/**
 * @typedef Target
 * @property {string} nsid lexicon NSID
 * @property {string} name export name for the limits constant
 * @property {string} [def] specific def to use as root (defaults to 'main'), disables sub-def discovery
 */

/** @type {Target[]} lexicons to generate limits for, in output order */
const TARGETS = [
	// records
	{ nsid: 'app.bsky.actor.profile', name: 'actorProfile' },
	{ nsid: 'app.bsky.feed.generator', name: 'feedGenerator' },
	{ nsid: 'app.bsky.feed.post', name: 'feedPost' },
	{ nsid: 'app.bsky.feed.postgate', name: 'feedPostgate' },
	{ nsid: 'app.bsky.feed.threadgate', name: 'feedThreadgate' },
	{ nsid: 'app.bsky.graph.list', name: 'graphList' },
	{ nsid: 'app.bsky.graph.starterpack', name: 'graphStarterpack' },

	// embeds
	{ nsid: 'app.bsky.embed.external', name: 'embedExternal' },
	{ nsid: 'app.bsky.embed.gallery', name: 'embedGallery' },
	{ nsid: 'app.bsky.embed.images', name: 'embedImages' },
	{ nsid: 'app.bsky.embed.video', name: 'embedVideo' },

	// richtext
	{ nsid: 'app.bsky.richtext.facet', name: 'richtextFacet' },

	// chat
	{ nsid: 'chat.bsky.convo.defs', name: 'convoMessage', def: 'messageInput' },
];

// #endregion

// #region lexicon processing

/** @typedef {Record<string, number | Limits>} Limits */

/** @param {string} nsid */
const nsidToPath = (nsid) => {
	return new URL(nsid.replaceAll('.', '/') + '.json', LEXICONS_DIR);
};

/**
 * @param {string} name
 * @param {any} def
 */
const isDefExcluded = (name, def) => {
	if (name === 'main') {
		return false;
	}
	if (/^view/i.test(name)) {
		return true;
	}
	if (def.description && /\bdeprecated\b/i.test(def.description)) {
		return true;
	}
	return false;
};

/**
 * @param {any} prop
 * @returns {Limits | null}
 */
const extractPropertyLimits = (prop) => {
	/** @type {Limits} */
	const limits = {};

	switch (prop.type) {
		case 'string': {
			if (prop.maxGraphemes != null) {
				limits.maxGraphemes = prop.maxGraphemes;
			}
			if (prop.maxLength != null) {
				limits.maxLength = prop.maxLength;
			}
			if (prop.minGraphemes != null && prop.minGraphemes > 0) {
				limits.minGraphemes = prop.minGraphemes;
			}
			if (prop.minLength != null && prop.minLength > 0) {
				limits.minLength = prop.minLength;
			}
			break;
		}
		case 'integer': {
			if (prop.minimum != null && prop.minimum > 0) {
				limits.minimum = prop.minimum;
			}
			if (prop.maximum != null) {
				limits.maximum = prop.maximum;
			}
			break;
		}
		case 'blob': {
			if (prop.maxSize != null) {
				limits.maxSize = prop.maxSize;
			}
			break;
		}
		case 'array': {
			if (prop.maxLength != null) {
				limits.maxItems = prop.maxLength;
			}
			if (prop.minLength != null && prop.minLength > 0) {
				limits.minItems = prop.minLength;
			}
			// extract inline item constraints (non-ref, non-union items)
			if (prop.items && prop.items.type !== 'ref' && prop.items.type !== 'union') {
				const itemLimits = extractPropertyLimits(prop.items);
				if (itemLimits) {
					limits.item = itemLimits;
				}
			}
			break;
		}
	}

	return Object.keys(limits).length > 0 ? limits : null;
};

/**
 * @param {any} def
 * @returns {Limits | null}
 */
const extractDefLimits = (def) => {
	/** @type {Record<string, any> | undefined} */
	const properties = def.type === 'record' ? def.record?.properties : def.properties;

	if (!properties) {
		return null;
	}

	/** @type {Limits} */
	const limits = {};

	for (const [name, prop] of Object.entries(properties)) {
		const propLimits = extractPropertyLimits(prop);
		if (propLimits) {
			limits[name] = propLimits;
		}
	}

	return Object.keys(limits).length > 0 ? limits : null;
};

/**
 * @param {Target} target
 * @returns {Promise<{ name: string; nsid: string; limits: Limits } | null>}
 */
const processTarget = async (target) => {
	const content = await fs.readFile(nsidToPath(target.nsid), 'utf-8');
	const doc = JSON.parse(content);

	const rootName = target.def ?? 'main';
	const rootDef = doc.defs[rootName];

	if (!rootDef) {
		console.warn(`warning: def '${rootName}' not found in ${target.nsid}`);
		return null;
	}

	/** @type {Limits} */
	const limits = {};

	// extract from root def
	const rootLimits = extractDefLimits(rootDef);
	if (rootLimits) {
		Object.assign(limits, rootLimits);
	}

	// auto-discover sub-defs (only when no specific def is requested)
	if (!target.def) {
		for (const [name, def] of Object.entries(doc.defs)) {
			if (name === 'main' || isDefExcluded(name, def)) {
				continue;
			}

			const defLimits = extractDefLimits(def);
			if (defLimits) {
				limits[name] = defLimits;
			}
		}
	}

	if (Object.keys(limits).length === 0) {
		console.warn(`warning: no limits found for ${target.nsid}`);
		return null;
	}

	return { name: target.name, nsid: target.nsid, limits };
};

// #endregion

// #region code generation

/** @param {number} n */
const formatNumber = (n) => {
	if (n >= 1_000) {
		return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '_');
	}
	return n.toString();
};

/**
 * @param {Limits} obj
 * @param {number} indent
 */
const serializeLimits = (obj, indent) => {
	const entries = Object.entries(obj);
	const allNumeric = entries.every(([, v]) => typeof v === 'number');

	// inline short all-numeric objects
	if (allNumeric && entries.length <= 3) {
		const pairs = entries.map(([k, v]) => `${k}: ${formatNumber(/** @type {number} */ (v))}`);
		return `{ ${pairs.join(', ')} }`;
	}

	const tab = '\t'.repeat(indent);
	const lines = ['{'];

	for (const [key, value] of entries) {
		if (typeof value === 'number') {
			lines.push(`${tab}${key}: ${formatNumber(value)},`);
		} else {
			lines.push(`${tab}${key}: ${serializeLimits(/** @type {Limits} */ (value), indent + 1)},`);
		}
	}

	lines.push(`${'\t'.repeat(indent - 1)}}`);
	return lines.join('\n');
};

const generate = async () => {
	/** @type {{ name: string; nsid: string; limits: Limits }[]} */
	const results = [];

	for (const target of TARGETS) {
		const result = await processTarget(target);
		if (result) {
			results.push(result);
		}
	}

	const output = ['// this file is generated by scripts/generate-limits.js', '// do not edit manually', ''];

	for (const { name, nsid, limits } of results) {
		output.push(`/** limits for \`${nsid}\` */`);
		output.push(`export const ${name} = ${serializeLimits(limits, 1)} as const;`);
		output.push('');
	}

	await fs.writeFile(OUTPUT_PATH, output.join('\n'));
	console.log(`wrote ${results.length} limit exports to lib/limits.ts`);
};

generate();

// #endregion
