/**
 * @module
 * Contains a middleware that adds `atproto-accept-labelers` header to requests.
 */

import type { XRPC } from '../index.js';
import type { At } from '../lexicons.js';

/** Options for constructing a moderation middleware */
export interface AtpModOptions {
	/** Array of moderation services to use */
	labelers?: ModerationService[];
}

/** Moderation middleware, unstable. */
export class AtpMod {
	/** Array of moderation services that gets forwarded as a header */
	labelers: ModerationService[];

	constructor(rpc: XRPC, { labelers = [] }: AtpModOptions = {}) {
		this.labelers = labelers;

		rpc.hook((next) => (request) => {
			return next({
				...request,
				headers: {
					...request.headers,
					'atproto-accept-labelers': this.labelers
						.map((labeler) => labeler.did + (labeler.redact ? `;redact` : ``))
						.join(', '),
				},
			});
		});
	}
}

/** Interface detailing what moderator service to use and how it should be used. */
export interface ModerationService {
	/** Moderator service to use */
	did: At.DID;
	/** Whether it should apply takedowns made by this service. */
	redact?: boolean;
}
