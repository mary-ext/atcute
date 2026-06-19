// oxlint-disable typescript/no-explicit-any

import type { BaseSchema, InferOutput, XRPCSubscriptionMetadata } from '@atcute/lexicons/validations';

import type { CloseEvent, ErrorEvent, Options } from 'partysocket/ws';

/** wire subprotocol tokens the firehose client knows how to decode */
export type Subprotocol = 'xrpc.v0.cbor' | 'xrpc.v1.cbor' | 'xrpc.v1.json';

/** extracts the params type from an XRPC subscription schema */
export type ParamsOf<T> =
	T extends XRPCSubscriptionMetadata<infer TParams, any, any>
		? TParams extends null
			? undefined
			: TParams extends BaseSchema
				? InferOutput<TParams>
				: never
		: never;

/** extracts the message type from an XRPC subscription schema */
export type MessageOf<T> =
	T extends XRPCSubscriptionMetadata<any, infer TMessage, any>
		? TMessage extends null
			? unknown
			: TMessage extends BaseSchema
				? InferOutput<TMessage>
				: never
		: never;

/** configuration options for FirehoseSubscription */
export interface FirehoseSubscriptionOptions<TSchema extends XRPCSubscriptionMetadata> {
	/** XRPC service URL(s) to connect to */
	service: string | string[];

	/** XRPC subscription schema from @atcute/lexicons */
	nsid: TSchema;

	/**
	 * subscription parameters - can be a static object or a function that returns params. the function is
	 * called on each connection attempt, allowing for dynamic cursor tracking and reconnection state
	 * management.
	 */
	params?: ParamsOf<TSchema> | (() => ParamsOf<TSchema>);

	/**
	 * whether to validate incoming events against the schema
	 *
	 * @default true
	 */
	validateEvents?: boolean;

	/**
	 * wire subprotocols to offer during the WebSocket handshake, in preference order, sent via the
	 * `Sec-WebSocket-Protocol` header. the server selects one it supports, and frames are decoded accordingly.
	 *
	 * when omitted, the stream's lexicon-declared `subprotocol` is offered if it has one; an unnegotiated
	 * connection then decodes using that declared default, falling back to legacy `xrpc.v0.cbor`.
	 */
	subprotocols?: Subprotocol[];

	onConnectionOpen?: (event: Event) => void;
	onConnectionClose?: (event: CloseEvent) => void;
	onConnectionError?: (event: ErrorEvent) => void;
	/**
	 * called for non-fatal frame-level errors: atproto error frames (passed as `FirehoseError`) and message
	 * validation failures (passed as `ValidationError`).
	 */
	onError?: (err: unknown) => void;

	/** WebSocket connection options */
	ws?: Options;
}

/** decoded CBOR frame header */
export interface FrameHeader {
	/** operation code: 1 for message, -1 for error */
	op: 1 | -1;

	/** type discriminator for message frames (relative to NSID, e.g., "#commit") */
	t?: string;
}

/** error frame body */
export interface ErrorFrameBody {
	error: string;
	message?: string;
}

/** decoded frame result */
export type DecodedFrame =
	| {
			type: 'message';
			body: unknown;
	  }
	| {
			type: 'error';
			error: string;
			message?: string;
	  };
