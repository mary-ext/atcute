import { fromBase16 as fromBase16Native, toBase16 as toBase16Native } from './base16-web-native.ts';
import { fromBase16 as fromBase16Polyfill, toBase16 as toBase16Polyfill } from './base16-web-polyfill.ts';

const HAS_NATIVE_SUPPORT = 'fromHex' in Uint8Array;

export const fromBase16 = !HAS_NATIVE_SUPPORT ? fromBase16Polyfill : fromBase16Native;
export const toBase16 = !HAS_NATIVE_SUPPORT ? toBase16Polyfill : toBase16Native;
