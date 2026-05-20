import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.literal('self'),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('com.germnetwork.declaration'),
		/**
		 * Array of opaque values to allow for key rolling
		 *
		 * @maxLength 1000
		 */
		continuityProofs: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.bytes()), [
				/*#__PURE__*/ v.arrayLength(0, 1000),
			]),
		),
		/** Opaque value, an ed25519 public key prefixed with a byte enum */
		currentKey: /*#__PURE__*/ v.bytes(),
		/** Opaque value, contains MLS KeyPackage(s), and other signature data, and is signed by the currentKey */
		keyPackage: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.bytes()),
		/** Controls who can message this account */
		get messageMe() {
			return /*#__PURE__*/ v.optional(messageMeSchema);
		},
		/**
		 * Semver version number, without pre-release or build information, for the format of opaque content
		 *
		 * @minLength 5
		 * @maxLength 14
		 */
		version: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(5, 14)]),
	}),
);
const _messageMeSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.germnetwork.declaration#messageMe')),
	/**
	 * A URL to present to an account that does not have its own com.germnetwork.declaration record, must have
	 * an empty fragment component, where the app should fill in the fragment component with the DIDs of the two
	 * accounts who wish to message each other
	 *
	 * @minLength 1
	 * @maxLength 2047
	 */
	messageMeUrl: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.genericUriString(), [
		/*#__PURE__*/ v.stringLength(1, 2047),
	]),
	/**
	 * The policy of who can message the account, this value is included in the keyPackage, but is duplicated
	 * here to allow applications to decide if they should show a 'Message on Germ' button to the viewer.
	 *
	 * @minLength 1
	 * @maxLength 100
	 */
	showButtonTo: /*#__PURE__*/ v.constrain(
		/*#__PURE__*/ v.string<'everyone' | 'none' | 'usersIFollow' | (string & {})>(),
		[/*#__PURE__*/ v.stringLength(1, 100)],
	),
});

type main$schematype = typeof _mainSchema;
type messageMe$schematype = typeof _messageMeSchema;

export interface mainSchema extends main$schematype {}
export interface messageMeSchema extends messageMe$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const messageMeSchema = _messageMeSchema as messageMeSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
export interface MessageMe extends v.InferInput<typeof messageMeSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'com.germnetwork.declaration': mainSchema;
	}
}
