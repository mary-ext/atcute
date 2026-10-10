import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('tools.ozone.server.getCapabilities', {
	params: null,
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get notifications() {
				return /*#__PURE__*/ v.optional(notificationConfigSchema);
			},
		}),
	},
});
const _notificationConfigSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.server.getCapabilities#notificationConfig'),
	),
	/** @minLength 1 */
	channels: /*#__PURE__*/ v.constrain(
		/*#__PURE__*/ v.array(/*#__PURE__*/ v.string<'inApp' | 'push' | (string & {})>()),
		[/*#__PURE__*/ v.arrayLength(1)],
	),
});

type main$schematype = typeof _mainSchema;
type notificationConfig$schematype = typeof _notificationConfigSchema;

export interface mainSchema extends main$schematype {}
export interface notificationConfigSchema extends notificationConfig$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const notificationConfigSchema = _notificationConfigSchema as notificationConfigSchema;

export interface NotificationConfig extends v.InferInput<typeof notificationConfigSchema> {}

export interface $params {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'tools.ozone.server.getCapabilities': mainSchema;
	}
}
