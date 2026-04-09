import { describe, expect, it } from 'vitest';

import { collectBlobs } from './blob.ts';

describe('collectBlobs', () => {
	const modernBlob = {
		$type: 'blob',
		ref: { $link: 'bafyreidfayvfuwqa7qlnopdjiqrxzs6blmoeu4rujcjtnci5beludirz2a' },
		mimeType: 'image/png',
		size: 1024,
	};

	const legacyBlob = {
		cid: 'bafkreidjmlrsggn2shrihfyp4iwlmxdp4dso7iqbkhfrpq6ahm22obop34',
		mimeType: 'image/jpeg',
	};

	it('finds modern blobs', () => {
		const record = { $type: 'com.example.post', text: 'hello', image: modernBlob };
		const blobs = collectBlobs(record);

		expect(blobs).toEqual([
			{
				cid: 'bafyreidfayvfuwqa7qlnopdjiqrxzs6blmoeu4rujcjtnci5beludirz2a',
				mimeType: 'image/png',
				size: 1024,
			},
		]);
	});

	it('excludes legacy blobs by default', () => {
		const record = { $type: 'com.example.post', image: legacyBlob };
		const blobs = collectBlobs(record);

		expect(blobs).toEqual([]);
	});

	it('includes legacy blobs with allowLegacy', () => {
		const record = { $type: 'com.example.post', image: legacyBlob };
		const blobs = collectBlobs(record, { allowLegacy: true });

		expect(blobs).toEqual([
			{
				cid: 'bafkreidjmlrsggn2shrihfyp4iwlmxdp4dso7iqbkhfrpq6ahm22obop34',
				mimeType: 'image/jpeg',
				size: -1,
			},
		]);
	});

	it('finds blobs nested in arrays', () => {
		const blob2 = { ...modernBlob };
		const record = { $type: 'com.example.post', images: [modernBlob, blob2] };
		const blobs = collectBlobs(record);

		expect(blobs).toHaveLength(2);
		expect(blobs[0].cid).toBe('bafyreidfayvfuwqa7qlnopdjiqrxzs6blmoeu4rujcjtnci5beludirz2a');
		expect(blobs[1].cid).toBe('bafyreidfayvfuwqa7qlnopdjiqrxzs6blmoeu4rujcjtnci5beludirz2a');
	});

	it('finds blobs in deeply nested objects', () => {
		const record = { a: { b: { c: { image: modernBlob } } } };
		const blobs = collectBlobs(record);

		expect(blobs).toHaveLength(1);
	});

	it('finds both modern and legacy blobs with allowLegacy', () => {
		const record = { modern: modernBlob, legacy: legacyBlob };
		const blobs = collectBlobs(record, { allowLegacy: true });

		expect(blobs).toHaveLength(2);
	});

	it('returns empty array for records with no blobs', () => {
		const record = { $type: 'com.example.post', text: 'hello' };
		expect(collectBlobs(record)).toEqual([]);
	});

	it('handles null and primitive values', () => {
		expect(collectBlobs(null)).toEqual([]);
		expect(collectBlobs(undefined)).toEqual([]);
		expect(collectBlobs('string')).toEqual([]);
		expect(collectBlobs(123)).toEqual([]);
	});

	it('handles cyclic structures without infinite loops', () => {
		const record: Record<string, unknown> = { image: modernBlob };
		record.self = record;

		const blobs = collectBlobs(record);
		expect(blobs).toHaveLength(1);
	});

	it('only walks own properties', () => {
		const proto = { inherited: modernBlob };
		const record = Object.create(proto);
		record.$type = 'com.example.post';

		const blobs = collectBlobs(record);
		expect(blobs).toEqual([]);
	});

	it('handles deep structures without stack overflow', () => {
		let deep: Record<string, unknown> = { image: modernBlob };
		for (let i = 0; i < 10000; i++) {
			deep = { nested: deep };
		}

		const blobs = collectBlobs(deep);
		expect(blobs).toHaveLength(1);
	});
});
