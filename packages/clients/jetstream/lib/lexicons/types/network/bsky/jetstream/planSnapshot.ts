import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _blockRangeSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('network.bsky.jetstream.planSnapshot#blockRange')),
	/**
	 * Index of the first block in the range.
	 *
	 * @minimum 0
	 */
	first: /*#__PURE__*/ v.integer(),
	/**
	 * Index of the last block in the range.
	 *
	 * @minimum 0
	 */
	last: /*#__PURE__*/ v.integer(),
});
const _mainSchema = /*#__PURE__*/ v.procedure('network.bsky.jetstream.planSnapshot', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * Start after this sequence number. Events at or below it are not included.
			 *
			 * @minimum 0
			 */
			afterSeq: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			/**
			 * Stop at this sequence number. Events above it are not included.
			 *
			 * @minimum 0
			 */
			beforeSeq: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			/**
			 * Collection NSIDs or namespace wildcards such as app.bsky.feed.*; constrains commit events only.
			 * Non-commit kinds are unaffected, so combine with kinds=commit for a commits-only collection plan.
			 * Rejected when kinds is set and excludes commit. Omit or pass an empty array to include all
			 * collections.
			 *
			 * @maxLength 100
			 */
			collections: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string()), [
					/*#__PURE__*/ v.arrayLength(0, 100),
				]),
			),
			/**
			 * Only include data for these DIDs. Omit this field or pass an empty array to include all DIDs.
			 *
			 * @maxLength 10000
			 */
			dids: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.didString()), [
					/*#__PURE__*/ v.arrayLength(0, 10000),
				]),
			),
			/**
			 * Event kinds to include. Omit this field or pass an empty array to include all kinds.
			 *
			 * @maxLength 4
			 */
			kinds: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.constrain(
					/*#__PURE__*/ v.array(/*#__PURE__*/ v.literalEnum(['account', 'commit', 'identity', 'sync'])),
					[/*#__PURE__*/ v.arrayLength(0, 4)],
				),
			),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * The last sealed sequence covered by this page. Use this value as afterSeq for the next page. If the
			 * response hits the server's page limit, this is the maxSeq of the last item returned; otherwise it
			 * equals sealedTipSeq. Planning is complete when plannedThroughSeq reaches sealedTipSeq.
			 *
			 * @minimum 0
			 */
			plannedThroughSeq: /*#__PURE__*/ v.integer(),
			/**
			 * The end of the sealed archive for this snapshot, capped by beforeSeq when provided. Use this value as
			 * beforeSeq on later pages so the snapshot does not move while it is being downloaded.
			 *
			 * @minimum 0
			 */
			sealedTipSeq: /*#__PURE__*/ v.integer(),
			get segments() {
				return /*#__PURE__*/ v.array(segmentSchema);
			},
			get stats() {
				return statsSchema;
			},
		}),
	},
});
const _segmentSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('network.bsky.jetstream.planSnapshot#segment')),
	/** Block ranges to download, including both endpoints. This field is present only when mode is blocks. */
	get blocks() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(blockRangeSchema));
	},
	/**
	 * The segment's xxh3 metadata checksum, encoded as 16 hexadecimal characters.
	 *
	 * @minLength 16
	 * @maxLength 16
	 */
	checksum: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(16, 16)]),
	/**
	 * Zero-based segment index.
	 *
	 * @minimum 0
	 */
	index: /*#__PURE__*/ v.integer(),
	/** @minimum 0 */
	maxSeq: /*#__PURE__*/ v.integer(),
	/** @minimum 0 */
	minSeq: /*#__PURE__*/ v.integer(),
	/**
	 * How to download this segment. For segment, download the whole file with getSegment. For blocks, download
	 * the ranges listed in blocks with getBlock.
	 */
	mode: /*#__PURE__*/ v.string<'blocks' | 'segment' | (string & {})>(),
	/** Segment filename to pass to getSegment or getBlock. */
	name: /*#__PURE__*/ v.string(),
});
const _statsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('network.bsky.jetstream.planSnapshot#stats')),
	/** @minimum 0 */
	blocksMatched: /*#__PURE__*/ v.integer(),
	/**
	 * Number of items counted toward the server's per-page plan limit.
	 *
	 * @minimum 0
	 */
	entries: /*#__PURE__*/ v.integer(),
	/** @minimum 0 */
	segmentsExamined: /*#__PURE__*/ v.integer(),
	/** @minimum 0 */
	segmentsMatched: /*#__PURE__*/ v.integer(),
});

type blockRange$schematype = typeof _blockRangeSchema;
type main$schematype = typeof _mainSchema;
type segment$schematype = typeof _segmentSchema;
type stats$schematype = typeof _statsSchema;

export interface blockRangeSchema extends blockRange$schematype {}
export interface mainSchema extends main$schematype {}
export interface segmentSchema extends segment$schematype {}
export interface statsSchema extends stats$schematype {}

export const blockRangeSchema = _blockRangeSchema as blockRangeSchema;
export const mainSchema = _mainSchema as mainSchema;
export const segmentSchema = _segmentSchema as segmentSchema;
export const statsSchema = _statsSchema as statsSchema;

export interface BlockRange extends v.InferInput<typeof blockRangeSchema> {}
export interface Segment extends v.InferInput<typeof segmentSchema> {}
export interface Stats extends v.InferInput<typeof statsSchema> {}

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'network.bsky.jetstream.planSnapshot': mainSchema;
	}
}
