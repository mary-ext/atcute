import type { Nsid } from '../../syntax/nsid.js';

import type { BaseMetadata } from '../base.js';
import type { ObjectSchema } from '../schemas/object.js';
import type { VariantSchema } from '../schemas/variant.js';
import type { XRPCParametersShape } from '../types/xrpc.js';
import { lazy } from '../utils.js';

export interface XRPCSubscriptionMetadata<
	TParams extends ObjectSchema<XRPCParametersShape> | null,
	TMessage extends ObjectSchema<any> | VariantSchema<any, any> | null,
	TNsid extends Nsid,
> extends BaseMetadata {
	readonly type: 'xrpc_subscription';
	readonly nsid: TNsid;
	readonly params: TParams;
	readonly message: TMessage;
}

// #__NO_SIDE_EFFECTS__
export const xrpcSubscription = <
	TNsid extends Nsid,
	TParams extends ObjectSchema<XRPCParametersShape> | null,
	TMessage extends ObjectSchema<any> | VariantSchema<any, any> | null,
>(
	nsid: TNsid,
	options: {
		params: TParams;
		readonly message: TMessage;
	},
): XRPCSubscriptionMetadata<TParams, TMessage, TNsid> => {
	// `message` can be a getter, and we'd have to resolve that getter.
	const message = lazy(() => {
		return options.message;
	});

	return {
		kind: 'metadata',
		type: 'xrpc_subscription',
		nsid: nsid,
		params: options.params,
		get message() {
			return message.value;
		},
	};
};
