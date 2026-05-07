import { defs } from '@atcute/identity';
import { isResponseOk, parseResponseAsJson, pipe, validateJsonWith } from '@atcute/util-fetch';

export const fetchDocHandler = pipe(
	isResponseOk,
	parseResponseAsJson(/^application\/(did\+ld\+)?json$/, 20 * 1024),
	validateJsonWith(defs.didDocument),
);
