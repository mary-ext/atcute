# atcute

lightweight TypeScript packages for [AT Protocol](https://atproto.com), the protocol powering
Bluesky.

## quick start

```sh
npm install @atcute/client @atcute/bluesky
```

```ts
import { Client, simpleFetchHandler } from '@atcute/client';
import type {} from '@atcute/bluesky';

const client = new Client({
	handler: simpleFetchHandler({ service: 'https://public.api.bsky.app' }),
});

const { data } = await client.get('app.bsky.actor.getProfile', {
	params: { actor: 'bsky.app' },
});

console.log(data.displayName);
// -> Bluesky
```

for authenticated requests, see the [client docs](./packages/clients/client) or use the
[OAuth browser client](./packages/oauth/browser-client) for web apps.

## packages

| Packages                                                                                                    |
| ----------------------------------------------------------------------------------------------------------- |
| **Client packages**                                                                                         |
| [`client`](./packages/clients/client): XRPC HTTP client                                                     |
| [`firehose`](./packages/clients/firehose): XRPC subscription client                                         |
| [`jetstream`](./packages/clients/jetstream): Jetstream WebSocket client                                     |
| [`cache`](./packages/clients/cache): normalized cache store                                                 |
| **Server packages**                                                                                         |
| [`xrpc-server`](./packages/servers/xrpc-server): XRPC web framework                                         |
| [`xrpc-server-bun`](./packages/servers/xrpc-server-bun): Bun WebSocket adapter                              |
| [`xrpc-server-cloudflare`](./packages/servers/xrpc-server-cloudflare): Cloudflare Workers WebSocket adapter |
| [`xrpc-server-deno`](./packages/servers/xrpc-server-deno): Deno WebSocket adapter                           |
| [`xrpc-server-node`](./packages/servers/xrpc-server-node): Node.js WebSocket adapter                        |
| **OAuth packages**                                                                                          |
| [`oauth-browser-client`](./packages/oauth/browser-client): minimal OAuth client for SPAs                    |
| **Lexicon packages**                                                                                        |
| [`lex-cli`](./packages/lexicons/lex-cli): generate TypeScript from lexicon schemas                          |
| [`lexicon-doc`](./packages/lexicons/lexicon-doc): parse and author lexicon documents                        |
| [`lexicon-resolver`](./packages/lexicons/lexicon-resolver): resolve lexicons from the network               |
| [`lexicons`](./packages/lexicons/lexicons): core types and schema validation                                |
| **Lexicon definition packages**                                                                             |
| [`atproto`](./packages/definitions/atproto): `com.atproto.*`                                                |
| [`bluemoji`](./packages/definitions/bluemoji): `blue.moji.*`                                                |
| [`bluesky`](./packages/definitions/bluesky): `app.bsky.*`, `chat.bsky.*`                                    |
| [`frontpage`](./packages/definitions/frontpage): `fyi.unravel.frontpage.*`                                  |
| [`leaflet`](./packages/definitions/leaflet): `pub.leaflet.*`                                                |
| [`lexicon-community`](./packages/definitions/lexicon-community): `community.lexicon.*`                      |
| [`microcosm`](./packages/definitions/microcosm): `blue.microcosm.*`, `com.bad-example.*`                    |
| [`ozone`](./packages/definitions/ozone): `tools.ozone.*`                                                    |
| [`pckt`](./packages/definitions/pckt): `blog.pckt.*`                                                        |
| [`tangled`](./packages/definitions/tangled): `sh.tangled.*`                                                 |
| [`whitewind`](./packages/definitions/whitewind): `com.whtwnd.*`                                             |
| **Identity packages**                                                                                       |
| [`identity`](./packages/identity/identity): handle, DID and DID document types                              |
| [`identity-resolver`](./packages/identity/identity-resolver): handle and DID document resolution            |
| [`identity-resolver-node`](./packages/identity/identity-resolver-node): Node.js DNS-based handle resolver   |
| [`did-plc`](./packages/identity/did-plc): did:plc operation validation                                      |
| **Utility packages**                                                                                        |
| [`car`](./packages/utilities/car): CAR archive codec                                                        |
| [`cbor`](./packages/utilities/cbor): deterministic CBOR codec                                               |
| [`cid`](./packages/utilities/cid): content identifier codec                                                 |
| [`crypto`](./packages/utilities/crypto): signing and verification                                           |
| [`mst`](./packages/utilities/mst): merkle search tree utilities                                             |
| [`multibase`](./packages/utilities/multibase): base32/base64 encoding                                       |
| [`repo`](./packages/utilities/repo): repository export reader                                               |
| [`tid`](./packages/utilities/tid): timestamp identifier codec                                               |
| [`varint`](./packages/utilities/varint): LEB128 varint codec                                                |
| **Bluesky-specific packages**                                                                               |
| [`bluesky-moderation`](./packages/bluesky/moderation): content moderation interpretation                    |
| [`bluesky-richtext-builder`](./packages/bluesky/richtext-builder): rich text facet builder                  |
| [`bluesky-richtext-parser`](./packages/bluesky/richtext-parser): parse rich text syntax                     |
| [`bluesky-richtext-segmenter`](./packages/bluesky/richtext-segmenter): segment text by facets               |
| [`bluesky-search-parser`](./packages/bluesky/search-parser): search query tokenizer                         |
| [`bluesky-threading`](./packages/bluesky/threading): atomic thread publishing                               |

## contributing

this monorepo uses [mise](https://mise.jdx.dev) for runtime versioning and pnpm for package
management.

```sh
# install runtimes
mise install

# build all packages
pnpm run -r build

# pull latest lexicons and regenerate definitions
pnpm run -r pull
pnpm run -r generate
```

### package size reporting

check bundle sizes with the `pkg-size-report` tool:

> [!WARNING] run `pnpm run -r build` first, otherwise measurements may be inaccurate.

```sh
pnpm pkg-size-report           # show sizes (and diff if previously saved)
pnpm pkg-size-report --save    # save current sizes for comparison
pnpm pkg-size-report --compare # show only changed packages
```
