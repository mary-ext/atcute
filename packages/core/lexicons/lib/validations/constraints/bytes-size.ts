import { _isBytesWrapper, type Bytes } from '../../interfaces/bytes.js';

import type { BaseConstraint, IssueLeaf } from '../base.js';

export interface BytesSizeConstraint<TInput extends Bytes> extends BaseConstraint<TInput> {
	readonly type: 'bytes_size';
	readonly minSize: number;
	readonly maxSize: number;
}

// #__NO_SIDE_EFFECTS__
export const bytesSize = <TInput extends Bytes>(
	minSize: number,
	maxSize: number = Infinity,
): BytesSizeConstraint<TInput> => {
	const issue: IssueLeaf = {
		ok: false,
		code: 'invalid_bytes_size',
		minSize: minSize,
		maxSize: maxSize,
	};

	return {
		kind: 'constraint',
		type: 'bytes_size',
		minSize: minSize,
		maxSize: maxSize,
		'~run'(input, _flags) {
			let size: number;

			if (_isBytesWrapper(input)) {
				size = input.buf.length;
			} else {
				const str = input.$bytes;
				let bytes = str.length;

				if (str.charCodeAt(bytes - 1) === 0x3d) {
					bytes--;
				}
				if (bytes > 1 && str.charCodeAt(bytes - 1) === 0x3d) {
					bytes--;
				}

				size = (bytes * 3) >>> 2;
			}

			if (size < minSize) {
				return issue;
			}

			if (size > maxSize) {
				return issue;
			}

			return undefined;
		},
	};
};
