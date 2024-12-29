# atcute

a collection of lightweight TypeScript packages for AT Protocol, the protocol powering Bluesky,
featuring:

- an [API client][client] for making typed HTTP requests, with support for lexicons like
  [WhiteWind][whitewind] or [Bluemoji][bluemoji]
- an [OAuth client for SPA applications][oauth-browser-client] for authentication use-cases
- utility packages for various data formats, including CIDv1, DAG-CBOR, CAR and TID record keys
- Bluesky-specific utility packages like [a rich text builder][bluesky-richtext-builder] and [a post
  threader][bluesky-threading]

looking for more? check out [skyware][skyware], an additional collection of packages, built on top
of atcute.

[bluemoji]: ./packages/definitions/bluemoji
[bluesky-richtext-builder]: ./packages/bluesky/richtext-builder
[bluesky-threading]: ./packages/bluesky/threading
[client]: ./packages/core/client
[oauth-browser-client]: ./packages/oauth/browser-client
[whitewind]: ./packages/definitions/whitewind
[skyware]: https://skyware.js.org/

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
| [`car`](./packages/utilities/car): DASL CAR and atproto repository decoder                                             |
| [`cbor`](./packages/utilities/cbor): DASL dCBOR42 codec                                                                |
| [`cid`](./packages/utilities/cid): DASL CID codec                                                                      |
| [`crypto`](./packages/utilities/crypto): cryptographic utilities                                                       |
| [`multibase`](./packages/utilities/multibase): multibase utilities                                                     |
| [`tid`](./packages/utilities/tid): atproto timestamp identifier codec                                                  |
| [`varint`](./packages/utilities/varint): protobuf-style LEB128 varint codec                                            |
| **Bluesky-specific packages**                                                                                          |
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
