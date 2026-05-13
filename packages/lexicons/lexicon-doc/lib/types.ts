import type { Nsid } from '@atcute/lexicons';

// #region Concrete types
/** definition for a boolean field */
export interface LexBoolean {
	type: 'boolean';
	description?: string;
	/** default value for this field */
	default?: boolean;
	/** fixed (constant) value for this field */
	const?: boolean;
}

/** definition for a signed integer field */
export interface LexInteger {
	type: 'integer';
	description?: string;
	/** default value for this field */
	default?: number;
	/** minimum acceptable value */
	minimum?: number;
	/** maximum acceptable value */
	maximum?: number;
	/** closed set of allowed values */
	enum?: number[];
	/** fixed (constant) value for this field */
	const?: number;
}

/** formats allowed for string definitions */
export type LexStringFormat =
	| 'datetime'
	| 'uri'
	| 'at-uri'
	| 'did'
	| 'handle'
	| 'at-identifier'
	| 'nsid'
	| 'cid'
	| 'language'
	| 'tid'
	| 'record-key';

/** definition for a string field */
export interface LexString {
	type: 'string';
	description?: string;
	/** constrains the string format and provides semantic context */
	format?: LexStringFormat;
	/** default value for this field */
	default?: string;
	/** minimum length in UTF-8 bytes */
	minLength?: number;
	/** maximum length in UTF-8 bytes */
	maxLength?: number;
	/** minimum length counted as unicode grapheme clusters */
	minGraphemes?: number;
	/** maximum length counted as unicode grapheme clusters */
	maxGraphemes?: number;
	/** closed set of allowed values */
	enum?: string[];
	/** constant value for this field; mutually exclusive with default */
	const?: string;
	/** suggested or common values */
	knownValues?: string[];
}

/** definition for raw binary data */
export interface LexBytes {
	type: 'bytes';
	description?: string;
	/** minimum size in raw bytes */
	minLength?: number;
	/** maximum size in raw bytes */
	maxLength?: number;
}

/** definition for a link to another resource */
export interface LexCidLink {
	type: 'cid-link';
	description?: string;
}

/** definition for binary attachments (images, videos, etc.) */
export interface LexBlob {
	type: 'blob';
	description?: string;
	/** list of acceptable MIME types; may end in * as glob pattern (e.g., image/*) */
	accept?: string[];
	/** maximum size in bytes */
	maxSize?: number;
}

/** primitive type definitions */
export type LexPrimitive = LexBoolean | LexInteger | LexString;

/** concrete type definitions */
export type LexConcrete = LexBoolean | LexInteger | LexString | LexBytes | LexCidLink | LexBlob;
// #endregion

// #region Meta types
/** definition for an empty data value that exists only to be referenced by name */
export interface LexToken {
	type: 'token';
	/** should clarify the meaning of the token */
	description?: string;
}

/** definition that references another schema for reuse */
export interface LexRef {
	type: 'ref';
	description?: string;
	/** reference to another schema definition (e.g., "com.example.foo#bar" or "#localDef") */
	ref: string;
}

/** union definition referencing multiple possible types at a schema location */
export interface LexRefUnion {
	type: 'union';
	description?: string;
	/** references to schema definitions that are possible variants */
	refs: string[];
	/** if true, the union is closed and cannot be extended in the future; defaults to false (open) */
	closed?: boolean;
}

/** definition for an unknown type that allows any data object with no specific validation */
export interface LexUnknown {
	type: 'unknown';
	description?: string;
}

/** meta definitions that can point to other schemas */
export type LexRefVariant = LexRef | LexRefUnion;

/** meta definitions that provide indirection or represent abstract values */
export type LexMeta = LexToken | LexRef | LexRefUnion | LexUnknown;
// #endregion

// #region Container types
/** field definitions that can be declared inline in object properties and array items */
export type LexDefinableField = LexConcrete | LexRef | LexRefUnion | LexUnknown | LexArray;

/** all possible field definitions including those that must be referenced */
export type LexField = LexConcrete | LexMeta | LexContainer;

/** definition for an array field */
export interface LexArray {
	type: 'array';
	description?: string;
	/** schema for array elements */
	items: LexDefinableField;
	/** minimum count of elements */
	minLength?: number;
	/** maximum count of elements */
	maxLength?: number;
}

/** definition for an array field restricted to primitive element types */
export interface LexPrimitiveArray {
	type: 'array';
	description?: string;
	/** primitive type for array elements */
	items: LexPrimitive;
	/** minimum count of elements */
	minLength?: number;
	/** maximum count of elements */
	maxLength?: number;
}

/** object definition that can be nested or defined by reference */
export interface LexObject {
	type: 'object';
	description?: string;
	/** list of property names that are required */
	required?: string[];
	/** list of property names that can have null as a value */
	nullable?: string[];
	/** defines the properties (fields) by name, each with their own schema */
	properties?: Record<string, LexDefinableField>;
}

/** container definitions that can hold other types */
export type LexContainer = LexArray | LexObject;
// #endregion

// #region Miscellaneous
/** definition for an HTTP request or response body for XRPC endpoints */
export interface LexXrpcBody {
	description?: string;
	/** MIME type for body contents (e.g., application/json) */
	encoding: string;
	/** schema definition for JSON-encoded bodies; may be omitted even for JSON responses */
	schema?: LexRefVariant | LexObject;
}

/** definition for event stream messages in subscriptions */
export interface LexXrpcSubscriptionMessage {
	description?: string;
	/** a union of refs */
	schema?: LexRefUnion;
}

/** definition for an error code that may be returned from XRPC endpoints */
export interface LexXrpcError {
	/** short name for the error type, with no whitespace */
	name: string;
	description?: string;
}

/** map of language-specific string translations */
export type LexLang = Record<string, string | undefined>;
// #endregion

// #region Sub-types
/** definition for HTTP query parameters for XRPC endpoints */
export interface LexXrpcParameters {
	type: 'params';
	description?: string;
	/** list of property names that are required */
	required?: string[];
	/** property definitions, restricted to primitives and primitive arrays */
	properties?: Record<string, LexPrimitive | LexPrimitiveArray>;
}

/** definition for a permission entry within a permission set */
export interface LexPermission {
	type: 'permission';
	/** resource this permission applies to */
	resource: string;
	[key: string]: string | number | boolean | (string | number | boolean)[] | undefined;
}
// #endregion

// #region Primary types
/** definition for an object that can be stored in a repository record */
export interface LexRecord {
	type: 'record';
	description?: string;
	/** specifies the record key type (tid, nsid, any, or literal:<value>) */
	key?: 'tid' | 'nsid' | 'any' | `literal:${string}`;
	/** object schema defining the structure of this record type */
	record: LexObject;
}

/** definition for an XRPC query endpoint (HTTP GET) */
export interface LexXrpcQuery {
	type: 'query';
	description?: string;
	/** HTTP query parameters */
	parameters?: LexXrpcParameters;
	/** HTTP response body schema */
	output?: LexXrpcBody;
	/** possible error codes that may be returned */
	errors?: LexXrpcError[];
}

/** definition for an XRPC procedure endpoint (HTTP POST) */
export interface LexXrpcProcedure {
	type: 'procedure';
	description?: string;
	/** HTTP query parameters */
	parameters?: LexXrpcParameters;
	/** HTTP request body schema */
	input?: LexXrpcBody;
	/** HTTP response body schema */
	output?: LexXrpcBody;
	/** possible error codes that may be returned */
	errors?: LexXrpcError[];
}

/** definition for an XRPC subscription endpoint (WebSocket) */
export interface LexXrpcSubscription {
	type: 'subscription';
	description?: string;
	/** query parameters for establishing the subscription */
	parameters?: LexXrpcParameters;
	/** schema for messages sent over the stream */
	message?: LexXrpcSubscriptionMessage;
	/** possible error codes that may be returned */
	errors?: LexXrpcError[];
}

/** definition for a set of permissions that can be requested */
export interface LexPermissionSet {
	type: 'permission-set';
	description?: string;
	/** short title for the permission set */
	title?: string;
	/** localized titles in different languages */
	'title:lang'?: LexLang;
	/** detailed description of what these permissions grant */
	detail?: string;
	/** localized detailed descriptions */
	'detail:lang'?: LexLang;
	/** list of individual permissions in this set */
	permissions: LexPermission[];
}

/** primary type definitions */
export type LexPrimary = LexRecord | LexXrpcQuery | LexXrpcProcedure | LexXrpcSubscription | LexPermissionSet;
// #endregion

// #region Document
/** type definitions that can be declared as named entries in a lexicon file */
export type LexUserType = LexPrimary | LexConcrete | LexToken | LexUnknown | LexContainer;

/** a lexicon document */
export interface LexiconDoc {
	/** indicates lexicon language version; fixed value of 1 for this version */
	lexicon: 1;
	/** the NSID of this lexicon */
	id: Nsid;
	/** optional revision number for versioning */
	revision?: number;
	/** short overview of the lexicon, usually one or two sentences */
	description?: string;
	/** set of definitions */
	defs: Record<string, LexUserType>;
}
// #endregion
