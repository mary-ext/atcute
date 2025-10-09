import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoLabelDefs from '@atcute/atproto/types/label/defs';
import * as ComAtprotoRepoStrongRef from '@atcute/atproto/types/repo/strongRef';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.literal('self'),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('app.bsky.actor.profile'),
		/**
		 * Small image to be displayed next to posts from account. AKA, 'profile picture'
		 * @accept image/png, image/jpeg
		 * @maxSize 1000000
		 */
		avatar: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.blob()),
		/**
		 * Larger horizontal image to display behind profile view.
		 * @accept image/png, image/jpeg
		 * @maxSize 1000000
		 */
		banner: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.blob()),
		createdAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		/**
		 * Free-form profile description text.
		 * @maxLength 2560
		 * @maxGraphemes 256
		 */
		description: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
				/*#__PURE__*/ v.stringLength(0, 2560),
				/*#__PURE__*/ v.stringGraphemes(0, 256),
			]),
		),
		/**
		 * @maxLength 640
		 * @maxGraphemes 64
		 */
		displayName: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
				/*#__PURE__*/ v.stringLength(0, 640),
				/*#__PURE__*/ v.stringGraphemes(0, 64),
			]),
		),
		get joinedViaStarterPack() {
			return /*#__PURE__*/ v.optional(ComAtprotoRepoStrongRef.mainSchema);
		},
		/**
		 * Self-label values, specific to the Bluesky application, on the overall account.
		 */
		get labels() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.variant([ComAtprotoLabelDefs.selfLabelsSchema]));
		},
		get pinnedPost() {
			return /*#__PURE__*/ v.optional(ComAtprotoRepoStrongRef.mainSchema);
		},
		/**
		 * Free-form pronouns text.
		 * @maxLength 200
		 * @maxGraphemes 20
		 */
		pronouns: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
				/*#__PURE__*/ v.stringLength(0, 200),
				/*#__PURE__*/ v.stringGraphemes(0, 20),
			]),
		),
		website: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'app.bsky.actor.profile': mainSchema;
	}
}
