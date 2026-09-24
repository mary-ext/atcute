import * as CID from '@atcute/cid';

interface Slot<V> {
	/** raw CID bytes */
	c: Uint8Array;
	v: V;
}

/**
 * a map keyed by raw CID bytes, avoiding base32 encoding on non-colliding lookups
 *
 * @internal
 */
export class CidMap<V> {
	// use string-keyed maps for collisions to avoid linear scans on crafted digests
	#map = new Map<number, Slot<V> | Map<string, V>>();

	get(cid: Uint8Array): V | undefined {
		const slot = this.#map.get(keyOf(cid));
		if (slot === undefined) {
			return undefined;
		}

		if (slot instanceof Map) {
			return slot.get(cidString(cid));
		}

		return isSameCid(slot.c, cid) ? slot.v : undefined;
	}

	set(cid: Uint8Array, value: V): void {
		const key = keyOf(cid);
		const slot = this.#map.get(key);

		if (slot instanceof Map) {
			slot.set(cidString(cid), value);
		} else if (slot === undefined || isSameCid(slot.c, cid)) {
			this.#map.set(key, { c: cid, v: value });
		} else {
			const collided = new Map<string, V>();
			collided.set(cidString(slot.c), slot.v);
			collided.set(cidString(cid), value);

			this.#map.set(key, collided);
		}
	}

	delete(cid: Uint8Array): void {
		const key = keyOf(cid);
		const slot = this.#map.get(key);

		if (slot instanceof Map) {
			slot.delete(cidString(cid));
		} else if (slot !== undefined && isSameCid(slot.c, cid)) {
			this.#map.delete(key);
		}
	}

	/** iterates over the entries as CID strings and values */
	*entries(): Generator<[cid: string, value: V]> {
		for (const slot of this.#map.values()) {
			if (slot instanceof Map) {
				yield* slot;
			} else {
				yield [cidString(slot.c), slot.v];
			}
		}
	}
}

const keyOf = (cid: Uint8Array): number => {
	// 30 bits from the start of the digest, keeping the key a small integer
	return cid[4] | (cid[5] << 8) | (cid[6] << 16) | ((cid[7] & 0x3f) << 24);
};

const isSameCid = (a: Uint8Array, b: Uint8Array): boolean => {
	// every CID the readers accept is 36 bytes long
	for (let i = 0; i < 36; i++) {
		if (a[i] !== b[i]) {
			return false;
		}
	}

	return true;
};

const cidString = (cid: Uint8Array): string => {
	return CID.toString(CID.decode(cid));
};
