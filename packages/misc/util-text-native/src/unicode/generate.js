/**
 * generates grapheme break property lookup tables from UCD data files.
 *
 * to update Unicode version: 1. download new UCD files from https://www.unicode.org/Public/UCD/latest/ucd/ -
 * GraphemeBreakProperty.txt - DerivedCoreProperties.txt - emoji/emoji-data.txt -
 * auxiliary/GraphemeBreakTest.txt 2. place them in data/ 3. run: node generate.js > grapheme-table.h
 */

import { readFileSync, writeFileSync } from 'node:fs';

const MAX_CP = 0x110000;

// #region property definitions

// property enum values — order must match grapheme.c's break rule tables
const PROPS = [
	'OTHER',
	'BOTH_EXTEND_ICB_EXTEND',
	'BOTH_EXTEND_ICB_LINKER',
	'BOTH_ZWJ_ICB_EXTEND',
	'CONTROL',
	'CR',
	'EXTEND',
	'EXTENDED_PICTOGRAPHIC',
	'HANGUL_L',
	'HANGUL_V',
	'HANGUL_T',
	'HANGUL_LV',
	'HANGUL_LVT',
	'ICB_CONSONANT',
	'ICB_EXTEND',
	'ICB_LINKER',
	'LF',
	'PREPEND',
	'REGIONAL_INDICATOR',
	'SPACINGMARK',
	'ZWJ',
];

if (PROPS.length > 32) {
	throw new Error(`too many properties (${PROPS.length}) — bitmask tables in grapheme.c are limited to 32`);
}

const PROP_INDEX = Object.fromEntries(PROPS.map((name, i) => [name, i]));

// which UCD files and property names map to which enum value
const SOURCES = [
	{ prop: 'CONTROL', file: 'data/GraphemeBreakProperty.txt', name: 'Control' },
	{ prop: 'CR', file: 'data/GraphemeBreakProperty.txt', name: 'CR' },
	{ prop: 'EXTEND', file: 'data/GraphemeBreakProperty.txt', name: 'Extend' },
	{ prop: 'EXTENDED_PICTOGRAPHIC', file: 'data/emoji-data.txt', name: 'Extended_Pictographic' },
	{ prop: 'HANGUL_L', file: 'data/GraphemeBreakProperty.txt', name: 'L' },
	{ prop: 'HANGUL_V', file: 'data/GraphemeBreakProperty.txt', name: 'V' },
	{ prop: 'HANGUL_T', file: 'data/GraphemeBreakProperty.txt', name: 'T' },
	{ prop: 'HANGUL_LV', file: 'data/GraphemeBreakProperty.txt', name: 'LV' },
	{ prop: 'HANGUL_LVT', file: 'data/GraphemeBreakProperty.txt', name: 'LVT' },
	{ prop: 'ICB_CONSONANT', file: 'data/DerivedCoreProperties.txt', name: 'InCB', subname: 'Consonant' },
	{ prop: 'ICB_EXTEND', file: 'data/DerivedCoreProperties.txt', name: 'InCB', subname: 'Extend' },
	{ prop: 'ICB_LINKER', file: 'data/DerivedCoreProperties.txt', name: 'InCB', subname: 'Linker' },
	{ prop: 'LF', file: 'data/GraphemeBreakProperty.txt', name: 'LF' },
	{ prop: 'PREPEND', file: 'data/GraphemeBreakProperty.txt', name: 'Prepend' },
	{ prop: 'REGIONAL_INDICATOR', file: 'data/GraphemeBreakProperty.txt', name: 'Regional_Indicator' },
	{ prop: 'SPACINGMARK', file: 'data/GraphemeBreakProperty.txt', name: 'SpacingMark' },
	{ prop: 'ZWJ', file: 'data/GraphemeBreakProperty.txt', name: 'ZWJ' },
];

// #endregion

// #region UCD parsing

/** parses a UCD file and calls cb(lower, upper, propName, subName) for each entry */
const parseUcdFile = (path, cb) => {
	const text = readFileSync(path, 'utf-8');

	for (const line of text.split('\n')) {
		const commentIdx = line.indexOf('#');
		const content = (commentIdx >= 0 ? line.slice(0, commentIdx) : line).trim();
		if (!content) {
			continue;
		}

		const fields = content.split(';').map((f) => f.trim());
		if (fields.length < 2) {
			continue;
		}

		const range = fields[0];
		const propName = fields[1];
		const subName = fields[2] || null;

		let lower, upper;
		const dotDot = range.indexOf('..');
		if (dotDot >= 0) {
			lower = parseInt(range.slice(0, dotDot), 16);
			upper = parseInt(range.slice(dotDot + 2), 16);
		} else {
			lower = upper = parseInt(range, 16);
		}

		cb(lower, upper, propName, subName);
	}
};

// #endregion

// #region table generation

// allocate property array, initialize to "unset"
const UNSET = PROPS.length;
const props = new Uint8Array(MAX_CP).fill(UNSET);

// conflict resolution: some codepoints have multiple properties
const resolveConflict = (cp, existing, incoming) => {
	const a = PROPS[existing];
	const b = PROPS[incoming];
	const pair = [a, b].toSorted().join('+');

	switch (pair) {
		case 'EXTEND+ICB_EXTEND': {
			return PROP_INDEX['BOTH_EXTEND_ICB_EXTEND'];
		}
		case 'EXTEND+ICB_LINKER': {
			return PROP_INDEX['BOTH_EXTEND_ICB_LINKER'];
		}
		case 'ICB_EXTEND+ZWJ': {
			return PROP_INDEX['BOTH_ZWJ_ICB_EXTEND'];
		}
		default: {
			throw new Error(`unhandled conflict at U+${cp.toString(16).padStart(4, '0')}: ${a} + ${b}`);
		}
	}
};

// known property names that we intentionally ignore from each file
const IGNORED_PROPS = {
	'data/GraphemeBreakProperty.txt': new Set(),
	'data/DerivedCoreProperties.txt': new Set([
		'Alphabetic',
		'Lowercase',
		'Uppercase',
		'Cased',
		'Case_Ignorable',
		'Changes_When_Lowercased',
		'Changes_When_Uppercased',
		'Changes_When_Titlecased',
		'Changes_When_Casefolded',
		'Changes_When_Casemapped',
		'ID_Start',
		'ID_Continue',
		'XID_Start',
		'XID_Continue',
		'Default_Ignorable_Code_Point',
		'Grapheme_Extend',
		'Grapheme_Base',
		'Grapheme_Link',
		'Math',
		'Modifier_Combining_Mark',
		'Indic_Conjunct_Break',
	]),
	'data/emoji-data.txt': new Set([
		'Emoji',
		'Emoji_Presentation',
		'Emoji_Modifier',
		'Emoji_Modifier_Base',
		'Emoji_Component',
		'Basic_Emoji',
		'Emoji_Keycap_Sequence',
		'RGI_Emoji_Modifier_Sequence',
		'RGI_Emoji_Flag_Sequence',
		'RGI_Emoji_Tag_Sequence',
		'RGI_Emoji_ZWJ_Sequence',
		'RGI_Emoji',
	]),
};

// parse all source files
{
	const parsed = new Set();
	const matchedSources = new Set();
	const unknownProps = new Map();

	for (const src of SOURCES) {
		if (parsed.has(src.file)) {
			continue;
		}
		parsed.add(src.file);

		const ignored = IGNORED_PROPS[src.file] ?? new Set();

		parseUcdFile(src.file, (lower, upper, propName, subName) => {
			// find which source entry matches this line
			let matched = false;
			for (const s of SOURCES) {
				if (s.file !== src.file || s.name !== propName) {
					continue;
				}
				if (s.subname && s.subname !== subName) {
					continue;
				}

				matched = true;
				matchedSources.add(s);
				const propIdx = PROP_INDEX[s.prop];
				for (let cp = lower; cp <= upper; cp++) {
					if (props[cp] !== UNSET && props[cp] !== propIdx) {
						props[cp] = resolveConflict(cp, props[cp], propIdx);
					} else {
						props[cp] = propIdx;
					}
				}
				break;
			}

			if (!matched && !ignored.has(propName)) {
				const key = subName ? `${propName};${subName}` : propName;
				if (!unknownProps.has(src.file)) {
					unknownProps.set(src.file, new Set());
				}
				unknownProps.get(src.file).add(key);
			}
		});
	}

	// fail-closed: detect unknown properties that may need handling
	if (unknownProps.size > 0) {
		for (const [file, props] of unknownProps) {
			process.stderr.write(`WARNING: unknown properties in ${file}: ${[...props].join(', ')}\n`);
		}
		throw new Error(`unknown properties found in input files — update SOURCES or IGNORED_PROPS`);
	}

	// detect SOURCES entries that matched nothing (stale or renamed)
	for (const src of SOURCES) {
		if (!matchedSources.has(src)) {
			const name = src.subname ? `${src.name};${src.subname}` : src.name;
			process.stderr.write(`WARNING: SOURCES entry matched nothing: ${src.prop} (${name} in ${src.file})\n`);
		}
	}
}

// fill unset codepoints with OTHER
for (let i = 0; i < MAX_CP; i++) {
	if (props[i] === UNSET) {
		props[i] = 0; // OTHER
	}
}

// two-stage table compression
// major[cp >> 8] gives offset into minor, minor[offset + (cp & 0xFF)] gives property
const major = Array.from({ length: 0x1100 });
let minor = [];
let compressionCount = 0;

for (let i = 0; i < 0x1100; i++) {
	const block = props.subarray(i << 8, (i << 8) + 0x100);

	// check if this 256-entry block already exists in minor
	let found = -1;
	search: for (let j = 0; j + 0xff < minor.length; j++) {
		for (let k = 0; k < 0x100; k++) {
			if (minor[j + k] !== block[k]) {
				continue search;
			}
		}
		found = j;
		break;
	}

	if (found >= 0) {
		major[i] = found;
		compressionCount++;
	} else {
		major[i] = minor.length;
		minor = minor.concat(Array.from(block));
	}
}

const ratio = ((compressionCount / 0x1100) * 100).toFixed(2);
process.stderr.write(`compression ratio: ${ratio}% (${minor.length} minor entries)\n`);

// #endregion

// #region output

const chooseType = (maxVal) => {
	if (maxVal <= 0xff) {
		return 'uint_least8_t';
	}
	if (maxVal <= 0xffff) {
		return 'uint_least16_t';
	}
	return 'uint_least32_t';
};

const formatArray = (name, data) => {
	let maxVal = 0;
	for (const value of data) {
		if (value > maxVal) {
			maxVal = value;
		}
	}
	const type = chooseType(maxVal);
	let out = `static const ${type} ${name}[] = {\n\t`;

	for (let i = 0; i < data.length; i++) {
		out += String(data[i]);
		if (i + 1 < data.length) {
			out += (i + 1) % 8 === 0 ? ',\n\t' : ', ';
		}
	}

	return out + '\n};\n';
};

let output = `/* automatically generated by generate.js — do not edit */\n`;
output += `#include <stdint.h>\n\n`;

// enum
output += `enum char_break_property {\n`;
for (const name of PROPS) {
	output += `\tCHAR_BREAK_PROP_${name},\n`;
}
output += `\tNUM_CHAR_BREAK_PROPS,\n};\n\n`;

// tables — a single two-stage (major/minor) table covers the whole codepoint range, including
// the BMP, so no separate direct BMP table is emitted
output += formatArray('char_break_major', major);
output += '\n';
output += formatArray('char_break_minor', minor);

writeFileSync('grapheme-table.h', output);
process.stderr.write(`wrote grapheme-table.h\n`);

// #endregion
