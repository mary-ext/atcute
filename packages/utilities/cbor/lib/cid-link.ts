import { type CID, format, parse, decode } from '@atcute/cid';

export interface CIDLink {
	$link: string;
}

export class CIDLinkWrapper implements CIDLink {
	constructor(public $bytes: Uint8Array) {}

	get $cid(): CID {
		return decode(this.$bytes);
	}

	get $link(): string {
		return format(decode(this.$bytes));
	}

	toJSON(): CIDLink {
		return { $link: this.$link };
	}
}

export const toCIDLink = (value: CID | Uint8Array): CIDLink => {
	if (value instanceof Uint8Array) {
		return new CIDLinkWrapper(value);
	}

	return new CIDLinkWrapper(value.bytes);
};

export const fromCIDLink = (link: CIDLink): CID => {
	if (link instanceof CIDLinkWrapper) {
		return link.$cid;
	}

	return parse(link.$link);
};
