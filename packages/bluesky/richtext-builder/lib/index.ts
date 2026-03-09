import type { AppBskyRichtextFacet } from '@atcute/bluesky';
import type { Did, GenericUri } from '@atcute/lexicons';
import { getUtf8Length } from '@atcute/uint8array';

type UnwrapArray<T> = T extends (infer V)[] ? V : never;

/** Facet interface, `app.bsky.richtext.facet#main` from the lexicon */
export type Facet = AppBskyRichtextFacet.Main;
/** Feature union type from Facet['features'] */
export type FacetFeature = UnwrapArray<Facet['features']>;

/** Resulting rich text */
export interface BakedRichtext {
	text: string;
	facets: Facet[];
}

/** Builder for constructing Bluesky rich texts */
class RichtextBuilder {
	// Even-numbered are substrings, odd-numbered are facets
	// This way we'll avoid taking the hit on calculating UTF-8 indices up until
	// a facet is actually being inserted.
	#segments: (string | Facet)[] = [''];

	/** Resulting composed text */
	get text(): string {
		const segments = this.#segments;
		let str = '';

		for (let idx = 0, len = segments.length; idx < len; idx += 2) {
			str += segments[idx] as string;
		}

		return str;
	}

	/** Resulting composed facets */
	get facets(): Facet[] {
		const segments = this.#segments;
		const facets: Facet[] = [];

		for (let idx = 1, len = segments.length; idx < len; idx += 2) {
			facets.push(segments[idx] as Facet);
		}

		return facets;
	}

	/** Retrieve the composed rich text */
	build(): BakedRichtext {
		return {
			text: this.text,
			facets: this.facets,
		};
	}

	/** Clone rich text builder instance */
	clone(): RichtextBuilder {
		const instance = new RichtextBuilder();
		instance.#segments = this.#segments.slice(0);

		return instance;
	}

	/**
	 * Add plain text to the rich text
	 * @param text The plain text
	 * @returns The builder instance, for chaining
	 */
	addText(text: string): this {
		const segments = this.#segments;
		segments[segments.length - 1] += text;

		return this;
	}

	/**
	 * Add decorated text to the rich text
	 * @param text The text itself
	 * @param feature Feature to imbue on the text
	 * @returns The builder instance, for chaining
	 */
	addDecoratedText(text: string, feature: FacetFeature): this {
		const segments = this.#segments;
		const last = segments.length - 1;

		// Calculate the starting index
		let start = 0;

		start += getUtf8Length(segments[last] as string);
		if (last !== 0) {
			start += (segments[last - 1] as Facet).index.byteEnd;
		}

		const byteLength = getUtf8Length(text);

		const facet: Facet = {
			index: {
				byteStart: start,
				byteEnd: start + byteLength,
			},
			features: [feature],
		};

		segments[last] += text;
		segments.push(facet, '');
		return this;
	}

	/**
	 * Add link to the rich text
	 * @param text Text of the link
	 * @param uri Valid URL, for example: https://example.com
	 * @returns The builder instance, for chaining
	 */
	addLink(text: string, uri: GenericUri): this {
		return this.addDecoratedText(text, { $type: 'app.bsky.richtext.facet#link', uri: uri });
	}

	/**
	 * Mention a user in rich text
	 * @param text Text of the mention, usually in the form of `@handle`
	 * @param did Valid DID, for example: did:plc:ia76kvnndjutgedggx2ibrem
	 * @returns The builder instance, for chaining
	 */
	addMention(text: string, did: Did): this {
		return this.addDecoratedText(text, { $type: 'app.bsky.richtext.facet#mention', did: did });
	}

	/**
	 * Add inline hashtag to the rich text
	 * @param text Text to display
	 * @param tag The tag, without the pound prefix
	 * @returns The builder instance, for chaining
	 */
	addTag(text: string, tag: string): this {
		return this.addDecoratedText(text, { $type: 'app.bsky.richtext.facet#tag', tag: tag });
	}
}

export default RichtextBuilder;
