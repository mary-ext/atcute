import * as err from '../errors.js';

export class SizeLimitStream extends TransformStream<Uint8Array, Uint8Array> {
	constructor(maxSize: number) {
		let bytesRead = 0;

		super({
			transform(chunk, controller) {
				bytesRead += chunk.length;

				if (bytesRead > maxSize) {
					controller.error(
						new err.ImproperContentLengthError(maxSize, bytesRead, `response content-length too large`),
					);

					return;
				}

				controller.enqueue(chunk);
			},
		});
	}
}
