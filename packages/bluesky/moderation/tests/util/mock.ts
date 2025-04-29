import type {
	AppBskyActorDefs,
	AppBskyEmbedRecord,
	AppBskyFeedDefs,
	AppBskyFeedPost,
	AppBskyGraphDefs,
	AppBskyNotificationListNotifications,
	At,
	Brand,
	ComAtprotoLabelDefs,
} from '@atcute/client/lexicons';

const FAKE_CID = 'bafyreiclp443lavogvhj3d2ob2cxbfuscni2k5jk7bebjzg7khl3esabwq';

export const post = ({
	text,
	facets,
	reply,
	embed,
}: {
	text: string;
	facets?: AppBskyFeedPost.Record['facets'];
	reply?: AppBskyFeedPost.ReplyRef;
	embed?: AppBskyFeedPost.Record['embed'];
}): AppBskyFeedPost.Record => {
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
	record: AppBskyFeedPost.Record;
	author: AppBskyActorDefs.ProfileViewBasic;
	embed?: AppBskyFeedDefs.PostView['embed'];
	replyCount?: number;
	repostCount?: number;
	likeCount?: number;
	viewer?: AppBskyFeedDefs.ViewerState;
	labels?: ComAtprotoLabelDefs.Label[];
}): Brand.Union<AppBskyFeedDefs.PostView> => {
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
	record: AppBskyFeedPost.Record;
	author: AppBskyActorDefs.ProfileViewBasic;
	labels?: ComAtprotoLabelDefs.Label[];
}): Brand.Union<AppBskyEmbedRecord.View> => {
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

export const profileView = ({
	handle,
	displayName,
	viewer,
	labels,
}: {
	handle: At.Handle;
	displayName?: string;
	viewer?: AppBskyActorDefs.ViewerState;
	labels?: ComAtprotoLabelDefs.Label[];
}): Brand.Omit<AppBskyActorDefs.ProfileView | AppBskyActorDefs.ProfileViewBasic> => {
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
	blocking?: At.ResourceUri;
	blockingByList?: AppBskyGraphDefs.ListViewBasic;
	following?: At.ResourceUri;
	followedBy?: At.ResourceUri;
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
	record: AppBskyFeedPost.Record;
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
	uri: At.GenericUri;
	src?: At.Did;
}): ComAtprotoLabelDefs.Label => {
	return {
		src: src || 'did:plc:fake-labeler',
		uri,
		val,
		cts: new Date().toISOString(),
	};
};
