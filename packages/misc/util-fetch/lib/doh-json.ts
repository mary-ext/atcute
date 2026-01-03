import * as v from '@badrap/valita';

import { pipe } from './pipeline.js';
import { isResponseOk, parseResponseAsJson, validateJsonWith } from './transformers.js';

const uint32 = v.number().assert((input) => Number.isInteger(input) && input >= 0 && input <= 2 ** 32 - 1);

const question = v.object({
	name: v.string(),
	type: v.literal(16), // TXT
});

const answer = v.object({
	name: v.string(),
	type: v.literal(16), // TXT
	TTL: uint32,
	data: v.string().chain((input) => {
		return v.ok(input.replace(/^"|"$/g, '').replace(/\\"/g, '"'));
	}),
});

const authority = v.object({
	name: v.string(),
	type: uint32,
	TTL: uint32,
	data: v.string(),
});

/** DoH JSON response schema for TXT record queries */
export const dohJsonTxtResult = v.object({
	/** DNS response code */
	Status: uint32,
	/** whether response is truncated */
	TC: v.boolean(),
	/** whether recursive desired bit is set, always true for Google and Cloudflare DoH */
	RD: v.boolean(),
	/** whether recursive available bit is set, always true for Google and Cloudflare DoH */
	RA: v.boolean(),
	/** whether response data was validated with DNSSEC */
	AD: v.boolean(),
	/** whether client asked to disable DNSSEC validation */
	CD: v.boolean(),
	/** requested records */
	Question: v.tuple([question]),
	/** answers */
	Answer: v.array(answer).optional(() => []),
	/** authority */
	Authority: v.array(authority).optional(),
	/** comment from the DNS server */
	Comment: v.union(v.string(), v.array(v.string())).optional(),
});

export type DohJsonTxtResult = v.Infer<typeof dohJsonTxtResult>;

/** fetch handler pipeline for DoH JSON TXT record responses */
export const fetchDohJsonTxt = pipe(
	isResponseOk,
	parseResponseAsJson(/^application\/(dns-)?json$/, 16 * 1024),
	validateJsonWith(dohJsonTxtResult, { mode: 'passthrough' }),
);
