import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('app.bsky.actor.link'),
		createdAt: /*#__PURE__*/ v.datetimeString(),
		/**
		 * The destination site's icon, uploaded when the link is saved.
		 *
		 * @accept image/jpeg, image/png, image/webp
		 * @maxSize 100000
		 */
		icon: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.blob(), [
				/*#__PURE__*/ v.blobSize(100000),
				/*#__PURE__*/ v.blobAccept(['image/jpeg', 'image/png', 'image/webp']),
			]),
		),
		/**
		 * Optional label for the link. Clients can fall back to the destination's domain.
		 *
		 * @maxLength 320
		 * @maxGraphemes 40
		 */
		title: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
				/*#__PURE__*/ v.stringLength(0, 320),
				/*#__PURE__*/ v.stringGraphemes(0, 40),
			]),
		),
		/** The link destination, an https URL. */
		url: /*#__PURE__*/ v.genericUriString(),
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'app.bsky.actor.link': mainSchema;
	}
}
