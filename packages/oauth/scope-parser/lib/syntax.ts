/**
 * scope string syntax parsing
 *
 * parses scope strings in the format: `<prefix>[:<positional>][?<params>]`
 * examples:
 * - `repo:com.example.foo`
 * - `rpc:app.bsky.feed.getFeed?aud=*`
 * - `blob?accept=image/png&accept=image/jpeg`
 */

// #region types

/** non-empty readonly array */
export type NeRoArray<T> = readonly [T, ...T[]];

/** parsed scope syntax */
export interface ScopeSyntax {
	readonly prefix: string;
	readonly positional: string | undefined;
	readonly params: URLSearchParams | undefined;
}

// #endregion

// #region parsing

/**
 * parses a scope string into its components
 * @param scope the scope string to parse
 * @returns parsed scope syntax
 */
export const parseScopeString = (scope: string): ScopeSyntax => {
	const paramIdx = scope.indexOf('?');
	const colonIdx = scope.indexOf(':');
	const prefixEnd = minIdx(paramIdx, colonIdx);

	if (prefixEnd === -1) {
		return { prefix: scope, positional: undefined, params: undefined };
	}

	const prefix = scope.slice(0, prefixEnd);

	// parse positional: appears after : but before ?
	let positional: string | undefined;
	if (colonIdx !== -1) {
		if (paramIdx === -1) {
			positional = decodeURIComponent(scope.slice(colonIdx + 1));
		} else if (colonIdx < paramIdx) {
			positional = decodeURIComponent(scope.slice(colonIdx + 1, paramIdx));
		}
	}

	// parse query string
	const params =
		paramIdx !== -1 && paramIdx < scope.length - 1 ? new URLSearchParams(scope.slice(paramIdx + 1)) : undefined;

	return { prefix, positional, params };
};

/**
 * checks if a scope string starts with a given prefix
 * @param scope the scope string
 * @param prefix the prefix to check
 * @returns true if scope has the given prefix
 */
export const hasScopePrefix = (scope: string, prefix: string): boolean => {
	if (!scope.startsWith(prefix)) {
		return false;
	}

	const len = prefix.length;
	if (scope.length === len) {
		return true;
	}

	const char = scope.charCodeAt(len);
	// must be followed by : or ?
	return char === 0x3a /* : */ || char === 0x3f /* ? */;
};

// #endregion

// #region formatting

// characters that should remain unencoded in scope strings
const NORMALIZABLE_CHARS: Record<string, string> = {
	'%3A': ':',
	'%3a': ':',
	'%2F': '/',
	'%2f': '/',
	'%2B': '+',
	'%2b': '+',
	'%2C': ',',
	'%2c': ',',
	'%40': '@',
};

/**
 * normalizes URL encoding for scope strings
 * keeps certain characters unencoded for readability while ensuring # stays encoded
 */
const normalizeEncoding = (value: string): string => {
	let end = value.length - 2;

	for (let i = 0; i < end; i++) {
		if (value.charCodeAt(i) === 0x25 /* % */) {
			const encoded = value.slice(i, i + 3);
			const normalized = NORMALIZABLE_CHARS[encoded];

			if (normalized) {
				value = value.slice(0, i) + normalized + value.slice(i + 3);
				end -= 2;
			}
		}
	}

	return value;
};

export interface FormatScopeOptions {
	/** the scope prefix (e.g., 'repo', 'rpc') */
	prefix: string;
	/** optional positional value */
	positional?: string;
	/** optional query parameters */
	params?: URLSearchParams;
}

/**
 * formats a scope string from its components
 * @param options the components to format
 * @returns formatted scope string
 */
export const formatScopeString = (options: FormatScopeOptions): string => {
	const { prefix, positional, params } = options;

	let scope = prefix;

	if (positional !== undefined) {
		scope += ':' + normalizeEncoding(encodeURIComponent(positional));
	}

	if (params && params.size > 0) {
		scope += '?' + normalizeEncoding(params.toString());
	}

	return scope;
};

// #endregion

// #region helpers

const minIdx = (a: number, b: number): number => {
	if (a === -1) {
		return b;
	}
	if (b === -1) {
		return a;
	}
	return Math.min(a, b);
};

/**
 * gets a single value from parsed scope params
 * @returns the value, undefined if not present, or null if multiple values exist
 */
export const getSingleParam = (
	syntax: ScopeSyntax,
	key: string,
	positionalKey?: string,
): string | null | undefined => {
	// check positional first
	if (key === positionalKey && syntax.positional !== undefined) {
		// can't have both positional and named param
		if (syntax.params?.has(key)) {
			return null;
		}
		return syntax.positional;
	}

	if (!syntax.params?.has(key)) {
		return undefined;
	}

	const values = syntax.params.getAll(key);
	if (values.length > 1) {
		return null;
	}
	return values[0];
};

/**
 * gets multiple values from parsed scope params
 * @returns array of values, undefined if not present
 */
export const getMultiParam = (
	syntax: ScopeSyntax,
	key: string,
	positionalKey?: string,
): readonly string[] | null | undefined => {
	// check positional first
	if (key === positionalKey && syntax.positional !== undefined) {
		// can't have both positional and named param
		if (syntax.params?.has(key)) {
			return null;
		}
		return [syntax.positional];
	}

	if (!syntax.params?.has(key)) {
		return undefined;
	}

	return syntax.params.getAll(key);
};

/**
 * checks if parsed scope has any unknown parameters
 * @param syntax the parsed scope
 * @param knownKeys set of known parameter keys
 * @returns true if there are unknown parameters
 */
export const hasUnknownParams = (syntax: ScopeSyntax, knownKeys: ReadonlySet<string>): boolean => {
	if (!syntax.params) {
		return false;
	}

	for (const key of syntax.params.keys()) {
		if (!knownKeys.has(key)) {
			return true;
		}
	}
	return false;
};

// #endregion
