import { isCid, type Cid } from '../syntax/cid.js';

/**
 * represents a content identifier (CID) reference
 */
export interface CidLink {
	$link: Cid;
}

const CID_LINK_SYMBOL = Symbol.for('@atcute/cid-link-wrapper');

/**
 * this should match with {@link file://./../../../../utilities/cid/lib/cid-link.ts}
 * @internal
 */
export interface _CidLinkWrapper {
	readonly [CID_LINK_SYMBOL]: true;

	readonly bytes: Uint8Array;
	readonly $link: string;

	toJSON(): CidLink;
}

/**
 * @internal
 */
export const _isCidLinkWrapper = (input: unknown): input is _CidLinkWrapper => {
	return typeof input === 'object' && input !== null && CID_LINK_SYMBOL in input;
};

export const isCidLink = (input: unknown): input is CidLink => {
	const v = input as any;

	return typeof v === 'object' && v !== null && (CID_LINK_SYMBOL in v || isCid(v.$link));
};
