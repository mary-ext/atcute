import * as err from '../errors.ts';

export class SizeLimitStream extends TransformStream<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>> {
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
