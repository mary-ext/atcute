/**
 * RPC permission parsing and matching
 *
 * syntax: `rpc:<lxm>?aud=<audience>[&lxm=<lxm>]`
 * - lxm: lexicon method NSID or '*' for all
 * - aud: audience (DID with service ID) or '*' for all
 *
 * forbidden: `rpc:*?aud=*` (both wildcards not allowed)
 */

import { isNsid, type AtprotoAudience, type Nsid } from '@atcute/lexicons/syntax';

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

export type LxmParam = '*' | Nsid;
export type AudParam = '*' | AtprotoAudience;

export interface RpcPermissionMatch {
	lxm: Nsid;
	aud: AtprotoAudience;
}

// #endregion

// #region validation

const KNOWN_KEYS = new Set(['lxm', 'aud']);

// audience must be a DID with a service ID (fragment), or wildcard
// did:web:example.com#service or did:plc:abc123#service
const AUD_RE = /^did:(web|plc):[a-zA-Z0-9._:%-]+#[a-zA-Z0-9._-]+$/;

const isLxmParam = (value: unknown): value is LxmParam => {
	return value === '*' || isNsid(value);
};

const isAudParam = (value: unknown): value is AudParam => {
	if (value === '*') {
		return true;
	}
	return typeof value === 'string' && AUD_RE.test(value);
};

// #endregion

// #region permission class

export class RpcPermission {
	constructor(
		readonly aud: AudParam,
		readonly lxm: NeRoArray<LxmParam>,
	) {}

	/**
	 * checks if this permission covers the requested access
	 */
	matches(request: RpcPermissionMatch): boolean {
		const audMatch = this.aud === '*' || this.aud === request.aud;
		const lxmMatch = this.lxm.includes('*') || (this.lxm as readonly string[]).includes(request.lxm);
		return audMatch && lxmMatch;
	}

	/**
	 * formats this permission as a scope string
	 */
	toString(): string {
		const lxm = normalizeLxm(this.lxm);

		const params = new URLSearchParams();

		// use positional for single lxm
		let positional: string | undefined;
		if (lxm.length === 1) {
			positional = lxm[0];
		} else {
			for (const l of lxm) {
				params.append('lxm', l);
			}
		}

		params.set('aud', this.aud);

		return formatScopeString({ prefix: 'rpc', positional, params });
	}

	/**
	 * parses a scope string into an RpcPermission
	 * @returns the permission or null if invalid
	 */
	static fromString(scope: string): RpcPermission | null {
		if (!hasScopePrefix(scope, 'rpc')) {
			return null;
		}
		return RpcPermission.fromSyntax(parseScopeString(scope));
	}

	/**
	 * parses a pre-parsed scope syntax into an RpcPermission
	 * @returns the permission or null if invalid
	 */
	static fromSyntax(syntax: ScopeSyntax): RpcPermission | null {
		if (syntax.prefix !== 'rpc') {
			return null;
		}

		// reject unknown parameters
		if (hasUnknownParams(syntax, KNOWN_KEYS)) {
			return null;
		}

		// parse lxm (required)
		const lxmRaw = getMultiParam(syntax, 'lxm', 'lxm');
		if (lxmRaw === null || lxmRaw === undefined || lxmRaw.length === 0) {
			return null;
		}

		// validate all lxm values
		for (const l of lxmRaw) {
			if (!isLxmParam(l)) {
				return null;
			}
		}
		const lxm = normalizeLxm(lxmRaw as NeRoArray<LxmParam>);

		// parse aud (required)
		const audRaw = getSingleParam(syntax, 'aud');
		if (audRaw === null || audRaw === undefined) {
			return null;
		}
		if (!isAudParam(audRaw)) {
			return null;
		}

		// both wildcards forbidden
		if (audRaw === '*' && lxm.includes('*')) {
			return null;
		}

		return new RpcPermission(audRaw, lxm);
	}

	/**
	 * generates the minimal scope string needed for the given access
	 */
	static scopeNeededFor(request: RpcPermissionMatch): string {
		return new RpcPermission(request.aud, [request.lxm]).toString();
	}
}

// #endregion

// #region normalization

const normalizeLxm = (value: NeRoArray<LxmParam>): NeRoArray<LxmParam> => {
	// wildcard subsumes all
	if (value.includes('*')) {
		return ['*'];
	}

	if (value.length === 1) {
		return value;
	}

	// dedupe and sort, cast is safe because input is non-empty
	const sorted = [...new Set(value)].sort();
	return sorted as unknown as NeRoArray<LxmParam>;
};

// #endregion
