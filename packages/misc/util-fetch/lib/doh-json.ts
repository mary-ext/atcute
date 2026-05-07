import * as v from 'valibot';

import { pipe } from './pipeline.ts';
import { isResponseOk, parseResponseAsJson, validateJsonWith } from './transformers.ts';

const uint32 = v.pipe(
	v.number(),
	v.check((input) => Number.isInteger(input) && input >= 0 && input <= 2 ** 32 - 1),
);

const question = v.looseObject({
	name: v.string(),
	type: v.literal(16), // TXT
});

const answer = v.looseObject({
	name: v.string(),
	type: v.literal(16), // TXT
	TTL: uint32,
	data: v.pipe(
		v.string(),
		v.transform((input) => input.replace(/^"|"$/g, '').replace(/\\"/g, '"')),
	),
});

const authority = v.looseObject({
	name: v.string(),
	type: uint32,
	TTL: uint32,
	data: v.string(),
});

/** DoH JSON response schema for TXT record queries */
export const dohJsonTxtResult = v.looseObject({
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
	Answer: v.optional(v.array(answer), () => []),
	/** authority */
	Authority: v.optional(v.array(authority)),
	/** comment from the DNS server */
	Comment: v.optional(v.union([v.string(), v.array(v.string())])),
});

export type DohJsonTxtResult = v.InferOutput<typeof dohJsonTxtResult>;

/** fetch handler pipeline for DoH JSON TXT record responses */
export const fetchDohJsonTxt = pipe(
	isResponseOk,
	parseResponseAsJson(/^application\/(dns-)?json$/, 16 * 1024),
	validateJsonWith(dohJsonTxtResult),
);
