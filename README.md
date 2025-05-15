# atcute

a collection of lightweight TypeScript packages for AT Protocol, the protocol powering Bluesky,
featuring:

- an [API client][client] for making typed HTTP requests, with support for lexicons like
  [WhiteWind][whitewind] or [Bluemoji][bluemoji]
- an [OAuth client for SPA applications][oauth-browser-client] for authentication use-cases
- a grab bag of utility packages:
  - codec libraries for [DASL][dasl] data formats, a strict subset of IPLD specifications, like
    CIDv1, DAG-CBOR and CAR, but tailored specifically for atproto
  - codec for atproto's timestamp identifiers
  - cryptography library for signing and verification of signatures in atproto
  - schema validators for DID documents, and verification of did:plc operations
  - Bluesky-specific helpers like [a rich text builder][bluesky-richtext-builder] and [a post thread
    builder][bluesky-threading]

looking for more? check out [skyware][skyware], an additional collection of packages, built on top
of atcute.

[bluemoji]: ./packages/definitions/bluemoji
[bluesky-richtext-builder]: ./packages/bluesky/richtext-builder
[bluesky-threading]: ./packages/bluesky/threading
[client]: ./packages/core/client
[oauth-browser-client]: ./packages/oauth/browser-client
[whitewind]: ./packages/definitions/whitewind
[dasl]: https://dasl.ing/
[ipld]: https://ipld.io/
[skyware]: https://skyware.js.org/

---

| Packages                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------- |
| **Client packages**                                                                                                    |
| [`client`](./packages/clients/client): API client library                                                              |
| [`jetstream`](./packages/clients/jetstream): Jetstream client                                                          |
| **OAuth packages**                                                                                                     |
| [`oauth-browser-client`](./packages/oauth/browser-client): minimal OAuth browser client implementation                 |
| **Lexicon packages**                                                                                                   |
| [`lex-cli`](./packages/lexicons/lex-cli): CLI tool to generate schema definitions                                      |
| [`lexicon-doc`](./packages/lexicons/lexicon-doc): type definitions and schemas for lexicon documents                   |
| [`lexicons`](./packages/lexicons/lexicons): core lexicon types, interfaces, and schema validations                     |
| **Lexicon definition packages**                                                                                        |
| [`atproto`](./packages/definitions/atproto): `com.atproto.*` schema definitions                                        |
| [`bluemoji`](./packages/definitions/bluemoji): `blue.moji.*` schema definitions                                        |
| [`bluesky`](./packages/definitions/bluesky): `app.bsky.*` and `chat.bsky.*` schema definitions                         |
| [`frontpage`](./packages/definitions/frontpage): `fyi.unravel.frontpage.*` schema definitions                          |
| [`ozone`](./packages/definitions/ozone): `tools.ozone.*` schema definitions                                            |
| [`tangled`](./packages/definitions/tangled): `sh.tangled.*` schema definitions                                         |
| [`whitewind`](./packages/definitions/whitewind): `com.whtwnd.*` schema definitions                                     |
| **Identity packages**                                                                                                  |
| [`did-plc`](./packages/identity/did-plc): validations, type definitions and schemas for did:plc operations             |
| [`identity`](./packages/identity/identity): syntax, type definitions and schemas for handles, DIDs and DID documents   |
| [`identity-resolver`](./packages/identity/identity-resolver): handle and DID document resolution                       |
| [`identity-resolver-node`](./packages/identity/identity-resolver-node): additional identity resolvers for Node.js      |
| **Utility packages**                                                                                                   |
| [`car`](./packages/utilities/car): DASL CAR and atproto repository decoder                                             |
| [`cbor`](./packages/utilities/cbor): DASL dCBOR42 codec                                                                |
| [`cid`](./packages/utilities/cid): DASL CID codec                                                                      |
| [`crypto`](./packages/utilities/crypto): cryptographic utilities                                                       |
| [`multibase`](./packages/utilities/multibase): multibase utilities                                                     |
| [`tid`](./packages/utilities/tid): atproto timestamp identifier codec                                                  |
| [`varint`](./packages/utilities/varint): protobuf-style LEB128 varint codec                                            |
| **Bluesky-specific packages**                                                                                          |
| [`bluesky-moderation`](./packages/bluesky/moderation): interprets Bluesky's content moderation labels                  |
| [`bluesky-richtext-builder`](./packages/bluesky/richtext-builder): builder pattern for Bluesky's rich text facets      |
| [`bluesky-richtext-parser`](./packages/bluesky/richtext-parser): parse Bluesky's (extended) rich text syntax           |
| [`bluesky-richtext-segmenter`](./packages/bluesky/richtext-segmenter): segments Bluesky's rich text facets into tokens |
| [`bluesky-threading`](./packages/bluesky/threading): create Bluesky threads containing multiple posts with one write   |

## contribution guide

this monorepo uses [`mise`](https://mise.jdx.dev) to handle versioning, although it doesn't really
matter. Node.js LTS is necessary to use the `internal-dev-env` package for testing the `client`
package with the official PDS distribution, but otherwise you can (and should) use the latest
available version.

```sh
# Install all the recommended runtimes
mise install

# Runs all the build scripts
pnpm run -r build

# Pull in the latest ATProto/Ozone/Bluesky lexicons, and generate the type declarations
pnpm run pull
pnpm run -r generate
```

### checking package sizes

to observe the size of packages (both install size and bundled size), there is a `pkg-size-report`
tool doing just that. you can also save the package sizes at a given time and inspect the impact of
changes to the final bundle size. the tool uses `esbuild` to produce a minified bundle to get the
size of each entrypoint.

<!-- prettier-ignore-start -->
<!-- Otherwise it wrecks the gfm alertbox ugh -->

> [!WARNING]
> run `pnpm run -r build` before running the command. otherwise, the command **may not run**, or **give bad measurements**.

<!-- prettier-ignore-end -->

```sh
# See the size of packages.
# If package sizes were saved previously, will also show the diff.
pnpm pkg-size-report

# Save esbuild metafiles and package size information.
pnpm pkg-size-report --save

# Save just esbuild metafiles.
pnpm pkg-size-report --save-meta

# Show only the packages whose size have changed.
pnpm pkg-size-report --compare

# Keep the result bundle produced by esbuild.
# Will be left in /tmp/[...]--[pkgname]--[random]
pnpm pkg-size-report --keep-builds
```

---

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/mary-ext/atcute)
