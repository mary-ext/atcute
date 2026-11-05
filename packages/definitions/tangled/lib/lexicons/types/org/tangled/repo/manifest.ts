import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledRepoDefs from './defs.ts';

const _declarationSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.repo.manifest#declaration')),
	/** repository name; the slug (rkey of org.tangled.repo.declaration) is lowercase(name) */
	name: /*#__PURE__*/ v.recordKeyString(),
	owner: /*#__PURE__*/ v.didString(),
});
const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.literal('self'),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('org.tangled.repo.manifest'),
		/**
		 * Who may open tickets and patches on this repo. anyone = any DID, members = the knot's member roll,
		 * collaborators = the owner plus repo collaborators. Absent means the knot-wide default.
		 */
		contributionPolicy: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.string<'anyone' | 'collaborators' | 'members' | (string & {})>(),
		),
		createdAt: /*#__PURE__*/ v.datetimeString(),
		get declaration() {
			return declarationSchema;
		},
		/**
		 * @minGraphemes 1
		 * @maxGraphemes 140
		 */
		description: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringGraphemes(1, 140)]),
		),
		/** source of the repo */
		get source() {
			return /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.variant([
					OrgTangledRepoDefs.sourceExternalSchema,
					OrgTangledRepoDefs.sourceTangledSchema,
				]),
			);
		},
		spindle: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		/**
		 * Topics related to the repo
		 *
		 * @maxLength 50
		 */
		topics: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.array(
					/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 50)]),
				),
				[/*#__PURE__*/ v.arrayLength(0, 50)],
			),
		),
		/** Any URI related to the repo */
		website: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	}),
);

type declaration$schematype = typeof _declarationSchema;
type main$schematype = typeof _mainSchema;

export interface declarationSchema extends declaration$schematype {}
export interface mainSchema extends main$schematype {}

export const declarationSchema = _declarationSchema as declarationSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface Declaration extends v.InferInput<typeof declarationSchema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'org.tangled.repo.manifest': mainSchema;
	}
}
