import { createBtcBaseDecode, createBtcBaseEncode } from '../utils.ts';

const BASE58BTC_CHARSET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export const fromBase58Btc: (source: string) => Uint8Array<ArrayBuffer> =
	/*#__PURE__*/ createBtcBaseDecode(BASE58BTC_CHARSET);

export const toBase58Btc: (source: Uint8Array) => string =
	/*#__PURE__*/ createBtcBaseEncode(BASE58BTC_CHARSET);
