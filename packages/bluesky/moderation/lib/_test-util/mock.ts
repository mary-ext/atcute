import type { ComAtprotoLabelDefs } from '@atcute/atproto';
import type {
	AppBskyActorDefs,
	AppBskyEmbedRecord,
	AppBskyFeedDefs,
	AppBskyFeedPost,
	AppBskyGraphDefs,
	AppBskyNotificationListNotifications,
} from '@atcute/bluesky';
import type { $type, Did, GenericUri, Handle, ResourceUri } from '@atcute/lexicons';

const FAKE_CID = 'bafyreiclp443lavogvhj3d2ob2cxbfuscni2k5jk7bebjzg7khl3esabwq';

export const post = ({
	text,
	facets,
	reply,
	embed,
}: {
	text: string;
	facets?: AppBskyFeedPost.Main['facets'];
	reply?: AppBskyFeedPost.ReplyRef;
	embed?: AppBskyFeedPost.Main['embed'];
}): AppBskyFeedPost.Main => {
	return {
		$type: 'app.bsky.feed.post',
		text,
		facets,
		reply,
		embed,
		langs: ['en'],
		createdAt: new Date().toISOString(),
	};
};

export const postView = ({
	record,
	author,
	embed,
	replyCount,
	repostCount,
	likeCount,
	viewer,
	labels,
}: {
	record: AppBskyFeedPost.Main;
	author: AppBskyActorDefs.ProfileViewBasic;
	embed?: AppBskyFeedDefs.PostView['embed'];
	replyCount?: number;
	repostCount?: number;
	likeCount?: number;
	viewer?: AppBskyFeedDefs.ViewerState;
	labels?: ComAtprotoLabelDefs.Label[];
}): $type.enforce<AppBskyFeedDefs.PostView> => {
	return {
		$type: 'app.bsky.feed.defs#postView',
		uri: `at://${author.did}/app.bsky.feed.post/fake`,
		cid: FAKE_CID,
		author,
		record,
		embed,
		replyCount,
		repostCount,
		likeCount,
		indexedAt: new Date().toISOString(),
		viewer,
		labels,
	};
};

export const embedRecordView = ({
	record,
	author,
	labels,
}: {
	record: AppBskyFeedPost.Main;
	author: AppBskyActorDefs.ProfileViewBasic;
	labels?: ComAtprotoLabelDefs.Label[];
}): $type.enforce<AppBskyEmbedRecord.View> => {
	return {
		$type: 'app.bsky.embed.record#view',
		record: {
			$type: 'app.bsky.embed.record#viewRecord',
			uri: `at://${author.did}/app.bsky.feed.post/fake`,
			cid: FAKE_CID,
			author,
			value: record,
			labels,
			indexedAt: new Date().toISOString(),
		},
	};
};

export const embedRecordBlockedView = ({
	did,
	viewer,
}: {
	did: Did;
	viewer?: AppBskyActorDefs.ViewerState;
}): $type.enforce<AppBskyEmbedRecord.View> => {
	return {
		$type: 'app.bsky.embed.record#view',
		record: {
			$type: 'app.bsky.embed.record#viewBlocked',
			uri: `at://${did}/app.bsky.feed.post/fake`,
			blocked: true,
			author: {
				$type: 'app.bsky.feed.defs#blockedAuthor',
				did,
				viewer,
			},
		},
	};
};

export const profileView = ({
	handle,
	displayName,
	viewer,
	labels,
}: {
	handle: Handle;
	displayName?: string;
	viewer?: AppBskyActorDefs.ViewerState;
	labels?: ComAtprotoLabelDefs.Label[];
}): $type.omit<AppBskyActorDefs.ProfileView | AppBskyActorDefs.ProfileViewBasic> => {
	return {
		did: `did:web:${handle}`,
		handle,
		displayName,
		viewer,
		labels,
	};
};

export const actorViewerState = ({
	muted,
	mutedByList,
	blockedBy,
	blocking,
	blockingByList,
	following,
	followedBy,
}: {
	muted?: boolean;
	mutedByList?: AppBskyGraphDefs.ListViewBasic;
	blockedBy?: boolean;
	blocking?: ResourceUri;
	blockingByList?: AppBskyGraphDefs.ListViewBasic;
	following?: ResourceUri;
	followedBy?: ResourceUri;
}): AppBskyActorDefs.ViewerState => {
	return {
		muted,
		mutedByList,
		blockedBy,
		blocking,
		blockingByList,
		following,
		followedBy,
	};
};

export const listViewBasic = ({ name }: { name: string }): AppBskyGraphDefs.ListViewBasic => {
	return {
		uri: 'at://did:plc:fake/app.bsky.graph.list/fake',
		cid: FAKE_CID,
		name,
		purpose: 'app.bsky.graph.defs#modlist',
		indexedAt: new Date().toISOString(),
	};
};

export const replyNotification = ({
	author,
	record,
	labels,
}: {
	record: AppBskyFeedPost.Main;
	author: AppBskyActorDefs.ProfileView;
	labels?: ComAtprotoLabelDefs.Label[];
}): AppBskyNotificationListNotifications.Notification => {
	return {
		uri: `at://${author.did}/app.bsky.feed.post/fake`,
		cid: FAKE_CID,
		author,
		reason: 'reply',
		reasonSubject: `at://${author.did}/app.bsky.feed.post/fake-parent`,
		record,
		isRead: false,
		indexedAt: new Date().toISOString(),
		labels,
	};
};

export const followNotification = ({
	author,
	subjectDid,
	labels,
}: {
	author: AppBskyActorDefs.ProfileView;
	subjectDid: string;
	labels?: ComAtprotoLabelDefs.Label[];
}): AppBskyNotificationListNotifications.Notification => {
	return {
		uri: `at://${author.did}/app.bsky.graph.follow/fake`,
		cid: FAKE_CID,
		author,
		reason: 'follow',
		record: {
			$type: 'app.bsky.graph.follow',
			createdAt: new Date().toISOString(),
			subject: subjectDid,
		},
		isRead: false,
		indexedAt: new Date().toISOString(),
		labels,
	};
};

export const label = ({
	val,
	uri,
	src,
}: {
	val: string;
	uri: GenericUri;
	src?: Did;
}): ComAtprotoLabelDefs.Label => {
	return {
		src: src || 'did:plc:fake-labeler',
		uri,
		val,
		cts: new Date().toISOString(),
	};
};
