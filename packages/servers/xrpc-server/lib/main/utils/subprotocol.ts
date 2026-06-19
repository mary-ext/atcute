/** wire subprotocols the server can encode, used to match against a client's offer */
const SUPPORTED: ReadonlySet<string> = new Set(['xrpc.v0.cbor', 'xrpc.v1.cbor', 'xrpc.v1.json']);

export interface NegotiatedSubprotocol {
	/** subprotocol to echo in the handshake response, or undefined when the client offered nothing usable */
	echo: string | undefined;
	/** subprotocol the outgoing frames are encoded with */
	encode: string;
}

/**
 * negotiates the wire subprotocol from a client's `Sec-WebSocket-Protocol` offer, honoring the client's
 * preference order. a subprotocol is only echoed when it was actually offered, per RFC 6455; otherwise the
 * stream falls back to its declared default without echoing one.
 *
 * @param offered the raw `Sec-WebSocket-Protocol` request header, or null when absent
 * @param fallback the stream's default subprotocol when the client doesn't negotiate one
 * @returns the subprotocol to echo (if any) and the one to encode with
 */
export const negotiateSubprotocol = (offered: string | null, fallback: string): NegotiatedSubprotocol => {
	if (offered !== null) {
		for (const token of offered.split(',')) {
			const trimmed = token.trim();
			if (SUPPORTED.has(trimmed)) {
				return { echo: trimmed, encode: trimmed };
			}
		}
	}

	return { echo: undefined, encode: fallback };
};
