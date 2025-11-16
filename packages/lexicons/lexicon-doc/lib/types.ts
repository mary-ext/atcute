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

export interface LexBoolean {
	type: 'boolean';
	description?: string;
	default?: boolean;
	const?: boolean;
}

export interface LexInteger {
	type: 'integer';
	description?: string;
	default?: number;
	minimum?: number;
	maximum?: number;
	enum?: number[];
	const?: number;
}

export interface LexString {
	type: 'string';
	format?: LexStringFormat;
	description?: string;
	default?: string;
	minLength?: number;
	maxLength?: number;
	minGraphemes?: number;
	maxGraphemes?: number;
	enum?: string[];
	const?: string;
	knownValues?: string[];
}

export interface LexUnknown {
	type: 'unknown';
	description?: string;
}

export type LexPrimitive = LexBoolean | LexInteger | LexString | LexUnknown;

export interface LexBytes {
	type: 'bytes';
	description?: string;
	minLength?: number;
	maxLength?: number;
}

export interface LexCidLink {
	type: 'cid-link';
	description?: string;
}

export type LexIpldType = LexBytes | LexCidLink;

export interface LexRef {
	type: 'ref';
	description?: string;
	ref: string;
}

export interface LexRefUnion {
	type: 'union';
	description?: string;
	refs: string[];
	closed?: boolean;
}

export type LexRefVariant = LexRef | LexRefUnion;

export interface LexBlob {
	type: 'blob';
	description?: string;
	accept?: string[];
	maxSize?: number;
}

export interface LexArray {
	type: 'array';
	description?: string;
	items: LexPrimitive | LexIpldType | LexRefVariant | LexBlob;
	minLength?: number;
	maxLength?: number;
}

export interface LexPrimitiveArray {
	type: 'array';
	description?: string;
	items: LexPrimitive;
	minLength?: number;
	maxLength?: number;
}

export interface LexToken {
	type: 'token';
	description?: string;
}

export interface LexObject {
	type: 'object';
	description?: string;
	required?: string[];
	nullable?: string[];
	properties?: Record<string, LexArray | LexPrimitive | LexIpldType | LexRefVariant | LexBlob>;
}

export interface LexXrpcParameters {
	type: 'params';
	description?: string;
	required?: string[];
	properties?: Record<string, LexPrimitive | LexPrimitiveArray>;
}

export interface LexXrpcBody {
	description?: string;
	encoding: string;
	schema?: LexRefVariant | LexObject;
}

export interface LexXrpcSubscriptionMessage {
	description?: string;
	schema?: LexRefVariant | LexObject;
}

export interface LexXrpcError {
	name: string;
	description?: string;
}

export interface LexXrpcQuery {
	type: 'query';
	description?: string;
	parameters?: LexXrpcParameters;
	output?: LexXrpcBody;
	errors?: LexXrpcError[];
}

export interface LexXrpcProcedure {
	type: 'procedure';
	description?: string;
	parameters?: LexXrpcParameters;
	input?: LexXrpcBody;
	output?: LexXrpcBody;
	errors?: LexXrpcError[];
}

export interface LexXrpcSubscription {
	type: 'subscription';
	description?: string;
	parameters?: LexXrpcParameters;
	message?: LexXrpcSubscriptionMessage;
	errors?: LexXrpcError[];
}

export type LexLang = Record<string, string | undefined>;

export interface LexPermission {
	type: 'permission';
	resource: string;
	[key: string]: string | number | boolean | (string | number | boolean)[] | undefined;
}

export interface LexPermissionSet {
	type: 'permission-set';
	description?: string;
	title?: string;
	'title:lang'?: LexLang;
	detail?: string;
	'detail:lang'?: LexLang;
	permissions: LexPermission[];
}

export interface LexRecord {
	type: 'record';
	description?: string;
	key?: 'tid' | 'nsid' | 'any' | `literal:${string}`;
	record: LexObject;
}

export type LexUserType =
	| LexRecord
	| LexXrpcQuery
	| LexXrpcProcedure
	| LexXrpcSubscription
	| LexPermissionSet
	| LexObject
	| LexArray
	| LexToken
	| LexIpldType
	| LexBlob
	| LexPrimitive;

export interface LexiconDoc {
	lexicon: 1;
	id: string;
	revision?: number;
	description?: string;
	defs: Record<string, LexUserType>;
}
