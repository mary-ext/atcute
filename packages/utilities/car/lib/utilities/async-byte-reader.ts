export interface AsyncByteReader {
	readonly pos: number;
	upto(size: number): Promise<Uint8Array>;
	exactly(size: number, seek: boolean): Promise<Uint8Array>;
	seek(size: number): Promise<void>;
	close(): Promise<void>;
}

export const createStreamReader = (stream: AsyncIterable<Uint8Array>): AsyncByteReader => {
	const iterator = stream[Symbol.asyncIterator]();

	let buf = new Uint8Array(0);
	let pos = 0;
	let read = 0;
	let closed = false;

	const ensure = async (requested: number) => {
		if (closed) {
			throw new Error(`reader is closed`);
		}

		const chunks: Uint8Array[] = [];
		let available = buf.length - pos;

		while (available < requested) {
			const result = await iterator.next();
			if (result.done) {
				break;
			}

			const chunk = result.value;

			available += chunk.length;
			chunks.push(chunk);
		}

		if (chunks.length > 0) {
			const concat = new Uint8Array(available);
			concat.set(buf.subarray(pos));

			let offset = buf.length - pos;
			for (let idx = 0, len = chunks.length; idx < len; idx++) {
				const chunk = chunks[idx];

				concat.set(chunk, offset);
				offset += chunk.length;
			}

			read += pos;
			pos = 0;
			buf = concat;
		}
	};

	return {
		get pos() {
			return read + pos;
		},

		async seek(size) {
			await ensure(size);

			if (size > buf.length - pos) {
				throw new RangeError('unexpected end of data');
			}

			pos += size;
		},
		async upto(size) {
			await ensure(size);

			const available = Math.min(size, buf.length - pos);
			return buf.subarray(pos, pos + available);
		},
		async exactly(size, seek) {
			await ensure(size);

			if (size > buf.length - pos) {
				throw new RangeError('unexpected end of data');
			}

			const data = buf.subarray(pos, pos + size);

			if (seek) {
				pos += size;
			}

			return data;
		},

		async close() {
			if (!closed) {
				closed = true;
				buf = new Uint8Array(0);

				await iterator.return?.();
			}
		},
	};
};
