import type { XRPC } from '@atcute/client';
import type { AppBskyEmbedRecord, AppBskyFeedDefs, AppBskyRichtextFacet, At } from '@atcute/client/lexicons';

/** An embed that links to an external page */
export interface PostExternalEmbed {
	type: 'external';
	/** Link to the page */
	uri: string;
	/** Page title */
	title: string;
	/** Page description */
	description?: string;
	/**
	 * Page thumbnail, accepts either a Web Blob instance or a blob returned from
	 * the `com.atproto.repo.uploadBlob` procedure. Supplying the former requires
	 * you to also supply an authenticated RPC instance for it to be able to make
	 * procedure calls.
	 */
	thumbnail?: Blob | At.Blob;
	/** Labels to describe this external embed */
	labels?: string[];
}

/** An image within the image embed */
export interface ComposedImage {
	/**
	 * The image data, accepts either a Web Blob instance or a blob returned from
	 * the `com.atproto.repo.uploadBlob` procedure. Supplying the former requires
	 * you to also supply an authenticated RPC instance for it to be able to make
	 * procedure calls.
	 */
	blob: Blob | At.Blob;
	/**
	 * Alternative text for this image, helps describe images for low-vision users
	 * and provide context for everyone.
	 */
	alt?: string;
	/**
	 * Aspect ratio of the image, supplying this is recommended as clients makes
	 * use of it to properly display images.
	 */
	aspectRatio?: {
		/** Height of the image */
		height: number;
		/** Width of the image */
		width: number;
	};
}

/** An embed that displays images */
export interface PostImageEmbed {
	type: 'image';
	/** An array of images */
	images: ComposedImage[];
	/** Labels to describe this image embed */
	labels?: string[];
}

/** Union type of media embeds */
export type PostMediaEmbed = PostExternalEmbed | PostImageEmbed;

/** An embed that displays a feed card */
export interface PostFeedEmbed {
	type: 'feed';
	/** AT-URI of the feed */
	uri: At.Uri;
	/**
	 * CID of the feed, if not supplied, requires you to also supply an RPC
	 * instance for it to be able to make query calls.
	 */
	cid?: string;
}

/** An embed that displays a user/moderation list card */
export interface PostListEmbed {
	type: 'list';
	/** AT-URI of the list */
	uri: string;
	/**
	 * CID of the list, if not supplied, requires you to also supply an RPC
	 * instance for it to be able to make query calls.
	 */
	cid?: string;
}

/** An embed that displays a post card (quote post/repost with quote) */
export interface PostQuoteEmbed {
	type: 'quote';
	/** AT-URI of the post */
	uri: string;
	/**
	 * CID of the post, if not supplied, requires you to also supply an RPC
	 * instance for it to be able to make query calls.
	 */
	cid?: string;
}

/** An embed that displays a starter pack card */
export interface PostStarterpackEmbed {
	type: 'starterpack';
	/** AT-URI of the post */
	uri: string;
	/**
	 * CID of the starter pack, if not supplied, requires you to also supply an
	 * RPC instance for it to be able to make query calls.
	 */
	cid?: string;
}

/** Union type of "record" embeds */
export type PostRecordEmbed = PostFeedEmbed | PostListEmbed | PostQuoteEmbed | PostStarterpackEmbed;

/** Embed in a post, can contain media and links to other records */
export interface PostEmbed {
	media?: PostMediaEmbed;
	record?: PostRecordEmbed;
}

/** The post being composed */
export interface ComposedPost {
	/** The language that this post is in */
	languages?: string[];
	/** The content of the post */
	content: {
		/** Post text */
		text: string;
		/** Decorations applied to the text */
		facets?: AppBskyRichtextFacet.Main[];
	};
	/** Embed assigned to this post */
	embed?: PostEmbed;
}

/** Reply gating options, leave this empty to deny everyone from replying */
export interface ComposedThreadgate {
	/** Allow replies from users you follow */
	follows?: boolean;
	/** Allow replies from users mentioned in the post */
	mentions?: boolean;
	/** Allow replies from users that are in these user lists */
	listUris?: At.Uri[];
}

/** Base interface for the thread being composed */
export interface ComposedThread {
	/** An RPC instance, necessary for some options that takes action on your behalf */
	rpc?: XRPC;
	/** Abort signal */
	signal?: AbortSignal;
	/** Author of the thread */
	author: At.DID;
	/**
	 * The "creation time" for this thread,
	 * if not supplied, the current time is used
	 */
	createdAt?: string | number | Date;
	/**
	 * The post it should reply to, accepts either an AT-URI of the post, a view
	 * of the post, or an embed view of the post. Supplying an AT-URI requires you
	 * to also supply an PRC instance for it to be able to make query calls.
	 */
	reply?: string | AppBskyFeedDefs.PostView | AppBskyEmbedRecord.ViewRecord;
	/**
	 * Thread gating to apply on this thread, this option can't be set if this is
	 * a reply, especially to another user's thread. Leave this undefined to allow
	 * everyone to reply to the thread, supply an empty object to deny everyone.
	 */
	gate?: ComposedThreadgate;
	/** The language that all the posts are in, can be overridden per-post */
	languages?: string[];
	/** An array of posts */
	posts: ComposedPost[];
}
