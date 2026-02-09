import { toBase32 } from '@atcute/multibase';

import { CID_STRINGIFY_CACHE, decode, fromString, type Cid } from './codec.ts';

const CID_LINK_SYMBOL = Symbol.for('@atcute/cid-link-wrapper');

/** @internal */
export const CIDLINK_STRINGIFY_CACHE = new WeakMap<CidLinkWrapper, string>();

export interface CidLink {
	$link: string;
}

export class CidLinkWrapper implements CidLink {
	/** @internal */
	readonly [CID_LINK_SYMBOL] = true;

	readonly bytes: Uint8Array;

	constructor(bytes: Uint8Array) {
		this.bytes = bytes;
	}

	get $link(): string {
		let str = CIDLINK_STRINGIFY_CACHE.get(this);
		if (str === undefined) {
			str = `b${toBase32(this.bytes)}`;

			CIDLINK_STRINGIFY_CACHE.set(this, str);
		}

		return str;
	}

	toJSON(): CidLink {
		return { $link: this.$link };
	}
}

export const isCidLink = (value: unknown): value is CidLink => {
	const val = value as any;

	return (
		val instanceof CidLinkWrapper ||
		(val !== null && typeof val === 'object' && typeof val.$link === 'string')
	);
};

export const toCidLink = (cid: Cid): CidLink => {
	const inst = new CidLinkWrapper(cid.bytes);
	const str = CID_STRINGIFY_CACHE.get(cid);

	if (str !== undefined) {
		CIDLINK_STRINGIFY_CACHE.set(inst, str);
	}

	return inst;
};

export const fromCidLink = (link: CidLink): Cid => {
	if (link instanceof CidLinkWrapper) {
		return decode(link.bytes);
	}

	return fromString(link.$link);
};
