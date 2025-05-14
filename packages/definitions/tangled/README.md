# @atcute/tangled

[Tangled](https://tangled.sh/) (sh.tangled.\*) schema definitions

## usage

```ts
import { ShTangledRepoPullComment } from '@atcute/tangled';
import { is } from '@atcute/lexicons';

const comment: ShTangledRepoPullComment.Main = {
	$type: 'sh.tangled.repo.pull.comment',
	repo: 'at://did:plc:wshs7t2adsemcrrd4snkeqli/sh.tangled.repo/3liuighjy2h22',
	pull: 'at://did:plc:ia76kvnndjutgedggx2ibrem/sh.tangled.repo.pull/3lp3tg57oyv22',
	owner: 'did:plc:ia76kvnndjutgedggx2ibrem',
	createdAt: '2025-05-14T01:29:08Z',
	body: 'not sure what went wrong with that first round (probably pasted the diffs wrong) but I think this should work',
};

is(ShTangledRepoPullComment.mainSchema, comment);
// -> true
```

### with `@atcute/client`

pick either one of these 3 options to register the ambient declarations

```jsonc
// tsconfig.json
{
	"compilerOptions": {
		"types": ["@atcute/tangled"],
	},
}
```

```ts
// env.d.ts
/// <reference types="@atcute/tangled" />
```

```ts
// index.ts
import type {} from '@atcute/tangled';
```

now all the XRPC operations should be visible in the client
