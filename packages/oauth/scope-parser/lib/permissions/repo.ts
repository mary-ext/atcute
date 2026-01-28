/**
 * repository permission parsing and matching
 *
 * syntax: `repo:<collection>[?action=<action>&collection=<collection>]`
 * - collection: NSID or '*' for all collections
 * - action: 'create', 'update', 'delete' (defaults to all)
 */

import { isNsid, type Nsid } from '@atcute/lexicons/syntax';

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

export const REPO_ACTIONS = ['create', 'update', 'delete'] as const;
export type RepoAction = (typeof REPO_ACTIONS)[number];

export type CollectionParam = '*' | Nsid;

export interface RepoPermissionMatch {
	collection: Nsid;
	action: RepoAction;
}

// #endregion

// #region validation

const KNOWN_KEYS = new Set(['collection', 'action']);

const isRepoAction = (value: unknown): value is RepoAction => {
	return value === 'create' || value === 'update' || value === 'delete';
};

const isCollectionParam = (value: unknown): value is CollectionParam => {
	return value === '*' || isNsid(value);
};

// #endregion

// #region permission class

export class RepoPermission {
	constructor(
		readonly collection: NeRoArray<CollectionParam>,
		readonly action: NeRoArray<RepoAction>,
	) {}

	/**
	 * checks if this permission covers the requested access
	 */
	matches(request: RepoPermissionMatch): boolean {
		return (
			this.action.includes(request.action) &&
			(this.collection.includes('*') || (this.collection as readonly string[]).includes(request.collection))
		);
	}

	/**
	 * formats this permission as a scope string
	 */
	toString(): string {
		const collection = normalizeCollection(this.collection);
		const action = normalizeAction(this.action);

		const params = new URLSearchParams();

		// use positional for single collection
		let positional: string | undefined;
		if (collection.length === 1) {
			positional = collection[0];
		} else {
			for (const c of collection) {
				params.append('collection', c);
			}
		}

		// omit action if it's the default (all actions)
		if (!actionsEqual(action, REPO_ACTIONS)) {
			for (const a of action) {
				params.append('action', a);
			}
		}

		return formatScopeString({ prefix: 'repo', positional, params });
	}

	/**
	 * parses a scope string into a RepoPermission
	 * @returns the permission or null if invalid
	 */
	static fromString(scope: string): RepoPermission | null {
		if (!hasScopePrefix(scope, 'repo')) {
			return null;
		}
		return RepoPermission.fromSyntax(parseScopeString(scope));
	}

	/**
	 * parses a pre-parsed scope syntax into a RepoPermission
	 * @returns the permission or null if invalid
	 */
	static fromSyntax(syntax: ScopeSyntax): RepoPermission | null {
		if (syntax.prefix !== 'repo') {
			return null;
		}

		// reject unknown parameters
		if (hasUnknownParams(syntax, KNOWN_KEYS)) {
			return null;
		}

		// parse collection (required)
		const collectionRaw = getMultiParam(syntax, 'collection', 'collection');
		if (collectionRaw === null || collectionRaw === undefined || collectionRaw.length === 0) {
			return null;
		}

		// validate all collection values
		for (const c of collectionRaw) {
			if (!isCollectionParam(c)) {
				return null;
			}
		}
		const collection = normalizeCollection(collectionRaw as NeRoArray<CollectionParam>);

		// parse action (optional, defaults to all)
		const actionRaw = getMultiParam(syntax, 'action');
		let action: NeRoArray<RepoAction>;

		if (actionRaw === null) {
			return null; // both positional and named
		} else if (actionRaw === undefined || actionRaw.length === 0) {
			action = [...REPO_ACTIONS];
		} else {
			// validate all action values
			for (const a of actionRaw) {
				if (!isRepoAction(a)) {
					return null;
				}
			}
			action = normalizeAction(actionRaw as NeRoArray<RepoAction>);
		}

		return new RepoPermission(collection, action);
	}

	/**
	 * generates the minimal scope string needed for the given access
	 */
	static scopeNeededFor(request: RepoPermissionMatch): string {
		return new RepoPermission([request.collection], [request.action]).toString();
	}
}

// #endregion

// #region normalization

const normalizeCollection = (value: NeRoArray<CollectionParam>): NeRoArray<CollectionParam> => {
	// wildcard subsumes all
	if (value.includes('*')) {
		return ['*'];
	}

	if (value.length === 1) {
		return value;
	}

	// dedupe and sort, cast is safe because input is non-empty
	const sorted = [...new Set(value)].sort();
	return sorted as unknown as NeRoArray<CollectionParam>;
};

const normalizeAction = (value: NeRoArray<RepoAction>): NeRoArray<RepoAction> => {
	if (value.length === REPO_ACTIONS.length) {
		// check if it contains all actions
		const hasAll = REPO_ACTIONS.every((a) => value.includes(a));
		if (hasAll) {
			return [...REPO_ACTIONS];
		}
	}

	if (value.length === 1) {
		return value;
	}

	// filter to canonical order, cast is safe because input is non-empty
	const filtered = REPO_ACTIONS.filter((a) => value.includes(a));
	return filtered as unknown as NeRoArray<RepoAction>;
};

const actionsEqual = (a: readonly RepoAction[], b: readonly RepoAction[]): boolean => {
	if (a.length !== b.length) {
		return false;
	}
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) {
			return false;
		}
	}
	return true;
};

// #endregion
