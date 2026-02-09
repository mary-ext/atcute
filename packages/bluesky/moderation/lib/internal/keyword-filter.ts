import type { AppBskyActorDefs } from '@atcute/bluesky';

import { KeywordFilterFlags, type KeywordFilter } from '../keyword-filter.ts';

const EMPTY_ARRAY: never[] = [];

export const matchesKeywordFilters = ({
	filters,
	text,
	tags = EMPTY_ARRAY,
	actor,
}: {
	filters: KeywordFilter[];
	text: string;
	tags?: string[];
	actor?: AppBskyActorDefs.ProfileView | AppBskyActorDefs.ProfileViewBasic;
}): KeywordFilter | null => {
	for (let i = 0, il = filters.length; i < il; i++) {
		const filter = filters[i];

		if (actor && filter.flags & KeywordFilterFlags.NoFollowing) {
			if (actor.viewer?.following) {
				continue;
			}
		}

		if (filter.flags & KeywordFilterFlags.ApplyTopic) {
			for (let j = 0, jl = tags.length; j < jl; j++) {
				const tag = tags[j];

				if (filter.pattern.test(tag)) {
					return filter;
				}
			}
		}

		if (filter.flags & KeywordFilterFlags.ApplyContent) {
			if (filter.pattern.test(text)) {
				return filter;
			}
		}
	}

	return null;
};
