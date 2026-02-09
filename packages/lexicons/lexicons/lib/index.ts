export type { ActorIdentifier } from './syntax/at-identifier.ts';
export {
	isCanonicalResourceUri,
	isResourceUri,
	parseCanonicalResourceUri,
	parseResourceUri,
	type CanonicalResourceUri,
	type ParsedCanonicalResourceUri,
	type ParsedResourceUri,
	type ResourceUri,
} from './syntax/at-uri.ts';
export type { Cid } from './syntax/cid.ts';
export type { Datetime } from './syntax/datetime.ts';
export type { Did } from './syntax/did.ts';
export type { Handle } from './syntax/handle.ts';
export type { LanguageCode } from './syntax/language.ts';
export type { Nsid } from './syntax/nsid.ts';
export type { RecordKey } from './syntax/record-key.ts';
export type { Tid } from './syntax/tid.ts';
export type { GenericUri } from './syntax/uri.ts';

export type { Blob, LegacyBlob } from './interfaces/blob.ts';
export type { Bytes } from './interfaces/bytes.ts';
export type { CidLink } from './interfaces/cid-link.ts';

export type { $type } from './types/brand.ts';

export {
	is,
	parse,
	safeParse,
	ValidationError,
	type InferInput,
	type InferOutput,
	type InferXRPCBodyInput,
	type InferXRPCBodyOutput,
	type ValidationResult,
} from './validations/index.ts';
