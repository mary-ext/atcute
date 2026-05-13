import * as ComAtprotoRepoStrongRef from '@atcute/atproto/types/repo/strongRef';
import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _goingSchema = /*#__PURE__*/ v.literal('community.lexicon.calendar.rsvp#going');
const _interestedSchema = /*#__PURE__*/ v.literal('community.lexicon.calendar.rsvp#interested');
const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('community.lexicon.calendar.rsvp'),
		/** @default 'community.lexicon.calendar.rsvp#going' */
		status: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.string<
				| 'community.lexicon.calendar.rsvp#going'
				| 'community.lexicon.calendar.rsvp#interested'
				| 'community.lexicon.calendar.rsvp#notgoing'
				| (string & {})
			>(),
			'community.lexicon.calendar.rsvp#going',
		),
		get subject() {
			return ComAtprotoRepoStrongRef.mainSchema;
		},
	}),
);
const _notgoingSchema = /*#__PURE__*/ v.literal('community.lexicon.calendar.rsvp#notgoing');

type going$schematype = typeof _goingSchema;
type interested$schematype = typeof _interestedSchema;
type main$schematype = typeof _mainSchema;
type notgoing$schematype = typeof _notgoingSchema;

export interface goingSchema extends going$schematype {}
export interface interestedSchema extends interested$schematype {}
export interface mainSchema extends main$schematype {}
export interface notgoingSchema extends notgoing$schematype {}

export const goingSchema = _goingSchema as goingSchema;
export const interestedSchema = _interestedSchema as interestedSchema;
export const mainSchema = _mainSchema as mainSchema;
export const notgoingSchema = _notgoingSchema as notgoingSchema;

export type Going = v.InferInput<typeof goingSchema>;
export type Interested = v.InferInput<typeof interestedSchema>;
export interface Main extends v.InferInput<typeof mainSchema> {}
export type Notgoing = v.InferInput<typeof notgoingSchema>;

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'community.lexicon.calendar.rsvp': mainSchema;
	}
}
