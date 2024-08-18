import '@atcute/bluesky/lexicons';
import type { AppBskyRichtextFacet, At } from '@atcute/client/lexicons';

type UnwrapArray<T> = T extends (infer V)[] ? V : never;

/** Facet interface, `app.bsky.richtext.facet#main` from the lexicon */
export type Facet = AppBskyRichtextFacet.Main;
/** Feature union type from Facet['features'] */
export type FacetFeature = UnwrapArray<Facet['features']>;

const encoder = new TextEncoder();

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
	 * @param substr The plain text
	 * @returns The builder instance, for chaining
	 */
	addText(substr: string): this {
		const segments = this.#segments;
		segments[segments.length - 1] += substr;

		return this;
	}

	/**
	 * Add decorated text to the rich text
	 * @param substr The text itself
	 * @param feature Feature to imbue on the text
	 * @returns The builder instance, for chaining
	 */
	addDecoratedText(substr: string, feature: FacetFeature): this {
		const segments = this.#segments;
		const last = segments.length - 1;

		// Calculate the starting index
		let start = 0;

		start += encoder.encode(segments[last] as string).byteLength;
		if (last !== 0) {
			start += (segments[last - 1] as Facet).index.byteEnd;
		}

		const facet: Facet = {
			index: {
				byteStart: start,
				byteEnd: start + encoder.encode(substr).byteLength,
			},
			features: [feature],
		};

		segments[last] += substr;
		segments.push(facet, '');
		return this;
	}

	/**
	 * Add link to the rich text
	 * @param substr Text of the link
	 * @param uri Valid URL, for example: https://example.com
	 * @returns The builder instance, for chaining
	 */
	addLink(substr: string, uri: string): this {
		return this.addDecoratedText(substr, { $type: 'app.bsky.richtext.facet#link', uri: uri });
	}

	/**
	 * Mentions a user in rich text
	 * @param substr Text of the mention, this is usually in the form of `@handle`
	 * @param did Valid DID, for example: did:plc:ia76kvnndjutgedggx2ibrem
	 * @returns The builder instance, for chaining
	 */
	addMention(substr: string, did: At.DID): this {
		return this.addDecoratedText(substr, { $type: 'app.bsky.richtext.facet#mention', did: did });
	}

	/**
	 * Add inline hashtag to the rich text
	 * @param tag The tag, without the pound prefix
	 * @returns THe builder instance, for chaining
	 */
	addTag(tag: string): this {
		return this.addDecoratedText('#' + tag, { $type: 'app.bsky.richtext.facet#tag', tag: tag });
	}
}

export default RichtextBuilder;
