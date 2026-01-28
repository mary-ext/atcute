/**
 * blob permission parsing and matching
 *
 * syntax: `blob:<accept>[?accept=<accept>]`
 * - accept: MIME type pattern (e.g., 'image/*', '*\/*', 'image/png')
 */

import { isAccept, isRedundantAccept, matchesAccept } from '../mime.js';

import {
	formatScopeString,
	getMultiParam,
	hasUnknownParams,
	hasScopePrefix,
	parseScopeString,
	type NeRoArray,
	type ScopeSyntax,
} from '../syntax.js';

// #region types

export type Accept = string;

export interface BlobPermissionMatch {
	mime: string;
}

// #endregion

// #region validation

const KNOWN_KEYS = new Set(['accept']);

// #endregion

// #region permission class

export class BlobPermission {
	constructor(readonly accept: NeRoArray<Accept>) {}

	/**
	 * checks if this permission covers the requested MIME type
	 */
	matches(request: BlobPermissionMatch): boolean {
		for (const accept of this.accept) {
			if (matchesAccept(accept, request.mime)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * formats this permission as a scope string
	 */
	toString(): string {
		const accept = normalizeAccept(this.accept);

		const params = new URLSearchParams();

		// use positional for single accept
		let positional: string | undefined;
		if (accept.length === 1) {
			positional = accept[0];
		} else {
			for (const a of accept) {
				params.append('accept', a);
			}
		}

		return formatScopeString({ prefix: 'blob', positional, params });
	}

	/**
	 * parses a scope string into a BlobPermission
	 * @returns the permission or null if invalid
	 */
	static fromString(scope: string): BlobPermission | null {
		if (!hasScopePrefix(scope, 'blob')) {
			return null;
		}
		return BlobPermission.fromSyntax(parseScopeString(scope));
	}

	/**
	 * parses a pre-parsed scope syntax into a BlobPermission
	 * @returns the permission or null if invalid
	 */
	static fromSyntax(syntax: ScopeSyntax): BlobPermission | null {
		if (syntax.prefix !== 'blob') {
			return null;
		}

		// reject unknown parameters
		if (hasUnknownParams(syntax, KNOWN_KEYS)) {
			return null;
		}

		// parse accept (required)
		const acceptRaw = getMultiParam(syntax, 'accept', 'accept');
		if (acceptRaw === null || acceptRaw === undefined || acceptRaw.length === 0) {
			return null;
		}

		// validate all accept values
		for (const a of acceptRaw) {
			if (!isAccept(a)) {
				return null;
			}
		}

		const accept = normalizeAccept(acceptRaw as NeRoArray<Accept>);

		return new BlobPermission(accept);
	}

	/**
	 * generates the minimal scope string needed for the given MIME type
	 */
	static scopeNeededFor(request: BlobPermissionMatch): string {
		return new BlobPermission([request.mime]).toString();
	}
}

// #endregion

// #region normalization

const normalizeAccept = (value: NeRoArray<Accept>): NeRoArray<Accept> => {
	// full wildcard subsumes all
	if (value.includes('*/*')) {
		return ['*/*'];
	}

	if (value.length === 1) {
		return [value[0].toLowerCase()] as NeRoArray<Accept>;
	}

	// lowercase all values
	const lower = value.map((a) => a.toLowerCase());

	// remove redundant values (e.g., image/png is redundant if image/* is present)
	const filtered: string[] = [];
	for (const accept of lower) {
		let redundant = false;
		for (const other of lower) {
			if (accept !== other && isRedundantAccept(accept, other)) {
				redundant = true;
				break;
			}
		}
		if (!redundant && !filtered.includes(accept)) {
			filtered.push(accept);
		}
	}

	// sort for canonical output, cast is safe because input is non-empty
	filtered.sort();

	return filtered as unknown as NeRoArray<Accept>;
};

// #endregion
