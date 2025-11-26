import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _linkAttrsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.mark.link#linkAttrs')),
	/**
	 * The URL destination of the hyperlink
	 * @maxLength 2000
	 */
	href: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.genericUriString(), [
		/*#__PURE__*/ v.stringLength(0, 2000),
	]),
	/**
	 * Defines the relationship between the current document and the linked resource (e.g., nofollow, noopener)
	 * @maxLength 100
	 */
	rel: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 100)]),
	),
	/**
	 * Specifies where to open the linked document (e.g., _blank, _self)
	 * @maxLength 50
	 */
	target: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 50)]),
	),
	/**
	 * Additional information about the link, typically shown as a tooltip on hover
	 * @maxLength 500
	 */
	title: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 500)]),
	),
});
const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.mark.link')),
	/**
	 * Link attributes that define the hyperlink behavior and destination
	 */
	get attrs() {
		return linkAttrsSchema;
	},
});

type linkAttrs$schematype = typeof _linkAttrsSchema;
type main$schematype = typeof _mainSchema;

export interface linkAttrsSchema extends linkAttrs$schematype {}
export interface mainSchema extends main$schematype {}

export const linkAttrsSchema = _linkAttrsSchema as linkAttrsSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface LinkAttrs extends v.InferInput<typeof linkAttrsSchema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}
