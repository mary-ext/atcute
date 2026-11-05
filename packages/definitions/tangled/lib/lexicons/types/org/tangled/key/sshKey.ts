import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('org.tangled.key.sshKey'),
		createdAt: /*#__PURE__*/ v.datetimeString(),
		/**
		 * human-readable name for this key
		 *
		 * @maxLength 255
		 */
		name: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 255)]),
		/**
		 * public key in OpenSSH authorized_keys format
		 *
		 * @maxLength 4096
		 */
		publicKey: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 4096)]),
		/**
		 * default to `["auth", "sign"]` when omitted.
		 *
		 * @minLength 1
		 */
		usages: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.array(/*#__PURE__*/ v.string<'auth' | 'sign' | (string & {})>()),
				[/*#__PURE__*/ v.arrayLength(1)],
			),
		),
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'org.tangled.key.sshKey': mainSchema;
	}
}
