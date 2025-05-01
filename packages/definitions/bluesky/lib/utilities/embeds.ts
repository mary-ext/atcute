import type {
	AppBskyEmbedRecord,
	AppBskyEmbedRecordWithMedia,
	AppBskyFeedDefs,
	AppBskyFeedPost,
	Brand,
} from '@atcute/client/lexicons';

export interface RawEmbeds {
	media?: AppBskyEmbedRecordWithMedia.Main['media'];
	record?: AppBskyEmbedRecordWithMedia.Main['record'];
}

export type RawMediaEmbed = NonNullable<RawEmbeds['media']>;
export type RawRecordEmbed = NonNullable<RawEmbeds['record']>;

/**
 * extracts raw media embed from a post record embed
 * @param embed the embed interface to extract from
 * @returns the extracted raw media embed, if any
 */
export const unwrapRawMediaEmbed = (embed: AppBskyFeedPost.Record['embed']): RawEmbeds['media'] => {
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
export const unwrapRawRecordEmbed = (embed: AppBskyFeedPost.Record['embed']): RawEmbeds['record'] => {
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
export const unwrapRawEmbed = (embed: AppBskyFeedPost.Record['embed']): RawEmbeds => {
	return {
		media: unwrapRawMediaEmbed(embed),
		record: unwrapRawRecordEmbed(embed),
	};
};

export interface Embeds {
	media?: AppBskyEmbedRecordWithMedia.View['media'];
	record?: AppBskyEmbedRecordWithMedia.View['record']['record'];
}

export type MediaEmbed = NonNullable<Embeds['media']>;
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

export type QuoteEmbed = Brand.Union<
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
