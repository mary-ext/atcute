/**
 * identity permission parsing and matching
 *
 * syntax: `identity:<attr>`
 * - attr: 'handle' or '*' for all
 *
 * no action parameter is supported for identity permissions
 */

import {
	formatScopeString,
	getSingleParam,
	hasUnknownParams,
	hasScopePrefix,
	parseScopeString,
	type ScopeSyntax,
} from '../syntax.js';

// #region types

export const IDENTITY_ATTRIBUTES = ['handle', '*'] as const;
export type IdentityAttr = (typeof IDENTITY_ATTRIBUTES)[number];

export interface IdentityPermissionMatch {
	attr: IdentityAttr;
}

// #endregion

// #region validation

const KNOWN_KEYS = new Set(['attr']);

const isIdentityAttr = (value: unknown): value is IdentityAttr => {
	return value === 'handle' || value === '*';
};

// #endregion

// #region permission class

export class IdentityPermission {
	constructor(readonly attr: IdentityAttr) {}

	/**
	 * checks if this permission covers the requested access
	 * note: '*' attr covers all attributes including 'handle'
	 */
	matches(request: IdentityPermissionMatch): boolean {
		if (this.attr === '*') {
			return true;
		}
		return this.attr === request.attr;
	}

	/**
	 * formats this permission as a scope string
	 */
	toString(): string {
		return formatScopeString({ prefix: 'identity', positional: this.attr });
	}

	/**
	 * parses a scope string into an IdentityPermission
	 * @returns the permission or null if invalid
	 */
	static fromString(scope: string): IdentityPermission | null {
		if (!hasScopePrefix(scope, 'identity')) {
			return null;
		}
		return IdentityPermission.fromSyntax(parseScopeString(scope));
	}

	/**
	 * parses a pre-parsed scope syntax into an IdentityPermission
	 * @returns the permission or null if invalid
	 */
	static fromSyntax(syntax: ScopeSyntax): IdentityPermission | null {
		if (syntax.prefix !== 'identity') {
			return null;
		}

		// reject unknown parameters (including action)
		if (hasUnknownParams(syntax, KNOWN_KEYS)) {
			return null;
		}

		// parse attr (required, positional)
		const attrRaw = getSingleParam(syntax, 'attr', 'attr');
		if (attrRaw === null || attrRaw === undefined) {
			return null;
		}
		if (!isIdentityAttr(attrRaw)) {
			return null;
		}

		return new IdentityPermission(attrRaw);
	}

	/**
	 * generates the minimal scope string needed for the given access
	 */
	static scopeNeededFor(request: IdentityPermissionMatch): string {
		return new IdentityPermission(request.attr).toString();
	}
}

// #endregion
