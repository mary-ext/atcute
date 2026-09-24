import * as CID from '@atcute/cid';
import { toSha256Sync } from '@atcute/uint8array';

import { CarBlockMismatchError } from './errors.ts';

/**
 * verifies a block's bytes against its CID
 *
 * readers call this unless `verifyBlocks` is false.
 *
 * @param cid the CID the block is listed under
 * @param bytes the block's contents
 * @throws {CarBlockMismatchError} if the bytes do not hash to the CID
 */
export const verifyBlock = (cid: CID.Cid, bytes: Uint8Array): void => {
	const expected = cid.digest.contents;
	const actual = toSha256Sync(bytes);

	for (let i = 0; i < 32; i++) {
		if (actual[i] !== expected[i]) {
			const codec = cid.codec as typeof CID.CODEC_DCBOR | typeof CID.CODEC_RAW;
			throw new CarBlockMismatchError(CID.toString(cid), CID.toString(CID.fromDigest(codec, actual)));
		}
	}
};
