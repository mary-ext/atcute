import { toBase32 } from '@atcute/multibase';

import { decode, fromString, type Cid } from './codec.js';

const CID_LINK_SYMBOL = Symbol.for('@atcute/cid-link-wrapper');

export interface CidLink {
	$link: string;
}

export class CidLinkWrapper implements CidLink {
	/** @internal */
	readonly [CID_LINK_SYMBOL] = true;
	/** @internal */
	_str: string | undefined;

	readonly bytes: Uint8Array;

	constructor(bytes: Uint8Array, str?: string) {
		this.bytes = bytes;
		this._str = str;
	}

	get $link(): string {
		return (this._str ??= `b${toBase32(this.bytes)}`);
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
	return new CidLinkWrapper(cid.bytes, cid._str);
};

export const fromCidLink = (link: CidLink): Cid => {
	if (link instanceof CidLinkWrapper) {
		return decode(link.bytes);
	}

	return fromString(link.$link);
};
