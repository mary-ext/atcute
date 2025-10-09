import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('sh.tangled.repo'),
		createdAt: /*#__PURE__*/ v.datetimeString(),
		/**
		 * @minGraphemes 1
		 * @maxGraphemes 140
		 */
		description: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringGraphemes(1, 140)]),
		),
		/**
		 * knot where the repo was created
		 */
		knot: /*#__PURE__*/ v.string(),
		/**
		 * List of labels that this repo subscribes to
		 */
		labels: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.resourceUriString())),
		/**
		 * name of the repo
		 */
		name: /*#__PURE__*/ v.string(),
		/**
		 * source of the repo
		 */
		source: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
		/**
		 * CI runner to send jobs to and receive results from
		 */
		spindle: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'sh.tangled.repo': mainSchema;
	}
}
