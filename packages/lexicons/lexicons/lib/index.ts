export type { ActorIdentifier } from './syntax/at-identifier.js';
export {
	isCanonicalResourceUri,
	isResourceUri,
	parseCanonicalResourceUri,
	parseResourceUri,
	type CanonicalResourceUri,
	type ParsedCanonicalResourceUri,
	type ParsedResourceUri,
	type ResourceUri,
} from './syntax/at-uri.js';
export type { Cid } from './syntax/cid.js';
export type { Datetime } from './syntax/datetime.js';
export type { Did } from './syntax/did.js';
export type { Handle } from './syntax/handle.js';
export type { LanguageCode } from './syntax/language.js';
export type { Nsid } from './syntax/nsid.js';
export type { RecordKey } from './syntax/record-key.js';
export type { Tid } from './syntax/tid.js';
export type { GenericUri } from './syntax/uri.js';

export type { Blob, LegacyBlob } from './interfaces/blob.js';
export type { Bytes } from './interfaces/bytes.js';
export type { CidLink } from './interfaces/cid-link.js';

export type { $type } from './types/brand.js';

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
} from './validations/index.js';
