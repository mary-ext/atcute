import type { InferOutput, XRPCSubscriptionMetadata } from '@atcute/lexicons/validations';

import type { CloseEvent, ErrorEvent, Options } from 'partysocket/ws';

import type { BaseSchema } from '@atcute/lexicons/validations';

/**
 * extracts the params type from an XRPC subscription schema
 */
export type ParamsOf<T> = T extends XRPCSubscriptionMetadata<infer TParams, any, any>
	? TParams extends null
		? undefined
		: TParams extends BaseSchema
			? InferOutput<TParams>
			: never
	: never;

/**
 * extracts the message type from an XRPC subscription schema
 */
export type MessageOf<T> = T extends XRPCSubscriptionMetadata<any, infer TMessage, any>
	? TMessage extends null
		? unknown
		: TMessage extends BaseSchema
			? InferOutput<TMessage>
			: never
	: never;

/**
 * configuration options for FirehoseSubscription
 */
export interface FirehoseSubscriptionOptions<TSchema extends XRPCSubscriptionMetadata> {
	/**
	 * XRPC service URL(s) to connect to
	 */
	service: string | string[];

	/**
	 * XRPC subscription schema from @atcute/lexicons
	 */
	nsid: TSchema;

	/**
	 * subscription parameters - can be a static object or a function that returns
	 * params. the function is called on each connection attempt, allowing for
	 * dynamic cursor tracking and reconnection state management.
	 */
	params?: ParamsOf<TSchema> | (() => ParamsOf<TSchema>);

	/**
	 * whether to validate incoming messages against the schema
	 * @default true
	 */
	validateMessages?: boolean;

	onConnectionOpen?: (event: Event) => void;
	onConnectionClose?: (event: CloseEvent) => void;
	onConnectionError?: (event: ErrorEvent) => void;
	onError?: (error: string, message?: string) => void;

	/**
	 * WebSocket connection options
	 */
	ws?: Options;
}

/**
 * decoded CBOR frame header
 */
export interface FrameHeader {
	/**
	 * operation code: 1 for message, -1 for error
	 */
	op: 1 | -1;

	/**
	 * type discriminator for message frames (relative to NSID, e.g., "#commit")
	 */
	t?: string;
}

/**
 * error frame body
 */
export interface ErrorFrameBody {
	error: string;
	message?: string;
}

/**
 * decoded frame result
 */
export type DecodedFrame =
	| {
			type: 'message';
			body: unknown;
			discriminator?: string;
	  }
	| {
			type: 'error';
			error: string;
			message?: string;
	  };
