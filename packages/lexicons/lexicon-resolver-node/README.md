# @atcute/lexicon-resolver-node

Node.js lexicon authority resolver using native DNS.

```sh
npm install @atcute/lexicon-resolver-node
```

provides `NodeDnsLexiconAuthorityResolver` which resolves lexicon authorities via DNS TXT records
using Node.js's native `dns` module, avoiding the need for HTTP-based DoH resolution.

## usage

```ts
import { NodeDnsLexiconAuthorityResolver } from '@atcute/lexicon-resolver-node';

const authorityResolver = new NodeDnsLexiconAuthorityResolver();

const authority = await authorityResolver.resolve('app.bsky.feed.post');
// -> 'did:plc:4v4y5r3lwsbtmsxhile2ljac'
```

### custom nameservers

```ts
const resolver = new NodeDnsLexiconAuthorityResolver({
	nameservers: ['8.8.8.8', '8.8.4.4'],
});
```
