/**
 * account permission parsing and matching
 *
 * syntax: `account:<attr>[?action=<action>]`
 * - attr: 'email', 'repo', or 'status'
 * - action: 'read' or 'manage' (defaults to 'read')
 *
 * note: 'manage' action implies 'read' access
 */

import {
	formatScopeString,
	getMultiParam,
	getSingleParam,
	hasUnknownParams,
	hasScopePrefix,
	parseScopeString,
	type NeRoArray,
	type ScopeSyntax,
} from '../syntax.js';

// #region types

export const ACCOUNT_ATTRIBUTES = ['email', 'repo', 'status'] as const;
export type AccountAttr = (typeof ACCOUNT_ATTRIBUTES)[number];

export const ACCOUNT_ACTIONS = ['read', 'manage'] as const;
export type AccountAction = (typeof ACCOUNT_ACTIONS)[number];

export interface AccountPermissionMatch {
	attr: AccountAttr;
	action: AccountAction;
}

// #endregion

// #region validation

const KNOWN_KEYS = new Set(['attr', 'action']);

const isAccountAttr = (value: unknown): value is AccountAttr => {
	return value === 'email' || value === 'repo' || value === 'status';
};

const isAccountAction = (value: unknown): value is AccountAction => {
	return value === 'read' || value === 'manage';
};

// #endregion

// #region permission class

export class AccountPermission {
	constructor(
		readonly attr: AccountAttr,
		readonly action: NeRoArray<AccountAction>,
	) {}

	/**
	 * checks if this permission covers the requested access
	 * note: 'manage' action implies 'read' access
	 */
	matches(request: AccountPermissionMatch): boolean {
		if (this.attr !== request.attr) {
			return false;
		}

		// manage implies read
		if (this.action.includes('manage')) {
			return true;
		}

		return this.action.includes(request.action);
	}

	/**
	 * formats this permission as a scope string
	 */
	toString(): string {
		const params = new URLSearchParams();

		// omit action if it's the default (read only)
		if (!(this.action.length === 1 && this.action[0] === 'read')) {
			for (const a of this.action) {
				params.append('action', a);
			}
		}

		return formatScopeString({ prefix: 'account', positional: this.attr, params });
	}

	/**
	 * parses a scope string into an AccountPermission
	 * @returns the permission or null if invalid
	 */
	static fromString(scope: string): AccountPermission | null {
		if (!hasScopePrefix(scope, 'account')) {
			return null;
		}
		return AccountPermission.fromSyntax(parseScopeString(scope));
	}

	/**
	 * parses a pre-parsed scope syntax into an AccountPermission
	 * @returns the permission or null if invalid
	 */
	static fromSyntax(syntax: ScopeSyntax): AccountPermission | null {
		if (syntax.prefix !== 'account') {
			return null;
		}

		// reject unknown parameters
		if (hasUnknownParams(syntax, KNOWN_KEYS)) {
			return null;
		}

		// parse attr (required, positional)
		const attrRaw = getSingleParam(syntax, 'attr', 'attr');
		if (attrRaw === null || attrRaw === undefined) {
			return null;
		}
		if (!isAccountAttr(attrRaw)) {
			return null;
		}

		// parse action (optional, defaults to 'read')
		const actionRaw = getMultiParam(syntax, 'action');
		let action: NeRoArray<AccountAction>;

		if (actionRaw === null) {
			return null;
		} else if (actionRaw === undefined || actionRaw.length === 0) {
			action = ['read'];
		} else {
			// validate all action values
			for (const a of actionRaw) {
				if (!isAccountAction(a)) {
					return null;
				}
			}
			action = normalizeAction(actionRaw as NeRoArray<AccountAction>);
		}

		return new AccountPermission(attrRaw, action);
	}

	/**
	 * generates the minimal scope string needed for the given access
	 */
	static scopeNeededFor(request: AccountPermissionMatch): string {
		return new AccountPermission(request.attr, [request.action]).toString();
	}
}

// #endregion

// #region normalization

const normalizeAction = (value: NeRoArray<AccountAction>): NeRoArray<AccountAction> => {
	if (value.length === 1) {
		return value;
	}

	// filter to canonical order, cast is safe because input is non-empty
	const filtered = ACCOUNT_ACTIONS.filter((a) => value.includes(a));
	return filtered as unknown as NeRoArray<AccountAction>;
};

// #endregion
