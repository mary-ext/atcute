import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('network.bsky.jetstream.listSegments', {
	params: /*#__PURE__*/ v.object({
		/** Opaque pagination cursor from a previous response. */
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Maximum number of segment file names to return.
		 *
		 * @default 100
		 * @minimum 1
		 * @maximum 1000
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 1000)]),
			100,
		),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get segments() {
				return /*#__PURE__*/ v.array(segmentSchema);
			},
		}),
	},
});
const _segmentSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('network.bsky.jetstream.listSegments#segment')),
	/** Segment-format xxh3 metadata checksum as 16-char hex; equals the getSegment ETag. */
	checksum: /*#__PURE__*/ v.string(),
	/** Number of events in the segment. */
	eventCount: /*#__PURE__*/ v.integer(),
	/** Zero-based segment index. */
	index: /*#__PURE__*/ v.integer(),
	maxSeq: /*#__PURE__*/ v.integer(),
	/** Latest witnessed-at, unix microseconds. */
	maxWitnessedAt: /*#__PURE__*/ v.integer(),
	minSeq: /*#__PURE__*/ v.integer(),
	/** Earliest witnessed-at, unix microseconds. */
	minWitnessedAt: /*#__PURE__*/ v.integer(),
	/** Segment filename; pass to getSegment. */
	name: /*#__PURE__*/ v.string(),
	/** File size in bytes. */
	sizeBytes: /*#__PURE__*/ v.integer(),
});

type main$schematype = typeof _mainSchema;
type segment$schematype = typeof _segmentSchema;

export interface mainSchema extends main$schematype {}
export interface segmentSchema extends segment$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const segmentSchema = _segmentSchema as segmentSchema;

export interface Segment extends v.InferInput<typeof segmentSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'network.bsky.jetstream.listSegments': mainSchema;
	}
}
