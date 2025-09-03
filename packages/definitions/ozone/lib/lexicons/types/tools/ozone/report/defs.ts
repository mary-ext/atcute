import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _reasonAppealSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonAppeal');
const _reasonChildSafetyCSAMSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonChildSafetyCSAM');
const _reasonChildSafetyEndangermentSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonChildSafetyEndangerment',
);
const _reasonChildSafetyGroomSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonChildSafetyGroom',
);
const _reasonChildSafetyHarassmentSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonChildSafetyHarassment',
);
const _reasonChildSafetyMinorPrivacySchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonChildSafetyMinorPrivacy',
);
const _reasonChildSafetyOtherSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonChildSafetyOther',
);
const _reasonChildSafetyPromotionSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonChildSafetyPromotion',
);
const _reasonCivicDisclosureSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonCivicDisclosure');
const _reasonCivicElectoralProcessSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonCivicElectoralProcess',
);
const _reasonCivicImpersonationSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonCivicImpersonation',
);
const _reasonCivicInterferenceSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonCivicInterference',
);
const _reasonCivicMisinformationSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonCivicMisinformation',
);
const _reasonHarassmentDoxxingSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonHarassmentDoxxing',
);
const _reasonHarassmentHateSpeechSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonHarassmentHateSpeech',
);
const _reasonHarassmentOtherSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonHarassmentOther');
const _reasonHarassmentTargetedSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonHarassmentTargeted',
);
const _reasonHarassmentTrollSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonHarassmentTroll');
const _reasonMisleadingBotSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonMisleadingBot');
const _reasonMisleadingImpersonationSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonMisleadingImpersonation',
);
const _reasonMisleadingMisinformationSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonMisleadingMisinformation',
);
const _reasonMisleadingOtherSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonMisleadingOther');
const _reasonMisleadingScamSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonMisleadingScam');
const _reasonMisleadingSpamSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonMisleadingSpam');
const _reasonMisleadingSyntheticContentSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonMisleadingSyntheticContent',
);
const _reasonRuleBanEvasionSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonRuleBanEvasion');
const _reasonRuleOtherSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonRuleOther');
const _reasonRuleProhibitedSalesSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonRuleProhibitedSales',
);
const _reasonRuleSiteSecuritySchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonRuleSiteSecurity',
);
const _reasonRuleStolenContentSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonRuleStolenContent',
);
const _reasonSexualAbuseContentSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonSexualAbuseContent',
);
const _reasonSexualAnimalSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonSexualAnimal');
const _reasonSexualDeepfakeSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonSexualDeepfake');
const _reasonSexualNCIISchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonSexualNCII');
const _reasonSexualOtherSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonSexualOther');
const _reasonSexualSextortionSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonSexualSextortion',
);
const _reasonSexualUnlabeledSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonSexualUnlabeled');
const _reasonTypeSchema = /*#__PURE__*/ v.string<
	| 'tools.ozone.report.defs#reasonAppeal'
	| 'tools.ozone.report.defs#reasonChildSafetyCSAM'
	| 'tools.ozone.report.defs#reasonChildSafetyEndangerment'
	| 'tools.ozone.report.defs#reasonChildSafetyGroom'
	| 'tools.ozone.report.defs#reasonChildSafetyHarassment'
	| 'tools.ozone.report.defs#reasonChildSafetyMinorPrivacy'
	| 'tools.ozone.report.defs#reasonChildSafetyOther'
	| 'tools.ozone.report.defs#reasonChildSafetyPromotion'
	| 'tools.ozone.report.defs#reasonCivicDisclosure'
	| 'tools.ozone.report.defs#reasonCivicElectoralProcess'
	| 'tools.ozone.report.defs#reasonCivicImpersonation'
	| 'tools.ozone.report.defs#reasonCivicInterference'
	| 'tools.ozone.report.defs#reasonCivicMisinformation'
	| 'tools.ozone.report.defs#reasonHarassmentDoxxing'
	| 'tools.ozone.report.defs#reasonHarassmentHateSpeech'
	| 'tools.ozone.report.defs#reasonHarassmentOther'
	| 'tools.ozone.report.defs#reasonHarassmentTargeted'
	| 'tools.ozone.report.defs#reasonHarassmentTroll'
	| 'tools.ozone.report.defs#reasonMisleadingBot'
	| 'tools.ozone.report.defs#reasonMisleadingImpersonation'
	| 'tools.ozone.report.defs#reasonMisleadingMisinformation'
	| 'tools.ozone.report.defs#reasonMisleadingOther'
	| 'tools.ozone.report.defs#reasonMisleadingScam'
	| 'tools.ozone.report.defs#reasonMisleadingSpam'
	| 'tools.ozone.report.defs#reasonMisleadingSyntheticContent'
	| 'tools.ozone.report.defs#reasonRuleBanEvasion'
	| 'tools.ozone.report.defs#reasonRuleOther'
	| 'tools.ozone.report.defs#reasonRuleProhibitedSales'
	| 'tools.ozone.report.defs#reasonRuleSiteSecurity'
	| 'tools.ozone.report.defs#reasonRuleStolenContent'
	| 'tools.ozone.report.defs#reasonSexualAbuseContent'
	| 'tools.ozone.report.defs#reasonSexualAnimal'
	| 'tools.ozone.report.defs#reasonSexualDeepfake'
	| 'tools.ozone.report.defs#reasonSexualNCII'
	| 'tools.ozone.report.defs#reasonSexualOther'
	| 'tools.ozone.report.defs#reasonSexualSextortion'
	| 'tools.ozone.report.defs#reasonSexualUnlabeled'
	| 'tools.ozone.report.defs#reasonViolenceAnimalWelfare'
	| 'tools.ozone.report.defs#reasonViolenceExtremistContent'
	| 'tools.ozone.report.defs#reasonViolenceGlorification'
	| 'tools.ozone.report.defs#reasonViolenceGraphicContent'
	| 'tools.ozone.report.defs#reasonViolenceOther'
	| 'tools.ozone.report.defs#reasonViolenceSelfHarm'
	| 'tools.ozone.report.defs#reasonViolenceThreats'
	| 'tools.ozone.report.defs#reasonViolenceTrafficking'
	| (string & {})
>();
const _reasonViolenceAnimalWelfareSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonViolenceAnimalWelfare',
);
const _reasonViolenceExtremistContentSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonViolenceExtremistContent',
);
const _reasonViolenceGlorificationSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonViolenceGlorification',
);
const _reasonViolenceGraphicContentSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonViolenceGraphicContent',
);
const _reasonViolenceOtherSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonViolenceOther');
const _reasonViolenceSelfHarmSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonViolenceSelfHarm',
);
const _reasonViolenceThreatsSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonViolenceThreats');
const _reasonViolenceTraffickingSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonViolenceTrafficking',
);

type reasonAppeal$schematype = typeof _reasonAppealSchema;
type reasonChildSafetyCSAM$schematype = typeof _reasonChildSafetyCSAMSchema;
type reasonChildSafetyEndangerment$schematype = typeof _reasonChildSafetyEndangermentSchema;
type reasonChildSafetyGroom$schematype = typeof _reasonChildSafetyGroomSchema;
type reasonChildSafetyHarassment$schematype = typeof _reasonChildSafetyHarassmentSchema;
type reasonChildSafetyMinorPrivacy$schematype = typeof _reasonChildSafetyMinorPrivacySchema;
type reasonChildSafetyOther$schematype = typeof _reasonChildSafetyOtherSchema;
type reasonChildSafetyPromotion$schematype = typeof _reasonChildSafetyPromotionSchema;
type reasonCivicDisclosure$schematype = typeof _reasonCivicDisclosureSchema;
type reasonCivicElectoralProcess$schematype = typeof _reasonCivicElectoralProcessSchema;
type reasonCivicImpersonation$schematype = typeof _reasonCivicImpersonationSchema;
type reasonCivicInterference$schematype = typeof _reasonCivicInterferenceSchema;
type reasonCivicMisinformation$schematype = typeof _reasonCivicMisinformationSchema;
type reasonHarassmentDoxxing$schematype = typeof _reasonHarassmentDoxxingSchema;
type reasonHarassmentHateSpeech$schematype = typeof _reasonHarassmentHateSpeechSchema;
type reasonHarassmentOther$schematype = typeof _reasonHarassmentOtherSchema;
type reasonHarassmentTargeted$schematype = typeof _reasonHarassmentTargetedSchema;
type reasonHarassmentTroll$schematype = typeof _reasonHarassmentTrollSchema;
type reasonMisleadingBot$schematype = typeof _reasonMisleadingBotSchema;
type reasonMisleadingImpersonation$schematype = typeof _reasonMisleadingImpersonationSchema;
type reasonMisleadingMisinformation$schematype = typeof _reasonMisleadingMisinformationSchema;
type reasonMisleadingOther$schematype = typeof _reasonMisleadingOtherSchema;
type reasonMisleadingScam$schematype = typeof _reasonMisleadingScamSchema;
type reasonMisleadingSpam$schematype = typeof _reasonMisleadingSpamSchema;
type reasonMisleadingSyntheticContent$schematype = typeof _reasonMisleadingSyntheticContentSchema;
type reasonRuleBanEvasion$schematype = typeof _reasonRuleBanEvasionSchema;
type reasonRuleOther$schematype = typeof _reasonRuleOtherSchema;
type reasonRuleProhibitedSales$schematype = typeof _reasonRuleProhibitedSalesSchema;
type reasonRuleSiteSecurity$schematype = typeof _reasonRuleSiteSecuritySchema;
type reasonRuleStolenContent$schematype = typeof _reasonRuleStolenContentSchema;
type reasonSexualAbuseContent$schematype = typeof _reasonSexualAbuseContentSchema;
type reasonSexualAnimal$schematype = typeof _reasonSexualAnimalSchema;
type reasonSexualDeepfake$schematype = typeof _reasonSexualDeepfakeSchema;
type reasonSexualNCII$schematype = typeof _reasonSexualNCIISchema;
type reasonSexualOther$schematype = typeof _reasonSexualOtherSchema;
type reasonSexualSextortion$schematype = typeof _reasonSexualSextortionSchema;
type reasonSexualUnlabeled$schematype = typeof _reasonSexualUnlabeledSchema;
type reasonType$schematype = typeof _reasonTypeSchema;
type reasonViolenceAnimalWelfare$schematype = typeof _reasonViolenceAnimalWelfareSchema;
type reasonViolenceExtremistContent$schematype = typeof _reasonViolenceExtremistContentSchema;
type reasonViolenceGlorification$schematype = typeof _reasonViolenceGlorificationSchema;
type reasonViolenceGraphicContent$schematype = typeof _reasonViolenceGraphicContentSchema;
type reasonViolenceOther$schematype = typeof _reasonViolenceOtherSchema;
type reasonViolenceSelfHarm$schematype = typeof _reasonViolenceSelfHarmSchema;
type reasonViolenceThreats$schematype = typeof _reasonViolenceThreatsSchema;
type reasonViolenceTrafficking$schematype = typeof _reasonViolenceTraffickingSchema;

export interface reasonAppealSchema extends reasonAppeal$schematype {}
export interface reasonChildSafetyCSAMSchema extends reasonChildSafetyCSAM$schematype {}
export interface reasonChildSafetyEndangermentSchema extends reasonChildSafetyEndangerment$schematype {}
export interface reasonChildSafetyGroomSchema extends reasonChildSafetyGroom$schematype {}
export interface reasonChildSafetyHarassmentSchema extends reasonChildSafetyHarassment$schematype {}
export interface reasonChildSafetyMinorPrivacySchema extends reasonChildSafetyMinorPrivacy$schematype {}
export interface reasonChildSafetyOtherSchema extends reasonChildSafetyOther$schematype {}
export interface reasonChildSafetyPromotionSchema extends reasonChildSafetyPromotion$schematype {}
export interface reasonCivicDisclosureSchema extends reasonCivicDisclosure$schematype {}
export interface reasonCivicElectoralProcessSchema extends reasonCivicElectoralProcess$schematype {}
export interface reasonCivicImpersonationSchema extends reasonCivicImpersonation$schematype {}
export interface reasonCivicInterferenceSchema extends reasonCivicInterference$schematype {}
export interface reasonCivicMisinformationSchema extends reasonCivicMisinformation$schematype {}
export interface reasonHarassmentDoxxingSchema extends reasonHarassmentDoxxing$schematype {}
export interface reasonHarassmentHateSpeechSchema extends reasonHarassmentHateSpeech$schematype {}
export interface reasonHarassmentOtherSchema extends reasonHarassmentOther$schematype {}
export interface reasonHarassmentTargetedSchema extends reasonHarassmentTargeted$schematype {}
export interface reasonHarassmentTrollSchema extends reasonHarassmentTroll$schematype {}
export interface reasonMisleadingBotSchema extends reasonMisleadingBot$schematype {}
export interface reasonMisleadingImpersonationSchema extends reasonMisleadingImpersonation$schematype {}
export interface reasonMisleadingMisinformationSchema extends reasonMisleadingMisinformation$schematype {}
export interface reasonMisleadingOtherSchema extends reasonMisleadingOther$schematype {}
export interface reasonMisleadingScamSchema extends reasonMisleadingScam$schematype {}
export interface reasonMisleadingSpamSchema extends reasonMisleadingSpam$schematype {}
export interface reasonMisleadingSyntheticContentSchema extends reasonMisleadingSyntheticContent$schematype {}
export interface reasonRuleBanEvasionSchema extends reasonRuleBanEvasion$schematype {}
export interface reasonRuleOtherSchema extends reasonRuleOther$schematype {}
export interface reasonRuleProhibitedSalesSchema extends reasonRuleProhibitedSales$schematype {}
export interface reasonRuleSiteSecuritySchema extends reasonRuleSiteSecurity$schematype {}
export interface reasonRuleStolenContentSchema extends reasonRuleStolenContent$schematype {}
export interface reasonSexualAbuseContentSchema extends reasonSexualAbuseContent$schematype {}
export interface reasonSexualAnimalSchema extends reasonSexualAnimal$schematype {}
export interface reasonSexualDeepfakeSchema extends reasonSexualDeepfake$schematype {}
export interface reasonSexualNCIISchema extends reasonSexualNCII$schematype {}
export interface reasonSexualOtherSchema extends reasonSexualOther$schematype {}
export interface reasonSexualSextortionSchema extends reasonSexualSextortion$schematype {}
export interface reasonSexualUnlabeledSchema extends reasonSexualUnlabeled$schematype {}
export interface reasonTypeSchema extends reasonType$schematype {}
export interface reasonViolenceAnimalWelfareSchema extends reasonViolenceAnimalWelfare$schematype {}
export interface reasonViolenceExtremistContentSchema extends reasonViolenceExtremistContent$schematype {}
export interface reasonViolenceGlorificationSchema extends reasonViolenceGlorification$schematype {}
export interface reasonViolenceGraphicContentSchema extends reasonViolenceGraphicContent$schematype {}
export interface reasonViolenceOtherSchema extends reasonViolenceOther$schematype {}
export interface reasonViolenceSelfHarmSchema extends reasonViolenceSelfHarm$schematype {}
export interface reasonViolenceThreatsSchema extends reasonViolenceThreats$schematype {}
export interface reasonViolenceTraffickingSchema extends reasonViolenceTrafficking$schematype {}

export const reasonAppealSchema = _reasonAppealSchema as reasonAppealSchema;
export const reasonChildSafetyCSAMSchema = _reasonChildSafetyCSAMSchema as reasonChildSafetyCSAMSchema;
export const reasonChildSafetyEndangermentSchema =
	_reasonChildSafetyEndangermentSchema as reasonChildSafetyEndangermentSchema;
export const reasonChildSafetyGroomSchema = _reasonChildSafetyGroomSchema as reasonChildSafetyGroomSchema;
export const reasonChildSafetyHarassmentSchema =
	_reasonChildSafetyHarassmentSchema as reasonChildSafetyHarassmentSchema;
export const reasonChildSafetyMinorPrivacySchema =
	_reasonChildSafetyMinorPrivacySchema as reasonChildSafetyMinorPrivacySchema;
export const reasonChildSafetyOtherSchema = _reasonChildSafetyOtherSchema as reasonChildSafetyOtherSchema;
export const reasonChildSafetyPromotionSchema =
	_reasonChildSafetyPromotionSchema as reasonChildSafetyPromotionSchema;
export const reasonCivicDisclosureSchema = _reasonCivicDisclosureSchema as reasonCivicDisclosureSchema;
export const reasonCivicElectoralProcessSchema =
	_reasonCivicElectoralProcessSchema as reasonCivicElectoralProcessSchema;
export const reasonCivicImpersonationSchema =
	_reasonCivicImpersonationSchema as reasonCivicImpersonationSchema;
export const reasonCivicInterferenceSchema = _reasonCivicInterferenceSchema as reasonCivicInterferenceSchema;
export const reasonCivicMisinformationSchema =
	_reasonCivicMisinformationSchema as reasonCivicMisinformationSchema;
export const reasonHarassmentDoxxingSchema = _reasonHarassmentDoxxingSchema as reasonHarassmentDoxxingSchema;
export const reasonHarassmentHateSpeechSchema =
	_reasonHarassmentHateSpeechSchema as reasonHarassmentHateSpeechSchema;
export const reasonHarassmentOtherSchema = _reasonHarassmentOtherSchema as reasonHarassmentOtherSchema;
export const reasonHarassmentTargetedSchema =
	_reasonHarassmentTargetedSchema as reasonHarassmentTargetedSchema;
export const reasonHarassmentTrollSchema = _reasonHarassmentTrollSchema as reasonHarassmentTrollSchema;
export const reasonMisleadingBotSchema = _reasonMisleadingBotSchema as reasonMisleadingBotSchema;
export const reasonMisleadingImpersonationSchema =
	_reasonMisleadingImpersonationSchema as reasonMisleadingImpersonationSchema;
export const reasonMisleadingMisinformationSchema =
	_reasonMisleadingMisinformationSchema as reasonMisleadingMisinformationSchema;
export const reasonMisleadingOtherSchema = _reasonMisleadingOtherSchema as reasonMisleadingOtherSchema;
export const reasonMisleadingScamSchema = _reasonMisleadingScamSchema as reasonMisleadingScamSchema;
export const reasonMisleadingSpamSchema = _reasonMisleadingSpamSchema as reasonMisleadingSpamSchema;
export const reasonMisleadingSyntheticContentSchema =
	_reasonMisleadingSyntheticContentSchema as reasonMisleadingSyntheticContentSchema;
export const reasonRuleBanEvasionSchema = _reasonRuleBanEvasionSchema as reasonRuleBanEvasionSchema;
export const reasonRuleOtherSchema = _reasonRuleOtherSchema as reasonRuleOtherSchema;
export const reasonRuleProhibitedSalesSchema =
	_reasonRuleProhibitedSalesSchema as reasonRuleProhibitedSalesSchema;
export const reasonRuleSiteSecuritySchema = _reasonRuleSiteSecuritySchema as reasonRuleSiteSecuritySchema;
export const reasonRuleStolenContentSchema = _reasonRuleStolenContentSchema as reasonRuleStolenContentSchema;
export const reasonSexualAbuseContentSchema =
	_reasonSexualAbuseContentSchema as reasonSexualAbuseContentSchema;
export const reasonSexualAnimalSchema = _reasonSexualAnimalSchema as reasonSexualAnimalSchema;
export const reasonSexualDeepfakeSchema = _reasonSexualDeepfakeSchema as reasonSexualDeepfakeSchema;
export const reasonSexualNCIISchema = _reasonSexualNCIISchema as reasonSexualNCIISchema;
export const reasonSexualOtherSchema = _reasonSexualOtherSchema as reasonSexualOtherSchema;
export const reasonSexualSextortionSchema = _reasonSexualSextortionSchema as reasonSexualSextortionSchema;
export const reasonSexualUnlabeledSchema = _reasonSexualUnlabeledSchema as reasonSexualUnlabeledSchema;
export const reasonTypeSchema = _reasonTypeSchema as reasonTypeSchema;
export const reasonViolenceAnimalWelfareSchema =
	_reasonViolenceAnimalWelfareSchema as reasonViolenceAnimalWelfareSchema;
export const reasonViolenceExtremistContentSchema =
	_reasonViolenceExtremistContentSchema as reasonViolenceExtremistContentSchema;
export const reasonViolenceGlorificationSchema =
	_reasonViolenceGlorificationSchema as reasonViolenceGlorificationSchema;
export const reasonViolenceGraphicContentSchema =
	_reasonViolenceGraphicContentSchema as reasonViolenceGraphicContentSchema;
export const reasonViolenceOtherSchema = _reasonViolenceOtherSchema as reasonViolenceOtherSchema;
export const reasonViolenceSelfHarmSchema = _reasonViolenceSelfHarmSchema as reasonViolenceSelfHarmSchema;
export const reasonViolenceThreatsSchema = _reasonViolenceThreatsSchema as reasonViolenceThreatsSchema;
export const reasonViolenceTraffickingSchema =
	_reasonViolenceTraffickingSchema as reasonViolenceTraffickingSchema;

export type ReasonAppeal = v.InferInput<typeof reasonAppealSchema>;
export type ReasonChildSafetyCSAM = v.InferInput<typeof reasonChildSafetyCSAMSchema>;
export type ReasonChildSafetyEndangerment = v.InferInput<typeof reasonChildSafetyEndangermentSchema>;
export type ReasonChildSafetyGroom = v.InferInput<typeof reasonChildSafetyGroomSchema>;
export type ReasonChildSafetyHarassment = v.InferInput<typeof reasonChildSafetyHarassmentSchema>;
export type ReasonChildSafetyMinorPrivacy = v.InferInput<typeof reasonChildSafetyMinorPrivacySchema>;
export type ReasonChildSafetyOther = v.InferInput<typeof reasonChildSafetyOtherSchema>;
export type ReasonChildSafetyPromotion = v.InferInput<typeof reasonChildSafetyPromotionSchema>;
export type ReasonCivicDisclosure = v.InferInput<typeof reasonCivicDisclosureSchema>;
export type ReasonCivicElectoralProcess = v.InferInput<typeof reasonCivicElectoralProcessSchema>;
export type ReasonCivicImpersonation = v.InferInput<typeof reasonCivicImpersonationSchema>;
export type ReasonCivicInterference = v.InferInput<typeof reasonCivicInterferenceSchema>;
export type ReasonCivicMisinformation = v.InferInput<typeof reasonCivicMisinformationSchema>;
export type ReasonHarassmentDoxxing = v.InferInput<typeof reasonHarassmentDoxxingSchema>;
export type ReasonHarassmentHateSpeech = v.InferInput<typeof reasonHarassmentHateSpeechSchema>;
export type ReasonHarassmentOther = v.InferInput<typeof reasonHarassmentOtherSchema>;
export type ReasonHarassmentTargeted = v.InferInput<typeof reasonHarassmentTargetedSchema>;
export type ReasonHarassmentTroll = v.InferInput<typeof reasonHarassmentTrollSchema>;
export type ReasonMisleadingBot = v.InferInput<typeof reasonMisleadingBotSchema>;
export type ReasonMisleadingImpersonation = v.InferInput<typeof reasonMisleadingImpersonationSchema>;
export type ReasonMisleadingMisinformation = v.InferInput<typeof reasonMisleadingMisinformationSchema>;
export type ReasonMisleadingOther = v.InferInput<typeof reasonMisleadingOtherSchema>;
export type ReasonMisleadingScam = v.InferInput<typeof reasonMisleadingScamSchema>;
export type ReasonMisleadingSpam = v.InferInput<typeof reasonMisleadingSpamSchema>;
export type ReasonMisleadingSyntheticContent = v.InferInput<typeof reasonMisleadingSyntheticContentSchema>;
export type ReasonRuleBanEvasion = v.InferInput<typeof reasonRuleBanEvasionSchema>;
export type ReasonRuleOther = v.InferInput<typeof reasonRuleOtherSchema>;
export type ReasonRuleProhibitedSales = v.InferInput<typeof reasonRuleProhibitedSalesSchema>;
export type ReasonRuleSiteSecurity = v.InferInput<typeof reasonRuleSiteSecuritySchema>;
export type ReasonRuleStolenContent = v.InferInput<typeof reasonRuleStolenContentSchema>;
export type ReasonSexualAbuseContent = v.InferInput<typeof reasonSexualAbuseContentSchema>;
export type ReasonSexualAnimal = v.InferInput<typeof reasonSexualAnimalSchema>;
export type ReasonSexualDeepfake = v.InferInput<typeof reasonSexualDeepfakeSchema>;
export type ReasonSexualNCII = v.InferInput<typeof reasonSexualNCIISchema>;
export type ReasonSexualOther = v.InferInput<typeof reasonSexualOtherSchema>;
export type ReasonSexualSextortion = v.InferInput<typeof reasonSexualSextortionSchema>;
export type ReasonSexualUnlabeled = v.InferInput<typeof reasonSexualUnlabeledSchema>;
export type ReasonType = v.InferInput<typeof reasonTypeSchema>;
export type ReasonViolenceAnimalWelfare = v.InferInput<typeof reasonViolenceAnimalWelfareSchema>;
export type ReasonViolenceExtremistContent = v.InferInput<typeof reasonViolenceExtremistContentSchema>;
export type ReasonViolenceGlorification = v.InferInput<typeof reasonViolenceGlorificationSchema>;
export type ReasonViolenceGraphicContent = v.InferInput<typeof reasonViolenceGraphicContentSchema>;
export type ReasonViolenceOther = v.InferInput<typeof reasonViolenceOtherSchema>;
export type ReasonViolenceSelfHarm = v.InferInput<typeof reasonViolenceSelfHarmSchema>;
export type ReasonViolenceThreats = v.InferInput<typeof reasonViolenceThreatsSchema>;
export type ReasonViolenceTrafficking = v.InferInput<typeof reasonViolenceTraffickingSchema>;
