import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as BlogPcktTheme from './theme.js';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('blog.pckt.publication'),
		/**
		 * Base URL path for the publication (e.g., https://blog.pckt.blog)
		 * @maxLength 2000
		 */
		basePath: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.genericUriString(), [
			/*#__PURE__*/ v.stringLength(0, 2000),
		]),
		/**
		 * Timestamp when the publication was first created
		 */
		createdAt: /*#__PURE__*/ v.datetimeString(),
		/**
		 * Publication description or tagline
		 * @maxLength 2000
		 * @maxGraphemes 500
		 */
		description: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
				/*#__PURE__*/ v.stringLength(0, 2000),
				/*#__PURE__*/ v.stringGraphemes(0, 500),
			]),
		),
		/**
		 * Extension objects (open union) for additional features
		 * @maxLength 10
		 */
		get extensions() {
			return /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.variant([])), [
					/*#__PURE__*/ v.arrayLength(0, 10),
				]),
			);
		},
		/**
		 * Publication icon/avatar image
		 * @accept image/png, image/jpeg, image/webp, image/gif
		 * @maxSize 500000
		 */
		icon: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.blob()),
		/**
		 * Publication name/title
		 * @maxLength 200
		 * @maxGraphemes 100
		 */
		name: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 200),
			/*#__PURE__*/ v.stringGraphemes(0, 100),
		]),
		/**
		 * Publication preferences and settings
		 */
		get preferences() {
			return /*#__PURE__*/ v.optional(preferencesSchema);
		},
		/**
		 * Theme configuration as an open union; accepts blog.pckt.theme and future types.
		 */
		get theme() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.variant([BlogPcktTheme.mainSchema]));
		},
		/**
		 * Timestamp when the publication was last updated (optional)
		 */
		updatedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	}),
);
const _preferencesSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.publication#preferences')),
	/**
	 * Whether documents from this publication should appear in public discover feeds
	 * @default true
	 */
	showInDiscover: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), true),
});

type main$schematype = typeof _mainSchema;
type preferences$schematype = typeof _preferencesSchema;

export interface mainSchema extends main$schematype {}
export interface preferencesSchema extends preferences$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const preferencesSchema = _preferencesSchema as preferencesSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
export interface Preferences extends v.InferInput<typeof preferencesSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'blog.pckt.publication': mainSchema;
	}
}
