import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.procedure('org.tangled.temp.server.seedRepo', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Raw `org.tangled.repo.manifest` record body */
			manifest: /*#__PURE__*/ v.unknown(),
			/**
			 * Records to write besides the manifest. Max 200 per req.
			 *
			 * @maxLength 200
			 */
			get records() {
				return /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(seedRecordSchema), [
					/*#__PURE__*/ v.arrayLength(0, 200),
				]);
			},
			/**
			 * Existing repo DID which our COB records belong to. The foster knot will serve this DID as a shadow,
			 * and will give the record (authority) back to the principal knot once that given knot that _actually_
			 * owns the repo DID upgrades!
			 */
			repoDid: /*#__PURE__*/ v.didString(),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			did: /*#__PURE__*/ v.didString(),
			/** Multibase-encoded public signing key that the knot has for this repo. */
			key: /*#__PURE__*/ v.string(),
			get results() {
				return /*#__PURE__*/ v.array(recordResultSchema);
			},
		}),
	},
});
const _recordResultSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.temp.server.seedRepo#recordResult')),
	collection: /*#__PURE__*/ v.nsidString(),
	/** Reason that a record wasn't written. */
	error: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	rkey: /*#__PURE__*/ v.recordKeyString(),
});
const _seedRecordSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.temp.server.seedRepo#seedRecord')),
	/** DID which will be attributed to the record as the author. */
	author: /*#__PURE__*/ v.didString(),
	collection: /*#__PURE__*/ v.nsidString(),
	/** Creation time in Unix seconds. */
	createdAt: /*#__PURE__*/ v.integer(),
	/** Record body, DAG-CBOR w/o lex validation. Max 1,000,000 bytes post-encode. */
	record: /*#__PURE__*/ v.unknown(),
	rkey: /*#__PURE__*/ v.recordKeyString(),
});

type main$schematype = typeof _mainSchema;
type recordResult$schematype = typeof _recordResultSchema;
type seedRecord$schematype = typeof _seedRecordSchema;

export interface mainSchema extends main$schematype {}
export interface recordResultSchema extends recordResult$schematype {}
export interface seedRecordSchema extends seedRecord$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const recordResultSchema = _recordResultSchema as recordResultSchema;
export const seedRecordSchema = _seedRecordSchema as seedRecordSchema;

export interface RecordResult extends v.InferInput<typeof recordResultSchema> {}
export interface SeedRecord extends v.InferInput<typeof seedRecordSchema> {}

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'org.tangled.temp.server.seedRepo': mainSchema;
	}
}
