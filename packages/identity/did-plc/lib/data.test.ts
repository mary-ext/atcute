import { describe, expect, it } from 'bun:test';

import { validateIndexedOperationLog } from './data.js';
import { indexedOperationLog } from './types.js';

describe('validateIndexedOperationLog()', () => {
	it('validates an operation log', async () => {
		const log = indexedOperationLog.parse([
			{
				did: 'did:plc:oky5czdrnfjpqslsw2a5iclo',
				operation: {
					sig: 'KuN3A61golVNSDU71wZKLP9lVuXk6YekJAz1lwDzrPsNTEWHBBW_8zSyV6pDxV4KiYXuAXlS1Ik47XkjQZ94mA',
					prev: null,
					type: 'create',
					handle: 'jay.bsky.social',
					service: 'https://bsky.social',
					signingKey: 'did:key:zQ3shP5TBe1sQfSttXty15FAEHV1DZgcxRZNxvEWnPfLFwLxJ',
					recoveryKey: 'did:key:zQ3shhCGUqDKjStzuDxPkTxN6ujddP4RkEKJJouJGRRkaLGbg',
				},
				cid: 'bafyreidswhiwi4ljkl4es4vwqhkas3spmmktortqbp6lkrb5v7qqdfr3mm',
				nullified: false,
				createdAt: '2022-11-17T06:31:40.296Z',
			},
			{
				did: 'did:plc:oky5czdrnfjpqslsw2a5iclo',
				operation: {
					sig: 'TY3ot8yFF-0LL8ceoRwSGaNQj0F1aj-IApYXRGT21G1fnznKHUHT1QE7c1aTrYd9PQLVvXUGag6CZ9EEeIKqgA',
					prev: 'bafyreidswhiwi4ljkl4es4vwqhkas3spmmktortqbp6lkrb5v7qqdfr3mm',
					type: 'plc_operation',
					services: { atproto_pds: { type: 'AtprotoPersonalDataServer', endpoint: 'https://bsky.social' } },
					alsoKnownAs: ['at://jay.bsky.social'],
					rotationKeys: [
						'did:key:zQ3shhCGUqDKjStzuDxPkTxN6ujddP4RkEKJJouJGRRkaLGbg',
						'did:key:zQ3shpKnbdPx3g3CmPf5cRVTPe1HtSwVn5ish3wSnDPQCbLJK',
					],
					verificationMethods: { atproto: 'did:key:zQ3shXjHeiBuRCKmM36cuYnm7YEMzhGnCmCyW92sRJ9pribSF' },
				},
				cid: 'bafyreicgb25yf5fro22oyhtkbgerzr4nume4sx757r525skxdzpeoeseha',
				nullified: false,
				createdAt: '2023-03-09T23:18:25.247Z',
			},
			{
				did: 'did:plc:oky5czdrnfjpqslsw2a5iclo',
				operation: {
					sig: 'WmQmobHA6abtu8xIkBSrDkkoMNjOxP1Tl_1zl1DbIZlA9kjOyxjX-J1rzwWVy3stdzMowpBeBnedkAug84n_RQ',
					prev: 'bafyreicgb25yf5fro22oyhtkbgerzr4nume4sx757r525skxdzpeoeseha',
					type: 'plc_operation',
					services: { atproto_pds: { type: 'AtprotoPersonalDataServer', endpoint: 'https://bsky.social' } },
					alsoKnownAs: ['at://jay.bsky.team'],
					rotationKeys: [
						'did:key:zQ3shhCGUqDKjStzuDxPkTxN6ujddP4RkEKJJouJGRRkaLGbg',
						'did:key:zQ3shpKnbdPx3g3CmPf5cRVTPe1HtSwVn5ish3wSnDPQCbLJK',
					],
					verificationMethods: { atproto: 'did:key:zQ3shXjHeiBuRCKmM36cuYnm7YEMzhGnCmCyW92sRJ9pribSF' },
				},
				cid: 'bafyreihmf7dapx27fexc7jwj4cdpbxcmhnnwo3x5vrpvbr6lclzj7gpsmi',
				nullified: false,
				createdAt: '2023-04-12T21:13:58.460Z',
			},
			{
				did: 'did:plc:oky5czdrnfjpqslsw2a5iclo',
				operation: {
					sig: 'dhstt4uPua8OVs8TVzHTqtCnNMsBDN7kjxIBmTIYBDRkknrtprBJ_AISXFoBZyqfoxq2altp-vlRAPEKSh5zeg',
					prev: 'bafyreihmf7dapx27fexc7jwj4cdpbxcmhnnwo3x5vrpvbr6lclzj7gpsmi',
					type: 'plc_operation',
					services: {
						atproto_pds: {
							type: 'AtprotoPersonalDataServer',
							endpoint: 'https://morel.us-east.host.bsky.network',
						},
					},
					alsoKnownAs: ['at://jay.bsky.team'],
					rotationKeys: [
						'did:key:zQ3shhCGUqDKjStzuDxPkTxN6ujddP4RkEKJJouJGRRkaLGbg',
						'did:key:zQ3shpKnbdPx3g3CmPf5cRVTPe1HtSwVn5ish3wSnDPQCbLJK',
					],
					verificationMethods: { atproto: 'did:key:zQ3shtJpFGgEG3tv3ERKvjo7VHbjDPVyvjYvW7gpie49rtNtc' },
				},
				cid: 'bafyreiglmkkn32i3vhca4ejyus7ydjymqzox6qmeb6csvmy2kp7etvsp4m',
				nullified: false,
				createdAt: '2023-11-07T01:39:19.488Z',
			},
		]);

		await validateIndexedOperationLog('did:plc:oky5czdrnfjpqslsw2a5iclo', log);
		expect().pass();
	});

	it('validates an operation log containing a nullified op', async () => {
		const log = indexedOperationLog.parse([
			{
				did: 'did:plc:pkmfz5soq2swsvbhvjekb36g',
				operation: {
					sig: '4DnqvrVFOZS4d_qoXSv_X87G0slZHbOxflyySVLEQLEZ4N1XtFYguoPd4gsVwDW52hNNrmQVa_mVUZGRc_s9PA',
					prev: null,
					type: 'plc_operation',
					services: {
						atproto_pds: {
							type: 'AtprotoPersonalDataServer',
							endpoint: 'https://bsky.social',
						},
					},
					alsoKnownAs: ['at://goeo.bsky.social'],
					rotationKeys: [
						'did:key:zDnaepbLeZpNrs4jp24Rio9CumZzws9avgn8MDxgt63d8hPeY',
						'did:key:zQ3shhCGUqDKjStzuDxPkTxN6ujddP4RkEKJJouJGRRkaLGbg',
						'did:key:zQ3shpKnbdPx3g3CmPf5cRVTPe1HtSwVn5ish3wSnDPQCbLJK',
					],
					verificationMethods: {
						atproto: 'did:key:zQ3shXjHeiBuRCKmM36cuYnm7YEMzhGnCmCyW92sRJ9pribSF',
					},
				},
				cid: 'bafyreid2tbopmtuguvuvij5kjcqo7rv7yvqza37uvfcvk5zdxyo57xlfdi',
				nullified: false,
				createdAt: '2023-10-10T18:37:35.152Z',
			},
			{
				did: 'did:plc:pkmfz5soq2swsvbhvjekb36g',
				operation: {
					sig: 'K0ZmWKmH0a1hMuVrvO9L-Tl5qBZBkl4IcgP5QgqLRS1FJ2tbstKRA7KIlqbmSRBi08Gb7zDkAymnAECJ2nuEFA',
					prev: 'bafyreid2tbopmtuguvuvij5kjcqo7rv7yvqza37uvfcvk5zdxyo57xlfdi',
					type: 'plc_operation',
					services: {
						atproto_pds: {
							type: 'AtprotoPersonalDataServer',
							endpoint: 'https://bsky.social',
						},
					},
					alsoKnownAs: ['at://genco.me'],
					rotationKeys: [
						'did:key:zDnaepbLeZpNrs4jp24Rio9CumZzws9avgn8MDxgt63d8hPeY',
						'did:key:zQ3shhCGUqDKjStzuDxPkTxN6ujddP4RkEKJJouJGRRkaLGbg',
						'did:key:zQ3shpKnbdPx3g3CmPf5cRVTPe1HtSwVn5ish3wSnDPQCbLJK',
					],
					verificationMethods: {
						atproto: 'did:key:zQ3shXjHeiBuRCKmM36cuYnm7YEMzhGnCmCyW92sRJ9pribSF',
					},
				},
				cid: 'bafyreiahul3cohr3je7wyfezlkzzlv66g37nq5nojcrmv6kxn6xgesh6bi',
				nullified: true,
				createdAt: '2023-10-10T18:46:41.368Z',
			},
			{
				did: 'did:plc:pkmfz5soq2swsvbhvjekb36g',
				operation: {
					sig: 'CyZxnGuw5eY_tQ6Zzc1vmLZDmfVnn3MkqMiPAGa1cdgdvZJkgTctPpCU9Alg1ICSYDaskcFdgPmctodC1SZ_Nw',
					prev: 'bafyreiahul3cohr3je7wyfezlkzzlv66g37nq5nojcrmv6kxn6xgesh6bi',
					type: 'plc_operation',
					services: {
						atproto_pds: {
							type: 'AtprotoPersonalDataServer',
							endpoint: 'https://bsky.social',
						},
					},
					alsoKnownAs: ['at://genco.me'],
					rotationKeys: ['did:key:zDnaepbLeZpNrs4jp24Rio9CumZzws9avgn8MDxgt63d8hPeY'],
					verificationMethods: {
						atproto: 'did:key:zQ3shXjHeiBuRCKmM36cuYnm7YEMzhGnCmCyW92sRJ9pribSF',
					},
				},
				cid: 'bafyreifgeojzcravnjlw3qw3nizra57iaoszgzqvit4gtjoijrab5aif3i',
				nullified: true,
				createdAt: '2023-10-10T19:40:19.420Z',
			},
			{
				did: 'did:plc:pkmfz5soq2swsvbhvjekb36g',
				operation: {
					sig: 'tjKH4HiMCdm9gMEDwDpwWD-NIK2aGHg8IXbiZMoPHhVhOXz8JAmNFZxEHSTJ66itdS1HYpFTUiYMO7XzxXzFCg',
					prev: 'bafyreifgeojzcravnjlw3qw3nizra57iaoszgzqvit4gtjoijrab5aif3i',
					type: 'plc_operation',
					services: {
						atproto_pds: {
							type: 'AtprotoPersonalDataServer',
							endpoint: 'https://bsky.social',
						},
					},
					alsoKnownAs: ['at://cyber.crime.rocks', 'at://crime.rocks', 'at://genco.me'],
					rotationKeys: ['did:key:zDnaepbLeZpNrs4jp24Rio9CumZzws9avgn8MDxgt63d8hPeY'],
					verificationMethods: {
						atproto: 'did:key:zQ3shXjHeiBuRCKmM36cuYnm7YEMzhGnCmCyW92sRJ9pribSF',
					},
				},
				cid: 'bafyreicp5wh4hc3m5qbgfxg5haau45dxdgxtz7mhi65gl5cundmuggi3fy',
				nullified: true,
				createdAt: '2023-10-10T20:26:25.467Z',
			},
			{
				did: 'did:plc:pkmfz5soq2swsvbhvjekb36g',
				operation: {
					sig: '2bBoiNZh9yPAmQq9w9SNaCNu77Lf0EAwsIEKXPkLc9tVAsTHBpngQFrxBgxixDQdrpwEnjSI_fyQrxVMDiFtfw',
					prev: 'bafyreicp5wh4hc3m5qbgfxg5haau45dxdgxtz7mhi65gl5cundmuggi3fy',
					type: 'plc_operation',
					services: {
						atproto_pds: {
							type: 'AtprotoPersonalDataServer',
							endpoint: 'https://bsky.social',
						},
					},
					alsoKnownAs: ['at://cyber.crime.rocks'],
					rotationKeys: ['did:key:zDnaepbLeZpNrs4jp24Rio9CumZzws9avgn8MDxgt63d8hPeY'],
					verificationMethods: {
						atproto: 'did:key:zQ3shXjHeiBuRCKmM36cuYnm7YEMzhGnCmCyW92sRJ9pribSF',
					},
				},
				cid: 'bafyreihsp7jfyteidzz2im4nxncmdyxdiqucakx45or2i63vhhslxddhrm',
				nullified: true,
				createdAt: '2023-10-10T20:34:23.366Z',
			},
			{
				did: 'did:plc:pkmfz5soq2swsvbhvjekb36g',
				operation: {
					sig: 'wdTABQB7wYnOxQ4UwigC-JAlm0kCtPHpXdMWGX3ff10ptsDCIZcImEfBnvEET4Iiw9Nc41IKQXTArzAlXEhkPw',
					prev: 'bafyreid2tbopmtuguvuvij5kjcqo7rv7yvqza37uvfcvk5zdxyo57xlfdi',
					type: 'plc_operation',
					services: {
						atproto_pds: {
							type: 'AtprotoPersonalDataServer',
							endpoint: 'https://bsky.social',
						},
					},
					alsoKnownAs: ['at://genco.me', 'at://crime.rocks', 'at://cyber.crime.rocks'],
					rotationKeys: [
						'did:key:zDnaepbLeZpNrs4jp24Rio9CumZzws9avgn8MDxgt63d8hPeY',
						'did:key:zQ3shhCGUqDKjStzuDxPkTxN6ujddP4RkEKJJouJGRRkaLGbg',
						'did:key:zQ3shpKnbdPx3g3CmPf5cRVTPe1HtSwVn5ish3wSnDPQCbLJK',
					],
					verificationMethods: {
						atproto: 'did:key:zQ3shXjHeiBuRCKmM36cuYnm7YEMzhGnCmCyW92sRJ9pribSF',
					},
				},
				cid: 'bafyreiafe2tt3xhvufat3peri6qjqkjrv55fuxbnwtrjbfce5zdnbsdisy',
				nullified: false,
				createdAt: '2023-10-10T20:39:50.484Z',
			},
		]);

		const result = await validateIndexedOperationLog('did:plc:pkmfz5soq2swsvbhvjekb36g', log);

		const cids = {
			canonical: result.canonical.map((op) => op.cid),
			nullified: result.nullified.map((op) => op.cid),
		};

		expect(cids).toMatchInlineSnapshot(`
{
  "canonical": [
    "bafyreid2tbopmtuguvuvij5kjcqo7rv7yvqza37uvfcvk5zdxyo57xlfdi",
    "bafyreiafe2tt3xhvufat3peri6qjqkjrv55fuxbnwtrjbfce5zdnbsdisy",
  ],
  "nullified": [
    "bafyreiahul3cohr3je7wyfezlkzzlv66g37nq5nojcrmv6kxn6xgesh6bi",
    "bafyreifgeojzcravnjlw3qw3nizra57iaoszgzqvit4gtjoijrab5aif3i",
    "bafyreicp5wh4hc3m5qbgfxg5haau45dxdgxtz7mhi65gl5cundmuggi3fy",
    "bafyreihsp7jfyteidzz2im4nxncmdyxdiqucakx45or2i63vhhslxddhrm",
  ],
}
`);
	});
});
