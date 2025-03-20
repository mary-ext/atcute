import * as CBOR from '@atcute/cbor';
import * as CID from '@atcute/cid';

export interface CarV1Header {
	version: 1;
	roots: CID.CidLink[];
}

export const isCarV1Header = (value: unknown): value is CarV1Header => {
	if (value === null || typeof value !== 'object') {
		return false;
	}

	const { version, roots } = value as CarV1Header;
	return version === 1 && Array.isArray(roots) && roots.every((root) => root instanceof CBOR.CidLinkWrapper);
};

export interface CarHeader {
	headerStart: number;
	headerEnd: number;

	data: CarV1Header;
	dataStart: number;
	dataEnd: number;
}

export interface CarEntry {
	entryStart: number;
	entryEnd: number;

	cid: CID.Cid;
	cidStart: number;
	cidEnd: number;

	bytes: Uint8Array;
	bytesStart: number;
	bytesEnd: number;
}
