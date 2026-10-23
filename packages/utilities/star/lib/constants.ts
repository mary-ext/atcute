/** magic bytes at the start of every STAR v1 archive: `*l\x01\x00` */
export const STAR_MAGIC: Uint8Array<ArrayBuffer> = /*#__PURE__*/ Uint8Array.of(0x2a, 0x6c, 0x01, 0x00);

/** @internal */
export const MAX_VARINT_BYTES = 6;

/** @internal */
export const MAX_META_LENGTH = 64 * 1024 * 1024;
/** @internal */
export const MAX_KEY_LENGTH = 64 * 1024 * 1024;
/** @internal */
export const MAX_VALUE_LENGTH = 64 * 1024 * 1024 * 1024;
