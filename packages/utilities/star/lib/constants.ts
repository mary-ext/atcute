/** magic bytes at the start of every STAR archive: `*l\x01\x00` */
export const STAR_MAGIC: Uint8Array<ArrayBuffer> = /*#__PURE__*/ Uint8Array.of(0x2a, 0x6c, 0x01, 0x00);

/** @internal */
export const PAIR_MARKER = 0x01;
/** @internal */
export const END_MARKER = 0x00;

/** @internal */
export const MAX_VARINT_BYTES = 9;

/** @internal */
export const DEFAULT_MAX_META_LENGTH = 5 * 1024 * 1024;
/** @internal */
export const DEFAULT_MAX_KEY_LENGTH = 8 * 1024;
/** @internal */
export const DEFAULT_MAX_VALUE_LENGTH = 5 * 1024 * 1024;
