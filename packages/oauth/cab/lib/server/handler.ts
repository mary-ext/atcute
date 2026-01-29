import { createClientAssertion, DpopVerifyError, verifyDpopProof } from '@atcute/oauth-crypto';
import type { Keyset } from '@atcute/oauth-keyset';
import {
	createXrpcHandler,
	InvalidRequestError,
	json,
	type ProcedureConfig,
	type XRPCRouter,
} from '@atcute/xrpc-server';

import { DevAtcuteOauthGetClientAssertion } from '../lexicons/index.js';

import { DpopNonce, type DpopSecret } from './dpop-nonce.js';

/**
 * options for creating a CAB handler
 */
export interface CabOptions {
	/** OAuth client ID */
	client_id: string;
	/** client's private keyset */
	keyset: Keyset;
	/**
	 * DPoP nonce secret for replay protection.
	 * - `undefined`: generate random secret (single instance)
	 * - `string | Uint8Array`: shared secret (multi-instance)
	 * - `false`: disable nonce requirement
	 */
	dpopSecret?: DpopSecret | false;
	/** optional algorithms supported by the server (for key selection) */
	serverAlgs?: readonly string[];
}

const createCabProcedure = async (
	options: CabOptions,
): Promise<ProcedureConfig<DevAtcuteOauthGetClientAssertion.mainSchema>> => {
	const { client_id, keyset, dpopSecret, serverAlgs } = options;

	const dpopNonce = dpopSecret === false ? undefined : await DpopNonce.create(dpopSecret);

	return {
		async handler({ request, input: { aud } }) {
			const url = new URL(request.url);
			const htu = url.origin + url.pathname;

			// get fresh nonce for response headers
			const nextNonce = dpopNonce ? await dpopNonce.next() : undefined;
			const headers: HeadersInit | undefined = nextNonce ? { 'dpop-nonce': nextNonce } : undefined;

			// verify DPoP proof (includes nonce validation if configured)
			let jkt: string;
			try {
				const result = await verifyDpopProof(request.headers.get('dpop'), {
					method: 'POST',
					url: htu,
					nonce: dpopNonce,
				});
				jkt = result.jkt;
			} catch (err) {
				if (err instanceof DpopVerifyError) {
					const error = err.code === 'nonce_required' ? 'UseDpopNonce' : 'InvalidDpopProof';
					throw new InvalidRequestError({ error, headers });
				}
				throw err;
			}

			// create client assertion
			const { key } = keyset.findForSigning(serverAlgs);
			const assertion = await createClientAssertion({
				client_id,
				aud: aud,
				jkt,
				key,
			});

			return json({ client_assertion: assertion }, { headers });
		},
	};
};

/**
 * registers the CAB procedure to an existing XRPC router.
 *
 * @param router XRPC router to register to
 * @param options handler configuration
 */
export const registerCab = async (router: XRPCRouter, options: CabOptions): Promise<void> => {
	const config = await createCabProcedure(options);
	router.addProcedure(DevAtcuteOauthGetClientAssertion.mainSchema, config);
};

const CAB_PATH = `/xrpc/${DevAtcuteOauthGetClientAssertion.mainSchema.nsid}`;

/**
 * creates a standalone CAB handler.
 *
 * returns `undefined` for non-matching requests, allowing use as middleware.
 *
 * @param options handler configuration
 * @returns fetch handler that returns `Response` or `undefined` if path doesn't match
 */
export const createCabHandler = async (
	options: CabOptions,
): Promise<(request: Request) => Promise<Response> | undefined> => {
	const handler = createXrpcHandler({
		lxm: DevAtcuteOauthGetClientAssertion.mainSchema,
		...(await createCabProcedure(options)),
	});

	return (request: Request): Promise<Response> | undefined => {
		const url = new URL(request.url);
		if (url.pathname !== CAB_PATH) {
			return undefined;
		}

		return handler(request);
	};
};
