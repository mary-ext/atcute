import {
	type AppBskyActorDefs,
	type AppBskyFeedDefs,
	type AppBskyFeedPost,
	type AppBskyGraphStarterpack,
	unwrapEmbed,
	unwrapRecordEmbed,
} from '@atcute/bluesky';
import type { CanonicalResourceUri } from '@atcute/lexicons';

import { LabelTarget } from '../behaviors.ts';
import {
	type ModerationDecision,
	considerBlockedBy,
	considerBlocking,
	considerHidden,
	considerKeywordMute,
	considerLabels,
	createModerationDecision,
	downgradeDecision,
	mergeModerationDecisions,
} from '../decision.ts';
import { matchesKeywordFilters } from '../internal/keyword-filter.ts';
import type { KeywordFilter } from '../keyword-filter.ts';
import type { ModerationOptions, PostSubject } from '../types.ts';

import { moderateProfile } from './profile.ts';

export const moderatePost = (subject: PostSubject, opts: ModerationOptions) => {
	return mergeModerationDecisions(
		decideSubject(subject, opts),
		moderateProfile(subject.author, opts),
		downgradeDecision(decideEmbed(subject.embed, opts)),
	);
};

const decideSubject = (subject: PostSubject, opts: ModerationOptions): ModerationDecision => {
	const author = subject.author;

	const decision = createModerationDecision(author.did, opts);
	considerLabels(decision, LabelTarget.Content, subject.labels, opts);

	if (checkHiddenPost(subject, opts.prefs.hiddenPosts)) {
		considerHidden(decision);
	}

	if (!decision.isMe && opts.prefs.keywordFilters?.length) {
		const match = checkKeywordFilters(subject, opts.prefs.keywordFilters);
		if (match !== null) {
			considerKeywordMute(decision, match);
		}
	}

	return decision;
};

const decideEmbed = (
	embed: AppBskyFeedDefs.PostView['embed'],
	opts: ModerationOptions,
): ModerationDecision | undefined => {
	const link = unwrapRecordEmbed(embed);

	if (link) {
		switch (link.$type) {
			case 'app.bsky.embed.record#viewRecord': {
				const author = link.author;

				const decision = createModerationDecision(author.did, opts);
				considerLabels(decision, LabelTarget.Content, link.labels, opts);

				return mergeModerationDecisions(decision, moderateProfile(author, opts));
			}
			case 'app.bsky.embed.record#viewBlocked': {
				const author = link.author;
				const viewer = author.viewer;

				const decision = createModerationDecision(author.did, opts);

				if (viewer?.blocking) {
					considerBlocking(decision, viewer.blockingByList ?? null);
				}

				if (viewer?.blockedBy) {
					considerBlockedBy(decision);
				}

				return decision;
			}
		}
	}
};

const checkHiddenPost = (subject: PostSubject, hiddenPosts: CanonicalResourceUri[] | undefined): boolean => {
	if (!hiddenPosts?.length) {
		return false;
	}

	if (hiddenPosts.includes(subject.uri as CanonicalResourceUri)) {
		return true;
	}

	const record = unwrapRecordEmbed(subject.embed);
	if (record) {
		switch (record.$type) {
			case 'app.bsky.embed.record#viewBlocked':
			case 'app.bsky.embed.record#viewDetached':
			case 'app.bsky.embed.record#viewNotFound':
			case 'app.bsky.embed.record#viewRecord': {
				return hiddenPosts.includes(record.uri as CanonicalResourceUri);
			}
		}
	}

	return false;
};

const checkKeywordFilters = (
	subject: PostSubject,
	filters: KeywordFilter[] | undefined,
): KeywordFilter | null => {
	if (!filters?.length) {
		return null;
	}

	let match: KeywordFilter | null | undefined;

	const author = subject.author;

	{
		const record = subject.record as AppBskyFeedPost.Main;

		const tags: string[] = [
			...(record.tags ?? []),
			...(record.facets ?? []).flatMap((facet) => {
				return facet.features
					.filter((feature) => feature.$type === 'app.bsky.richtext.facet#tag')
					.map((feature) => feature.tag);
			}),
		];

		if (
			(match = matchesKeywordFilters({
				filters: filters,
				text: record.text,
				tags: tags,
				actor: author,
			}))
		) {
			return match;
		}
	}

	{
		const embed = subject.embed;

		if ((match = checkEmbedKeywordFilters(filters, embed, author))) {
			return match;
		}
	}

	return null;
};

const checkEmbedKeywordFilters = (
	filters: KeywordFilter[],
	embed: AppBskyFeedDefs.PostView['embed'],
	author: AppBskyActorDefs.ProfileViewBasic,
): KeywordFilter | null => {
	let match: KeywordFilter | null | undefined;

	const { media, record: link } = unwrapEmbed(embed);

	if (media) {
		switch (media.$type) {
			case 'app.bsky.embed.external#view': {
				const external = media.external;

				if (
					(match = matchesKeywordFilters({
						filters: filters,
						text: `${external.title} ${external.description}`,
						actor: author,
					}))
				) {
					return match;
				}

				break;
			}
			case 'app.bsky.embed.images#view': {
				const images = media.images;

				for (let i = 0, il = images.length; i < il; i++) {
					const image = images[i];
					if (!image.alt) {
						continue;
					}

					if (
						(match = matchesKeywordFilters({
							filters: filters,
							text: image.alt,
							actor: author,
						}))
					) {
						return match;
					}
				}

				break;
			}
			case 'app.bsky.embed.video#view': {
				if (!media.alt) {
					break;
				}

				if (
					(match = matchesKeywordFilters({
						filters: filters,
						text: media.alt,
						actor: author,
					}))
				) {
					return match;
				}
			}
		}
	}

	if (link) {
		switch (link.$type) {
			case 'app.bsky.embed.record#viewRecord': {
				{
					const author = link.author;
					const record = link.value as AppBskyFeedPost.Main;

					const tags: string[] = [
						...(record.tags ?? []),
						...(record.facets ?? []).flatMap((facet) => {
							return facet.features
								.filter((feature) => feature.$type === 'app.bsky.richtext.facet#tag')
								.map((feature) => feature.tag);
						}),
					];

					if (
						(match = matchesKeywordFilters({
							filters: filters,
							text: record.text,
							tags: tags,
							actor: author,
						}))
					) {
						return match;
					}
				}

				{
					const embed = link.embeds?.[0];

					if ((match = checkEmbedKeywordFilters(filters, embed, author))) {
						return match;
					}
				}

				break;
			}
			case 'app.bsky.feed.defs#generatorView': {
				if (
					(match = matchesKeywordFilters({
						filters: filters,
						text: `${link.displayName} ${link.description ?? ''}`,
						actor: link.creator,
					}))
				) {
					return match;
				}

				break;
			}
			case 'app.bsky.graph.defs#listView': {
				if (
					(match = matchesKeywordFilters({
						filters: filters,
						text: `${link.name} ${link.description ?? ''}`,
						actor: link.creator,
					}))
				) {
					return match;
				}

				break;
			}
			case 'app.bsky.graph.defs#starterPackViewBasic': {
				const record = link.record as AppBskyGraphStarterpack.Main;

				if (
					(match = matchesKeywordFilters({
						filters: filters,
						text: `${record.name} ${record.description ?? ''}`,
						actor: link.creator,
					}))
				) {
					return match;
				}

				break;
			}
		}
	}

	return null;
};
