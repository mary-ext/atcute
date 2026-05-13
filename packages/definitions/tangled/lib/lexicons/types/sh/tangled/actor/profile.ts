import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.literal('self'),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('sh.tangled.actor.profile'),
		/**
		 * Small image to be displayed next to posts from account. AKA, 'profile picture'
		 *
		 * @accept image/png, image/jpeg
		 * @maxSize 1000000
		 */
		avatar: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.blob(), [
				/*#__PURE__*/ v.blobSize(1000000),
				/*#__PURE__*/ v.blobAccept(['image/png', 'image/jpeg']),
			]),
		),
		/** Include link to this account on Bluesky. */
		bluesky: /*#__PURE__*/ v.boolean(),
		/**
		 * Free-form profile description text.
		 *
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
		 * @minLength 0
		 * @maxLength 5
		 */
		links: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.genericUriString()), [
				/*#__PURE__*/ v.arrayLength(0, 5),
			]),
		),
		/**
		 * Free-form location text.
		 *
		 * @maxLength 400
		 * @maxGraphemes 40
		 */
		location: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
				/*#__PURE__*/ v.stringLength(0, 400),
				/*#__PURE__*/ v.stringGraphemes(0, 40),
			]),
		),
		/**
		 * Pinned repositories. Values are repo DIDs for repos that have them, or AT-URIs for legacy repos.
		 *
		 * @minLength 0
		 * @maxLength 6
		 */
		pinnedRepositories: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string()), [
				/*#__PURE__*/ v.arrayLength(0, 6),
			]),
		),
		/**
		 * A handle the user prefers to be displayed as.
		 *
		 * @maxLength 253
		 */
		preferredHandle: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.handleString(), [/*#__PURE__*/ v.stringLength(0, 253)]),
		),
		/**
		 * Preferred gender pronouns.
		 *
		 * @maxLength 40
		 */
		pronouns: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 40)]),
		),
		/**
		 * @minLength 0
		 * @maxLength 2
		 */
		stats: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.array(
					/*#__PURE__*/ v.literalEnum([
						'closed-issue-count',
						'closed-pull-request-count',
						'merged-pull-request-count',
						'open-issue-count',
						'open-pull-request-count',
						'repository-count',
						'star-count',
					]),
				),
				[/*#__PURE__*/ v.arrayLength(0, 2)],
			),
		),
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'sh.tangled.actor.profile': mainSchema;
	}
}
