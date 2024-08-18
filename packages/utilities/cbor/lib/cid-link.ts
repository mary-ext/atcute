import { type CID, format, parse } from '@atcute/cid';

export interface CIDLink {
	$link: string;
}

export class CIDLinkWrapper implements CIDLink {
	constructor(public cid: CID) {}

	get $link(): string {
		return format(this.cid);
	}

	toJSON(): CIDLink {
		return { $link: this.$link };
	}
}

export const toCIDLink = (cid: CID): CIDLink => {
	return new CIDLinkWrapper(cid);
};

export const fromCIDLink = (link: CIDLink): CID => {
	if (link instanceof CIDLinkWrapper) {
		return link.cid;
	}

	return parse(link.$link);
};
