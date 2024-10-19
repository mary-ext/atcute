# atcute

a collection of lightweight TypeScript packages for AT Protocol, the protocol powering Bluesky,
featuring:

- an [API client][client] for making typed HTTP requests, with support for lexicons like
  [WhiteWind][whitewind] or [Bluemoji][bluemoji]
- an [OAuth client for SPA applications][oauth-browser-client] for authentication use-cases
- utility packages for various data formats, including CIDv1, DAG-CBOR, CAR and TID record keys
- Bluesky-specific utility packages like [a rich text builder][bluesky-richtext-builder] and [a post
  threader][bluesky-threading]

you might be interested in the [API client][client]

[bluemoji]: ./packages/definitions/bluemoji
[bluesky-richtext-builder]: ./packages/bluesky/richtext-builder
[bluesky-threading]: ./packages/bluesky/threading
[client]: ./packages/core/client
[oauth-browser-client]: ./packages/oauth/browser-client
[whitewind]: ./packages/definitions/whitewind

---

| Packages                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------- |
| **Core packages**                                                                                                      |
| [`client`](./packages/core/client): API client library                                                                 |
| [`lex-cli`](./packages/core/lex-cli): CLI tool to generate type definitions for the API client                         |
| **OAuth packages**                                                                                                     |
| [`oauth-browser-client`](./packages/oauth/browser-client): minimal OAuth browser client implementation                 |
| **Lexicon definitions**                                                                                                |
| [`bluemoji`](./packages/definitions/bluemoji): adds `blue.moji.*` lexicons                                             |
| [`bluesky`](./packages/definitions/bluesky): adds `app.bsky.*` and `chat.bsky.*` lexicons                              |
| [`ozone`](./packages/definitions/ozone): adds `tools.ozone.*` lexicons                                                 |
| [`whitewind`](./packages/definitions/whitewind): adds `com.whtwnd.*` lexicons                                          |
| **Utility packages**                                                                                                   |
| [`tid`](./packages/utilities/tid): TID record key identifiers                                                          |
| [`car`](./packages/utilities/car): CAR/repository decoder                                                              |
| [`cid`](./packages/utilities/cid): CIDv1 codec                                                                         |
| [`cbor`](./packages/utilities/cbor): DAG-CBOR codec                                                                    |
| [`varint`](./packages/utilities/varint): Protobuf-style varint codec                                                   |
| [`base32`](./packages/utilities/base32): base32 codec                                                                  |
| **Bluesky-specific packages**                                                                                          |
| [`bluesky-richtext-builder`](./packages/bluesky/richtext-builder): builder pattern for Bluesky's rich text facets      |
| [`bluesky-richtext-parser`](./packages/bluesky/richtext-parser): parse Bluesky's (extended) rich text syntax           |
| [`bluesky-richtext-segmenter`](./packages/bluesky/richtext-segmenter): segments Bluesky's rich text facets into tokens |
| [`bluesky-threading`](./packages/bluesky/threading): create Bluesky threads containing multiple posts with one write   |
