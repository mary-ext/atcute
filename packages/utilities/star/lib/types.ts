/** basic STAR archive metadata */
export interface StarMeta {
	$type: string;
	[key: string]: unknown;
}

/**
 * checks the basic metadata shape
 *
 * @param value decoded CBOR value
 * @returns whether the value is a map with a `$type` string
 */
export const isStarMeta = (value: unknown): value is StarMeta => {
	if (value === null || typeof value !== 'object') {
		return false;
	}

	const { $type }: { $type?: unknown } = value;
	return typeof $type === 'string';
};

export interface StarHeader {
	/** byte offset of the magic bytes */
	headerStart: number;
	/** exclusive byte offset of the header end */
	headerEnd: number;

	/** decoded metadata */
	data: StarMeta;
	/** byte offset of the encoded metadata */
	dataStart: number;
	/** exclusive byte offset of the encoded metadata end */
	dataEnd: number;
}

export interface StarEntry {
	entryStart: number;
	entryEnd: number;

	key: Uint8Array;
	keyStart: number;
	keyEnd: number;

	value: Uint8Array;
	valueStart: number;
	valueEnd: number;
}

/** options for reading a STAR archive */
export interface StarReaderOptions {
	/**
	 * maximum key length in bytes
	 *
	 * @default 67108864 (64 MiB)
	 */
	maxKeyLength?: number;
	/**
	 * maximum value length in bytes
	 *
	 * @default 68719476736 (64 GiB)
	 */
	maxValueLength?: number;
}

/** key-value pair to write */
export interface StarPair {
	/** the key bytes */
	key: Uint8Array;
	/** the value bytes */
	value: Uint8Array;
}
