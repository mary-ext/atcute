import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledGitOid from '../git/oid.ts';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('org.tangled.repo.artifact'),
		/**
		 * the artifact
		 *
		 * @maxSize 52428800
		 */
		artifact: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.blob(), [/*#__PURE__*/ v.blobSize(52428800)]),
		/** time of creation of this artifact */
		createdAt: /*#__PURE__*/ v.datetimeString(),
		/**
		 * name of the artifact
		 *
		 * @maxLength 255
		 */
		name: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 255)]),
		get subject() {
			return /*#__PURE__*/ v.variant([OrgTangledGitOid.mainSchema]);
		},
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'org.tangled.repo.artifact': mainSchema;
	}
}
