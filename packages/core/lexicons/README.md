# @atcute/bluesky-moderation

interprets Bluesky's content moderation labels.

```ts
import type { XRPC } from '@atcute/client';
import type {
	AppBskyActorDefs,
	AppBskyFeedDefs,
	AppBskyLabelerDefs,
	At,
} from '@atcute/client/lexicons';

import {
	DisplayContext,
	getDisplayRestrictions,
	interpretLabelerDefinitions,
	interpretMutedWordPreferences,
	LabelPreference,
	moderatePost,
	type ModerationPreferences,
} from '@atcute/bluesky-moderation';

declare const rpc: XRPC;

// first, let's get the user's preferences
const labelerDids = new Set<At.Did>([
	// Bluesky moderation service
	'did:plc:ar7c4by46qjdydhdevvrndac',
]);

const modPrefs: ModerationPreferences = {
	adultContentEnabled: false,
	globalLabelPrefs: {},
	prefsByLabelers: {
		'did:plc:ar7c4by46qjdydhdevvrndac': {
			labelPrefs: {},
		},
	},
	keywordFilters: [],
	hiddenPosts: [],
	temporaryMutes: [],
};

{
	const { data } = await rpc.get('app.bsky.actor.getPreferences', {});

	const labelPrefs: AppBskyActorDefs.ContentLabelPref[] = [];

	const globalLabelPrefs = (modPrefs.globalLabelPrefs ??= {});
	const prefsByLabelers = (modPrefs.prefsByLabelers ??= {});

	for (const pref of data.preferences) {
		switch (pref.$type) {
			case 'app.bsky.actor.defs#adultContentPref': {
				modPrefs.adultContentEnabled = pref.enabled;
				break;
			}
			case 'app.bsky.actor.defs#labelersPref': {
				for (const labeler of pref.labelers) {
					prefsByLabelers[labeler.did] ??= { labelPrefs: {} };
					labelerDids.add(labeler.did);
				}

				break;
			}
			case 'app.bsky.actor.defs#contentLabelPref': {
				labelPrefs.push(pref);
				break;
			}
			case 'app.bsky.actor.defs#mutedWordsPref': {
				modPrefs.keywordFilters = interpretMutedWordPreferences(pref);
				break;
			}
			case 'app.bsky.actor.defs#hiddenPostsPref': {
				modPrefs.hiddenPosts = pref.items as At.CanonicalResourceUri[];
				break;
			}
		}
	}

	for (const { labelerDid, label, visibility } of labelPrefs) {
		let pref: LabelPreference | undefined;
		switch (visibility) {
			case 'show':
			case 'ignore': {
				pref = LabelPreference.Ignore;
				break;
			}
			case 'warn': {
				pref = LabelPreference.Warn;
				break;
			}
			case 'hide': {
				pref = LabelPreference.Hide;
				break;
			}
		}

		if (labelerDid === undefined) {
			globalLabelPrefs[label] = pref;
		} else if (labelerDid in prefsByLabelers) {
			const labelerPref = prefsByLabelers[labelerDid]!;

			labelerPref.labelPrefs[label] = pref;
		}
	}
}

// grab labeler's definitions
let labelers: AppBskyLabelerDefs.LabelerViewDetailed[] = [];

{
	const { data } = await rpc.get('app.bsky.labeler.getServices', {
		params: {
			dids: [...labelerDids],
			detailed: true,
		},
	});

	labelers = data.views.filter(
		(view) => view.$type === 'app.bsky.labeler.defs#labelerViewDetailed',
	);
}

// interpret the labeler's definitions into something the library can understand
const labelDefs = interpretLabelerDefinitions(labelers);

// then we call the appropriate moderation functions
{
	declare const post: AppBskyFeedDefs.PostView;

	const mod = moderatePost(post, {
		viewerDid: 'did:plc:xyz',
		labelDefs,
		prefs: modPrefs,
	});

	// when displaying the post in feeds...
	{
		const ui = getDisplayRestrictions(mod, DisplayContext.ContentList);

		if (ui.filters.length > 0) {
			// don't include the post in the feed
		}

		if (ui.blurs.length > 0) {
			// hide the post behind a cover

			if (ui.noOverride) {
				// don't allow the cover to be removed
			}
		}

		if (ui.alerts.length > 0 || ui.informs.length > 0) {
			// show warning/inform badges in the post
		}
	}

	// when displaying an expanded version of the post...
	{
		const ui = getDisplayRestrictions(mod, DisplayContext.ContentView);

		// ...
	}

	// when displaying images/videos of a post...
	{
		const ui = getDisplayRestrictions(mod, DisplayContext.ProfileMedia);

		// ...
	}
}
```
