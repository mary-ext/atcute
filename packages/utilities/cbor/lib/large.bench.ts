import * as ipld from '@ipld/dag-cbor';
import * as cborx from 'cbor-x';
import { bench, do_not_optimize, run, summary } from 'mitata';

import OBJECT from '../../../definitions/ozone/lexicons/tools/ozone/moderation/defs.json' with { type: 'json' };

import * as atcute from './index.ts';

const BUFFER = atcute.encode(OBJECT);

const getBuffer = () => structuredClone(BUFFER);
const getObject = () => structuredClone({ ...OBJECT });

summary(() => {
	bench('cbor-x encode', function* () {
		yield {
			[0]() {
				return getObject();
			},
			bench(record: object) {
				const encode = new cborx.Encoder({ useRecords: false });
				return do_not_optimize(encode.encode(record));
			},
		};
	});

	bench('@ipld/dag-cbor encode', function* () {
		yield {
			[0]() {
				return getObject();
			},
			bench(record: object) {
				return do_not_optimize(ipld.encode(record));
			},
		};
	});

	bench('@atcute/cbor encode', function* () {
		yield {
			[0]() {
				return getObject();
			},
			bench(record: object) {
				return do_not_optimize(atcute.encode(record));
			},
		};
	});

	if (!process.argv.includes('--no-json-ref')) {
		bench('ref: JSON.stringify', function* () {
			yield {
				[0]() {
					return getObject();
				},
				bench(record: object) {
					return do_not_optimize(JSON.stringify(record));
				},
			};
		});
	}
});

summary(() => {
	bench('cbor-x decode', function* () {
		yield {
			[0]() {
				return getBuffer();
			},
			bench(buffer: Uint8Array) {
				const decode = new cborx.Decoder({ useRecords: false });
				return do_not_optimize(decode.decode(buffer));
			},
		};
	});

	bench('@ipld/dag-cbor decode', function* () {
		yield {
			[0]() {
				return getBuffer();
			},
			bench(buffer: Uint8Array) {
				return do_not_optimize(ipld.decode(buffer));
			},
		};
	});

	bench('@atcute/cbor decode', function* () {
		yield {
			[0]() {
				return getBuffer();
			},
			bench(buffer: Uint8Array) {
				return do_not_optimize(atcute.decode(buffer));
			},
		};
	});

	if (!process.argv.includes('--no-json-ref')) {
		bench('ref: JSON.parse', function* () {
			yield {
				[0]() {
					return JSON.stringify(getObject());
				},
				bench(json: string) {
					return do_not_optimize(JSON.parse(json));
				},
			};
		});
	}
});

await run();
