import type { CidLink } from '@atcute/cid';

import { MissingBlockError } from './errors.js';
import type { NodeStore } from './node-store.js';
import { NodeWalker } from './node-walker.js';

/**
 * Error thrown when validating a proof fails
 */
export class InvalidProofError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'InvalidProofError';
	}
}

/**
 * Error thrown when constructing a proof fails
 */
export class ProofError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ProofError';
	}
}

/**
 * Finds a record path and builds a proof (works for both inclusion and exclusion proofs)
 * @param ns the node store
 * @param rootCid the MST root CID
 * @param rpath the record path to find
 * @returns tuple of [value CID or null, set of proof node CIDs]
 */
export const findRpathAndBuildProof = async (
	ns: NodeStore,
	rootCid: string,
	rpath: string,
): Promise<[CidLink | null, Set<string>]> => {
	const walker = await NodeWalker.create(ns, rootCid);
	const value = await walker.findRpath(rpath);

	const proof = new Set<string>();
	for (const frame of walker.stack) {
		proof.add((await frame.node.cid()).$link);
	}

	return [value, proof];
};

/**
 * Builds an exclusion proof for a record that should not exist
 * @param ns the node store
 * @param rootCid the MST root CID
 * @param rpath the record path
 * @returns set of MST node CIDs needed for the exclusion proof
 * @throws {ProofError} if the record exists
 */
export const buildExclusionProof = async (
	ns: NodeStore,
	rootCid: string,
	rpath: string,
): Promise<Set<string>> => {
	const [value, proof] = await findRpathAndBuildProof(ns, rootCid, rpath);
	if (value !== null) {
		throw new ProofError("can't build exclusion proof for a record that exists!");
	}
	return proof;
};

/**
 * Builds an inclusion proof for a record that should exist
 * @param ns the node store
 * @param rootCid the MST root CID
 * @param rpath the record path
 * @returns set of MST node CIDs needed for the inclusion proof
 * @throws {ProofError} if the record doesn't exist
 */
export const buildInclusionProof = async (
	ns: NodeStore,
	rootCid: string,
	rpath: string,
): Promise<Set<string>> => {
	const [value, proof] = await findRpathAndBuildProof(ns, rootCid, rpath);
	if (value === null) {
		throw new ProofError("can't build inclusion proof for a record that doesn't exist!");
	}
	return proof;
};

/**
 * Verifies an inclusion proof - that a record exists in the MST
 * @param ns the node store (should only contain blocks from the proof)
 * @param rootCid the MST root CID
 * @param rpath the record path
 * @throws {InvalidProofError} if the proof is invalid or the record doesn't exist
 */
export const verifyInclusion = async (ns: NodeStore, rootCid: string, rpath: string): Promise<void> => {
	try {
		const walker = await NodeWalker.create(ns, rootCid);
		const value = await walker.findRpath(rpath);
		if (value === null) {
			throw new InvalidProofError('rpath not present in MST');
		}
	} catch (err) {
		if (err instanceof MissingBlockError) {
			throw new InvalidProofError('missing MST blocks');
		}
		throw err;
	}
};

/**
 * Verifies an exclusion proof - that a record does not exist in the MST
 * @param ns the node store (should only contain blocks from the proof)
 * @param rootCid the MST root CID
 * @param rpath the record path
 * @throws {InvalidProofError} if the proof is invalid or the record exists
 */
export const verifyExclusion = async (ns: NodeStore, rootCid: string, rpath: string): Promise<void> => {
	try {
		const walker = await NodeWalker.create(ns, rootCid);
		const value = await walker.findRpath(rpath);
		if (value !== null) {
			throw new InvalidProofError('rpath *is* present in MST');
		}
	} catch (err) {
		if (err instanceof MissingBlockError) {
			throw new InvalidProofError('missing MST blocks');
		}
		throw err;
	}
};
