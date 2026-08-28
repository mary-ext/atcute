// oxlint-disable typescript/no-explicit-any

import type {
	BaseSchema,
	InferInput,
	InferOutput,
	XRPCSubprotocol,
	XRPCSubscriptionMetadata,
} from '@atcute/lexicons/validations';

import type { CloseEvent, ErrorEvent, Options } from 'partysocket/ws';

/** extracts the params type from an XRPC subscription schema */
export type ParamsOf<T> =
	T extends XRPCSubscriptionMetadata<infer TParams, any, any>
		? TParams extends null
			? undefined
			: TParams extends BaseSchema
				? InferInput<TParams>
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
	params?: ParamsOf<TSchema> | (() => ParamsOf<TSchema> | PromiseLike<ParamsOf<TSchema>>);

	/** subprotocol to request; defaults to the schema value or `xrpc.v0.cbor` */
	subprotocol?: XRPCSubprotocol;

	/**
	 * whether to validate incoming events against the schema
	 *
	 * @default true
	 */
	validateEvents?: boolean;

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

	/** signal that closes the connection and rejects iteration with its abort reason */
	signal?: AbortSignal;
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
