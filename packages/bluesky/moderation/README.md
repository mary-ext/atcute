# @atcute/bluesky-moderation

interpret Bluesky content moderation labels and user preferences.

```sh
npm install @atcute/bluesky-moderation
```

evaluates posts, profiles, lists, and other content against moderation labels, mutes, blocks, and
keyword filters to determine how they should be displayed.

## usage

### basic flow

1. fetch user preferences and labeler definitions
2. run moderation functions on content
3. get display restrictions for your UI context

```ts
import {
	DisplayContext,
	getDisplayRestrictions,
	interpretLabelerDefinitions,
	moderatePost,
	type ModerationPreferences,
} from '@atcute/bluesky-moderation';

// 1. set up preferences (see "loading preferences" below)
const prefs: ModerationPreferences = { ... };
const labelDefs = interpretLabelerDefinitions(labelers);

// 2. moderate content
const decision = moderatePost(post, {
	viewerDid: 'did:plc:...',
	prefs,
	labelDefs,
});

// 3. get display restrictions for your context
const ui = getDisplayRestrictions(decision, DisplayContext.ContentList);

if (ui.filters.length > 0) {
	// don't show this post in feeds
}

if (ui.blurs.length > 0) {
	// hide behind a content warning

	if (ui.noOverride) {
		// don't allow user to reveal
	}
}

if (ui.alerts.length > 0 || ui.informs.length > 0) {
	// show warning badges
}
```

### display contexts

use different contexts depending on where content appears:

```ts
// content in feeds/lists
getDisplayRestrictions(decision, DisplayContext.ContentList);

// content in expanded view
getDisplayRestrictions(decision, DisplayContext.ContentView);

// images/videos in content
getDisplayRestrictions(decision, DisplayContext.ContentMedia);

// profile in lists
getDisplayRestrictions(decision, DisplayContext.ProfileList);

// profile in expanded view
getDisplayRestrictions(decision, DisplayContext.ProfileView);

// profile avatar/banner
getDisplayRestrictions(decision, DisplayContext.ProfileMedia);

// profile display name/description
getDisplayRestrictions(decision, DisplayContext.ProfileBio);
```

### loading preferences

```ts
import {
	interpretLabelerDefinitions,
	interpretMutedWordPreferences,
	LabelPreference,
	type ModerationPreferences,
} from '@atcute/bluesky-moderation';

// fetch user preferences
const { data } = await rpc.get('app.bsky.actor.getPreferences', {});

const prefs: ModerationPreferences = {
	adultContentEnabled: false,
	globalLabelPrefs: {},
	prefsByLabelers: {},
	keywordFilters: [],
	hiddenPosts: [],
	temporaryMutes: [],
};

for (const pref of data.preferences) {
	switch (pref.$type) {
		case 'app.bsky.actor.defs#adultContentPref':
			prefs.adultContentEnabled = pref.enabled;
			break;

		case 'app.bsky.actor.defs#contentLabelPref':
			// map visibility to LabelPreference
			const labelPref =
				pref.visibility === 'hide'
					? LabelPreference.Hide
					: pref.visibility === 'warn'
						? LabelPreference.Warn
						: LabelPreference.Ignore;

			if (pref.labelerDid) {
				prefs.prefsByLabelers[pref.labelerDid] ??= { labelPrefs: {} };
				prefs.prefsByLabelers[pref.labelerDid].labelPrefs[pref.label] = labelPref;
			} else {
				prefs.globalLabelPrefs[pref.label] = labelPref;
			}
			break;

		case 'app.bsky.actor.defs#mutedWordsPref':
			prefs.keywordFilters = interpretMutedWordPreferences(pref);
			break;

		case 'app.bsky.actor.defs#hiddenPostsPref':
			prefs.hiddenPosts = pref.items;
			break;
	}
}

// fetch labeler definitions
const { data: labelerData } = await rpc.get('app.bsky.labeler.getServices', {
	params: { dids: [...labelerDids], detailed: true },
});

const labelDefs = interpretLabelerDefinitions(
	labelerData.views.filter((v) => v.$type === 'app.bsky.labeler.defs#labelerViewDetailed'),
);
```

### moderating different content types

```ts
import {
	moderateFeedGenerator,
	moderateList,
	moderateNotification,
	moderatePost,
	moderateProfile,
} from '@atcute/bluesky-moderation';

const postDecision = moderatePost(post, opts);
const profileDecision = moderateProfile(profile, opts);
const listDecision = moderateList(list, opts);
const feedDecision = moderateFeedGenerator(feed, opts);
const notifDecision = moderateNotification(notification, opts);
```
