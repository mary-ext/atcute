# atcute

a collection of lightweight TypeScript packages for AT Protocol, the protocol powering Bluesky,
featuring:

- an [API client][client-readme] for making typed HTTP requests, with support for lexicons like
  [WhiteWind][whitewind-readme] or [Bluemoji][bluemoji-readme]
- an [OAuth client for SPA applications][oauth-browser-client-readme] for authentication use-cases
- utility packages for various data formats, including CIDv1, DAG-CBOR, CAR and TID record keys
- Bluesky-specific utility packages like [a rich text builder][bluesky-richtext-builder-readme] and
  [a post threader][bluesky-threading-readme]

you might be interested in the [API client][client-readme]

[bluemoji-readme]: ./packages/definitions/bluemoji/README.md
[bluesky-richtext-builder-readme]: ./packages/bluesky/richtext-builder/README.md
[bluesky-threading-readme]: ./packages/bluesky/threading/README.md
[client-readme]: ./packages/core/client/README.md
[oauth-browser-client-readme]: ./packages/oauth/browser-client/README.md
[whitewind-readme]: ./packages/definitions/whitewind/README.md

---

| Packages                                                                                                                         |
| -------------------------------------------------------------------------------------------------------------------------------- |
| **Core packages**                                                                                                                |
| [`client`](./packages/core/client/README.md): API client library                                                                 |
| [`lex-cli`](./packages/core/lex-cli/README.md): CLI tool to generate type definitions for the API client                         |
| **OAuth packages**                                                                                                               |
| [`oauth-browser-client`](./packages/oauth/browser-client/README.md): minimal OAuth browser client implementation                 |
| **Lexicon defintiions**                                                                                                          |
| [`bluemoji`](./packages/definitions/bluemoji/README.md): adds `blue.moji.*` definitions                                          |
| [`bluesky`](./packages/definitions/bluesky/README.md): adds `app.bsky.*` and `chat.bsky.*` definitions                           |
| [`ozone`](./packages/definitions/ozone/README.md): adds `tools.ozone.*` definitions                                              |
| [`whitewind`](./packages/definitions/whitewind/README.md): adds `com.whtwnd.*` definitions                                       |
| **Utility packages**                                                                                                             |
| [`tid`](./packages/utilities/tid/README.md): create and parse TID identifiers                                                    |
| [`car`](./packages/utilities/car/README.md): read AT Protocol's CAR (content-addressable archive) repositories                   |
| [`cid`](./packages/utilities/cid/README.md): CIDv1 codec                                                                         |
| [`cbor`](./packages/utilities/cbor/README.md): DAG-CBOR codec                                                                    |
| [`varint`](./packages/utilities/varint/README.md): Protobuf-style varint codec                                                   |
| [`base32`](./packages/utilities/base32/README.md): base32 codec                                                                  |
| **Bluesky-specific packages**                                                                                                    |
| [`bluesky-richtext-builder`](./packages/bluesky/richtext-builder/README.md): builder pattern for Bluesky's rich text facets      |
| [`bluesky-richtext-parser`](./packages/bluesky/richtext-parser/README.md): parse Bluesky's (extended) rich text syntax           |
| [`bluesky-richtext-segmenter`](./packages/bluesky/richtext-segmenter/README.md): segments Bluesky's rich text facets into tokens |
| [`bluesky-threading`](./packages/bluesky/threading/README.md): create Bluesky threads containing multiple posts with one write   |
