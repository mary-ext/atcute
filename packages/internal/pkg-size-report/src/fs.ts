import * as fs from 'node:fs';
import * as zlib from 'node:zlib';

export function computeFolderSize(folder: URL, detailed = false) {
	folder.pathname += '/';
	let res = { size: 0, gzip: 0, brotli: 0 };

	for (const entry of fs.readdirSync(folder)) {
		const path = new URL(entry, folder);
		const stat = fs.statSync(path);

		if (stat.isDirectory()) {
			const nested = computeFolderSize(path);
			res.size += nested.size;
			res.gzip += nested.gzip;
			res.brotli += nested.brotli;
		}

		if (stat.isFile()) {
			res.size += stat.size;
			if (detailed) {
				const buf = fs.readFileSync(path);
				const gzipBuf = zlib.gzipSync(buf);
				const brotliBuf = zlib.brotliCompressSync(buf);
				res.gzip += gzipBuf.length;
				res.brotli += brotliBuf.length;
			}
		}
	}

	return res;
}
