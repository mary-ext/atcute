import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as CommunityLexiconLocationAddress from '../location/address.js';
import * as CommunityLexiconLocationFsq from '../location/fsq.js';
import * as CommunityLexiconLocationGeo from '../location/geo.js';
import * as CommunityLexiconLocationHthree from '../location/hthree.js';

const _cancelledSchema = /*#__PURE__*/ v.literal('community.lexicon.calendar.event#cancelled');
const _hybridSchema = /*#__PURE__*/ v.literal('community.lexicon.calendar.event#hybrid');
const _inpersonSchema = /*#__PURE__*/ v.literal('community.lexicon.calendar.event#inperson');
const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('community.lexicon.calendar.event'),
		/**
		 * Client-declared timestamp when the event was created.
		 */
		createdAt: /*#__PURE__*/ v.datetimeString(),
		/**
		 * The description of the event.
		 */
		description: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Client-declared timestamp when the event ends.
		 */
		endsAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		/**
		 * The locations where the event takes place.
		 */
		get locations() {
			return /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.array(
					/*#__PURE__*/ v.variant([
						uriSchema,
						CommunityLexiconLocationAddress.mainSchema,
						CommunityLexiconLocationFsq.mainSchema,
						CommunityLexiconLocationGeo.mainSchema,
						CommunityLexiconLocationHthree.mainSchema,
					]),
				),
			);
		},
		/**
		 * The attendance mode of the event.
		 */
		get mode() {
			return /*#__PURE__*/ v.optional(modeSchema);
		},
		/**
		 * The name of the event.
		 */
		name: /*#__PURE__*/ v.string(),
		/**
		 * Client-declared timestamp when the event starts.
		 */
		startsAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		/**
		 * The status of the event.
		 */
		get status() {
			return /*#__PURE__*/ v.optional(statusSchema);
		},
		/**
		 * URIs associated with the event.
		 */
		get uris() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(uriSchema));
		},
	}),
);
const _modeSchema = /*#__PURE__*/ v.optional(
	/*#__PURE__*/ v.string<
		| 'community.lexicon.calendar.event#hybrid'
		| 'community.lexicon.calendar.event#inperson'
		| 'community.lexicon.calendar.event#virtual'
		| (string & {})
	>(),
	'community.lexicon.calendar.event#inperson',
);
const _plannedSchema = /*#__PURE__*/ v.literal('community.lexicon.calendar.event#planned');
const _postponedSchema = /*#__PURE__*/ v.literal('community.lexicon.calendar.event#postponed');
const _rescheduledSchema = /*#__PURE__*/ v.literal('community.lexicon.calendar.event#rescheduled');
const _scheduledSchema = /*#__PURE__*/ v.literal('community.lexicon.calendar.event#scheduled');
const _statusSchema = /*#__PURE__*/ v.optional(
	/*#__PURE__*/ v.string<
		| 'community.lexicon.calendar.event#cancelled'
		| 'community.lexicon.calendar.event#planned'
		| 'community.lexicon.calendar.event#postponed'
		| 'community.lexicon.calendar.event#rescheduled'
		| 'community.lexicon.calendar.event#scheduled'
		| (string & {})
	>(),
	'community.lexicon.calendar.event#scheduled',
);
const _uriSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('community.lexicon.calendar.event#uri')),
	/**
	 * The display name of the URI.
	 */
	name: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	uri: /*#__PURE__*/ v.genericUriString(),
});
const _virtualSchema = /*#__PURE__*/ v.literal('community.lexicon.calendar.event#virtual');

type cancelled$schematype = typeof _cancelledSchema;
type hybrid$schematype = typeof _hybridSchema;
type inperson$schematype = typeof _inpersonSchema;
type main$schematype = typeof _mainSchema;
type mode$schematype = typeof _modeSchema;
type planned$schematype = typeof _plannedSchema;
type postponed$schematype = typeof _postponedSchema;
type rescheduled$schematype = typeof _rescheduledSchema;
type scheduled$schematype = typeof _scheduledSchema;
type status$schematype = typeof _statusSchema;
type uri$schematype = typeof _uriSchema;
type virtual$schematype = typeof _virtualSchema;

export interface cancelledSchema extends cancelled$schematype {}
export interface hybridSchema extends hybrid$schematype {}
export interface inpersonSchema extends inperson$schematype {}
export interface mainSchema extends main$schematype {}
export interface modeSchema extends mode$schematype {}
export interface plannedSchema extends planned$schematype {}
export interface postponedSchema extends postponed$schematype {}
export interface rescheduledSchema extends rescheduled$schematype {}
export interface scheduledSchema extends scheduled$schematype {}
export interface statusSchema extends status$schematype {}
export interface uriSchema extends uri$schematype {}
export interface virtualSchema extends virtual$schematype {}

export const cancelledSchema = _cancelledSchema as cancelledSchema;
export const hybridSchema = _hybridSchema as hybridSchema;
export const inpersonSchema = _inpersonSchema as inpersonSchema;
export const mainSchema = _mainSchema as mainSchema;
export const modeSchema = _modeSchema as modeSchema;
export const plannedSchema = _plannedSchema as plannedSchema;
export const postponedSchema = _postponedSchema as postponedSchema;
export const rescheduledSchema = _rescheduledSchema as rescheduledSchema;
export const scheduledSchema = _scheduledSchema as scheduledSchema;
export const statusSchema = _statusSchema as statusSchema;
export const uriSchema = _uriSchema as uriSchema;
export const virtualSchema = _virtualSchema as virtualSchema;

export type Cancelled = v.InferInput<typeof cancelledSchema>;
export type Hybrid = v.InferInput<typeof hybridSchema>;
export type Inperson = v.InferInput<typeof inpersonSchema>;
export interface Main extends v.InferInput<typeof mainSchema> {}
export type Mode = v.InferInput<typeof modeSchema>;
export type Planned = v.InferInput<typeof plannedSchema>;
export type Postponed = v.InferInput<typeof postponedSchema>;
export type Rescheduled = v.InferInput<typeof rescheduledSchema>;
export type Scheduled = v.InferInput<typeof scheduledSchema>;
export type Status = v.InferInput<typeof statusSchema>;
export interface Uri extends v.InferInput<typeof uriSchema> {}
export type Virtual = v.InferInput<typeof virtualSchema>;

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'community.lexicon.calendar.event': mainSchema;
	}
}
