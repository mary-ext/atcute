import type { ComAtprotoLabelDefs } from '@atcute/atproto';
import type { AppBskyEmbedExternal } from '@atcute/bluesky';
import type { Did } from '@atcute/lexicons';

import { describe, expect, it } from 'vitest';

import * as mock from './_test-util/mock.ts';
import {
	DisplayContext,
	LabelPreference,
	ModerationCauseType,
	type ModerationOptions,
	getDisplayRestrictions,
	moderateExternalView,
} from './index.ts';

const LABELER_DID: Did = 'did:web:labeler.test';
const OWNER_DID: Did = 'did:web:bob.test';

const opts: ModerationOptions = {
	viewerDid: 'did:web:alice.test',
	prefs: {
		adultContentEnabled: true,
		globalLabelPrefs: {
			porn: LabelPreference.Hide,
		},
		prefsByLabelers: {
			[LABELER_DID]: {
				labelPrefs: {},
			},
		},
		keywordFilters: [],
		temporaryMutes: [],
		hiddenPosts: [],
	},
	labelDefs: {},
};

const label = (val: string, src: Did): ComAtprotoLabelDefs.Label => {
	return mock.label({ val, uri: 'https://example.com/article', src });
};

const documentRef = (repo: string) => {
	return mock.strongRef({ uri: `at://${repo}/site.standard.document/article` });
};

const externalView = ({
	labels,
	associatedRefs,
	associatedProfiles,
}: {
	labels?: ComAtprotoLabelDefs.Label[];
	associatedRefs?: AppBskyEmbedExternal.ViewExternal['associatedRefs'];
	associatedProfiles?: AppBskyEmbedExternal.ViewExternal['associatedProfiles'];
} = {}): AppBskyEmbedExternal.ViewExternal => {
	const { external } = mock.externalEmbedView({
		uri: 'https://example.com/article',
		title: 'Example article',
		description: 'An example article',
		associatedRefs,
		labels,
	});

	return { ...external, associatedProfiles };
};

describe('moderateExternalView', () => {
	it('produces no causes when the view has no labels', () => {
		const res = moderateExternalView(externalView(), opts);

		expect(res.causes).toHaveLength(0);
	});

	it('blurs media for a media label from a subscribed labeler', () => {
		const res = moderateExternalView(externalView({ labels: [label('porn', LABELER_DID)] }), opts);

		expect(getDisplayRestrictions(res, DisplayContext.ContentMedia).blurs).toHaveLength(1);
		expect(getDisplayRestrictions(res, DisplayContext.ContentView).blurs).toHaveLength(0);
	});

	it('blurs content for a content label from a subscribed labeler', () => {
		const res = moderateExternalView(externalView({ labels: [label('!warn', LABELER_DID)] }), opts);

		expect(getDisplayRestrictions(res, DisplayContext.ContentView).blurs).toHaveLength(1);
		expect(getDisplayRestrictions(res, DisplayContext.ContentMedia).blurs).toHaveLength(0);
	});

	it('ignores labels from labelers the viewer is not subscribed to', () => {
		const res = moderateExternalView(externalView({ labels: [label('porn', 'did:web:unknown.test')] }), opts);

		expect(res.causes).toHaveLength(0);
	});

	it('applies self-labels from the owner of the first backing record', () => {
		const res = moderateExternalView(
			externalView({ labels: [label('porn', OWNER_DID)], associatedRefs: [documentRef(OWNER_DID)] }),
			opts,
		);

		expect(res.authorDid).toBe(OWNER_DID);
		expect(res.isMe).toBe(false);
		expect(getDisplayRestrictions(res, DisplayContext.ContentMedia).blurs).toHaveLength(1);
		expect(res.causes[0]).toMatchObject({ type: ModerationCauseType.Label, source: null });
	});

	it('recognizes when the viewer owns the first backing record', () => {
		const res = moderateExternalView(
			externalView({ labels: [label('porn', OWNER_DID)], associatedRefs: [documentRef(OWNER_DID)] }),
			{ ...opts, viewerDid: OWNER_DID },
		);

		expect(res.authorDid).toBe(OWNER_DID);
		expect(res.isMe).toBe(true);
		expect(getDisplayRestrictions(res, DisplayContext.ContentList).filters).toHaveLength(0);
	});

	it('uses the first backing record instead of associated profiles or later records', () => {
		const res = moderateExternalView(
			externalView({
				labels: [label('porn', OWNER_DID), label('porn', 'did:web:alice.test')],
				associatedRefs: [documentRef(OWNER_DID), documentRef('did:web:alice.test')],
				associatedProfiles: [{ did: 'did:web:alice.test', handle: 'alice.test' }],
			}),
			opts,
		);

		expect(res.authorDid).toBe(OWNER_DID);
		expect(res.isMe).toBe(false);
		expect(res.causes).toHaveLength(1);
		expect(res.causes[0]).toMatchObject({ label: { src: OWNER_DID }, source: null });
	});

	it.each([undefined, []])(
		'does not infer ownership from profiles when associatedRefs is %j',
		(associatedRefs) => {
			const res = moderateExternalView(
				externalView({
					labels: [label('porn', OWNER_DID)],
					associatedRefs,
					associatedProfiles: [{ did: OWNER_DID, handle: 'bob.test' }],
				}),
				opts,
			);

			expect(res.authorDid).toBe(undefined);
			expect(res.isMe).toBe(false);
			expect(res.causes).toHaveLength(0);
		},
	);

	it('does not treat a handle-based record URI as an owner DID', () => {
		const res = moderateExternalView(
			externalView({ labels: [label('porn', LABELER_DID)], associatedRefs: [documentRef('bob.test')] }),
			opts,
		);

		expect(res.authorDid).toBe(undefined);
		expect(res.isMe).toBe(false);
		expect(getDisplayRestrictions(res, DisplayContext.ContentMedia).blurs).toHaveLength(1);
	});

	it('does not treat an authorless view as the viewer’s own when signed out', () => {
		const res = moderateExternalView(externalView({ labels: [label('porn', LABELER_DID)] }), {
			...opts,
			viewerDid: undefined,
		});

		expect(res.isMe).toBe(false);
	});

	it('moderates livestream views', () => {
		const res = moderateExternalView(
			{
				$type: 'app.bsky.embed.external#viewLivestream',
				uri: 'https://example.com/live',
				title: 'Example livestream',
				description: 'An example livestream',
				active: true,
				associatedRefs: [documentRef(OWNER_DID)],
				labels: [label('porn', LABELER_DID)],
			},
			opts,
		);

		expect(res.authorDid).toBe(OWNER_DID);
		expect(getDisplayRestrictions(res, DisplayContext.ContentMedia).blurs).toHaveLength(1);
	});
});
