import { toBase32 } from '@atcute/multibase';

import { type Cid, decode, fromString } from './codec.ts';

const CID_LINK_SYMBOL = Symbol.for('@atcute/cid-link-wrapper');

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
		const link = `b${toBase32(this.bytes)}`;
		Object.defineProperty(this, '$link', {
			value: link,
			enumerable: true,
		});

		return link;
	}

	toJSON(): CidLink {
		return { $link: this.$link };
	}
}

export const isCidLink = (value: unknown): value is CidLink => {
	// oxlint-disable-next-line typescript/no-explicit-any
	const val = value as any;

	return (
		val instanceof CidLinkWrapper ||
		(val !== null && typeof val === 'object' && typeof val.$link === 'string')
	);
};

export const toCidLink = (cid: Cid): CidLink => {
	return new CidLinkWrapper(cid.bytes);
};

export const fromCidLink = (link: CidLink): Cid => {
	if (link instanceof CidLinkWrapper) {
		return decode(link.bytes);
	}

	return fromString(link.$link);
};

/**
 * returns a CID link's raw bytes; wrapped links return their existing buffer without validation
 *
 * @param link the CID link
 * @returns raw CID bytes
 * @throws {SyntaxError} if an unwrapped link has an invalid CID string
 * @throws {RangeError} if an unwrapped link decodes to invalid CID bytes
 */
export const toLinkBytes = (link: CidLink): Uint8Array => {
	if (link instanceof CidLinkWrapper) {
		return link.bytes;
	}

	return fromString(link.$link).bytes;
};
