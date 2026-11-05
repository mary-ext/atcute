import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.git.pushEvent')),
	/** @maxLength 200 */
	get edits() {
		return /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(refEditSchema), [
			/*#__PURE__*/ v.arrayLength(0, 200),
		]);
	},
	/**
	 * Git push options.
	 *
	 * @maxLength 10
	 */
	options: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(
			/*#__PURE__*/ v.array(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 1024)]),
			),
			[/*#__PURE__*/ v.arrayLength(0, 10)],
		),
	),
	/** The account that performed this push. */
	pusher: /*#__PURE__*/ v.didString(),
	/** The repo this event comes from. */
	repo: /*#__PURE__*/ v.didString(),
	/** The stream sequence number of this message. */
	seq: /*#__PURE__*/ v.integer(),
	/**
	 * Signature over the DAG-CBOR of this message with the seq and sig keys absent (repo/pusher DID, edits,
	 * time, options), by the repo's atproto signing key. seq is excluded so a relay can reassign it without
	 * invalidating the signature.
	 */
	sig: /*#__PURE__*/ v.bytes(),
	/** Timestamp of when this message was originally broadcast. */
	time: /*#__PURE__*/ v.datetimeString(),
});
const _refEditSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.git.pushEvent#refEdit')),
	/** Full git reference name, ie refs/heads/main. */
	name: /*#__PURE__*/ v.string(),
	/** Full hex object id the ref now points at. */
	new: /*#__PURE__*/ v.nullable(/*#__PURE__*/ v.string()),
	/** Full hex object id the ref pointed at before. */
	old: /*#__PURE__*/ v.nullable(/*#__PURE__*/ v.string()),
});

type main$schematype = typeof _mainSchema;
type refEdit$schematype = typeof _refEditSchema;

export interface mainSchema extends main$schematype {}
export interface refEditSchema extends refEdit$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const refEditSchema = _refEditSchema as refEditSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
export interface RefEdit extends v.InferInput<typeof refEditSchema> {}
