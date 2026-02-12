import { assert } from '../utils.ts';

export const parseMstKey = (key: string): { collection: string; rkey: string } => {
	const slash = key.indexOf('/');
	assert(slash !== -1, `invalid mst key; key=${key}`);

	return { collection: key.slice(0, slash), rkey: key.slice(slash + 1) };
};
