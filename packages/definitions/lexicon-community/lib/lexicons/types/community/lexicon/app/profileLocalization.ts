import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as CommunityLexiconAppDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.string(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('community.lexicon.app.profileLocalization'),
		/** Client-declared timestamp when this localization was created. */
		createdAt: /*#__PURE__*/ v.datetimeString(),
		/**
		 * Localized description of what the app does.
		 *
		 * @maxLength 3000
		 * @maxGraphemes 300
		 */
		description: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
				/*#__PURE__*/ v.stringLength(0, 3000),
				/*#__PURE__*/ v.stringGraphemes(0, 300),
			]),
		),
		/**
		 * Localized visual assets for directories and stores, such as icons, hero images, screenshots, banners,
		 * and social cards.
		 *
		 * @maxLength 24
		 */
		get images() {
			return /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(CommunityLexiconAppDefs.imageSchema), [
					/*#__PURE__*/ v.arrayLength(0, 24),
				]),
			);
		},
		/**
		 * Localized destinations for the app. The first link should be the primary destination for this locale.
		 *
		 * @minLength 1
		 * @maxLength 12
		 */
		get links() {
			return /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(CommunityLexiconAppDefs.linkSchema), [
					/*#__PURE__*/ v.arrayLength(1, 12),
				]),
			);
		},
		/** BCP 47 language tag for this localized metadata. */
		locale: /*#__PURE__*/ v.languageCodeString(),
		/**
		 * Localized display name of the app.
		 *
		 * @maxLength 200
		 * @maxGraphemes 100
		 */
		name: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
				/*#__PURE__*/ v.stringLength(0, 200),
				/*#__PURE__*/ v.stringGraphemes(0, 100),
			]),
		),
		/**
		 * Localized discovery tags for filtering and search.
		 *
		 * @maxLength 10
		 */
		tags: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.array(
					/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
						/*#__PURE__*/ v.stringLength(0, 64),
						/*#__PURE__*/ v.stringGraphemes(0, 32),
					]),
				),
				[/*#__PURE__*/ v.arrayLength(0, 10)],
			),
		),
		/** Client-declared timestamp when this localization was last updated. */
		updatedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'community.lexicon.app.profileLocalization': mainSchema;
	}
}
