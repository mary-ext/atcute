import type { $type } from '@atcute/lexicons';

import type * as AppBskyEmbedRecord from '../lexicons/types/app/bsky/embed/record.js';
import type * as AppBskyEmbedRecordWithMedia from '../lexicons/types/app/bsky/embed/recordWithMedia.js';
import type * as AppBskyFeedDefs from '../lexicons/types/app/bsky/feed/defs.js';
import type * as AppBskyFeedPost from '../lexicons/types/app/bsky/feed/post.js';

/**
 * a union type of all possible raw embeds.
 */
export interface RawEmbeds {
	media?: AppBskyEmbedRecordWithMedia.Main['media'];
	record?: AppBskyEmbedRecordWithMedia.Main['record'];
}

/**
 * a raw media embed.
 */
export type RawMediaEmbed = NonNullable<RawEmbeds['media']>;
/**
 * a raw record embed.
 */
export type RawRecordEmbed = NonNullable<RawEmbeds['record']>;

/**
 * extracts raw media embed from a post record embed
 * @param embed the embed interface to extract from
 * @returns the extracted raw media embed, if any
 */
export const unwrapRawMediaEmbed = (embed: AppBskyFeedPost.Main['embed']): RawEmbeds['media'] => {
	switch (embed?.$type) {
		case 'app.bsky.embed.recordWithMedia':
			return embed.media;
		case 'app.bsky.embed.record':
			return;
	}

	return embed;
};

/**
 * extracts raw record embed from a post record embed
 * @param embed the embed interface to extract from
 * @returns the extracted raw record embed, if any
 */
export const unwrapRawRecordEmbed = (embed: AppBskyFeedPost.Main['embed']): RawEmbeds['record'] => {
	switch (embed?.$type) {
		case 'app.bsky.embed.recordWithMedia':
			return embed.record;

		case 'app.bsky.embed.record':
			return embed;
	}
};

/**
 * extracts raw media and record embeds from a post record embed
 * @param embed the embed interface to extract from
 * @returns the extracted raw media and record embeds, if any
 */
export const unwrapRawEmbed = (embed: AppBskyFeedPost.Main['embed']): RawEmbeds => {
	return {
		media: unwrapRawMediaEmbed(embed),
		record: unwrapRawRecordEmbed(embed),
	};
};

/**
 * a union type of all possible embeds.
 */
export interface Embeds {
	media?: AppBskyEmbedRecordWithMedia.View['media'];
	record?: AppBskyEmbedRecordWithMedia.View['record']['record'];
}

/**
 * a media embed.
 */
export type MediaEmbed = NonNullable<Embeds['media']>;
/**
 * a record embed.
 */
export type RecordEmbed = NonNullable<Embeds['record']>;

/**
 * extracts media embed from a post embed
 * @param embed the embed interface to extract from
 * @returns the extracted media embed, if any
 */
export const unwrapMediaEmbed = (embed: AppBskyFeedDefs.PostView['embed']): Embeds['media'] => {
	switch (embed?.$type) {
		case 'app.bsky.embed.recordWithMedia#view':
			return embed.media;
		case 'app.bsky.embed.record#view':
			return;
	}

	return embed;
};

/**
 * extracts record embed from a post embed
 * @param embed the embed interface to extract from
 * @returns the extracted record embed, if any
 */
export const unwrapRecordEmbed = (embed: AppBskyFeedDefs.PostView['embed']): Embeds['record'] => {
	switch (embed?.$type) {
		case 'app.bsky.embed.recordWithMedia#view':
			return embed.record.record;

		case 'app.bsky.embed.record#view':
			return embed.record;
	}
};

/**
 * extracts media and record embeds from a post embed
 * @param embed the embed interface to extract from
 * @returns the extracted media and record embeds, if any
 */
export const unwrapEmbed = (embed: AppBskyFeedDefs.PostView['embed']): Embeds => {
	return {
		media: unwrapMediaEmbed(embed),
		record: unwrapRecordEmbed(embed),
	};
};

/**
 * a quote embed.
 */
export type QuoteEmbed = $type.enforce<
	| AppBskyEmbedRecord.ViewBlocked
	| AppBskyEmbedRecord.ViewDetached
	| AppBskyEmbedRecord.ViewNotFound
	| AppBskyEmbedRecord.ViewRecord
>;

/**
 * get quote embed from a record embed
 * @param embed the record embed to extract from
 * @returns the extracted quote embed, if any
 */
export const unwrapQuoteEmbed = (embed: RecordEmbed | undefined): QuoteEmbed | undefined => {
	switch (embed?.$type) {
		case 'app.bsky.embed.record#viewRecord': {
			return embed;
		}

		case 'app.bsky.embed.record#viewBlocked':
		case 'app.bsky.embed.record#viewDetached':
		case 'app.bsky.embed.record#viewNotFound': {
			if (embed.uri.includes('/app.bsky.feed.post/')) {
				return embed;
			}
		}
	}
};
