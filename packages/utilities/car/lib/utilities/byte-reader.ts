export interface SyncByteReader {
	readonly pos: number;
	upto(size: number): Uint8Array;
	exactly(size: number, seek: boolean): Uint8Array;
	seek(size: number): void;
}

export const createUint8Reader = (buf: Uint8Array): SyncByteReader => {
	let pos = 0;

	return {
		get pos() {
			return pos;
		},

		seek(size) {
			pos += size;
		},
		upto(size) {
			return buf.subarray(pos, pos + Math.min(size, buf.length - pos));
		},
		exactly(size, seek) {
			if (size > buf.length - pos) {
				throw new RangeError('unexpected end of data');
			}

			const slice = buf.subarray(pos, pos + size);
			if (seek) {
				pos += size;
			}

			return slice;
		},
	};
};
