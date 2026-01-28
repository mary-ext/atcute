# @atcute/oauth-scope-parser

parser and matcher for atproto OAuth scopes.

## installation

```sh
npm install @atcute/oauth-scope-parser
```

## usage

### parsing and matching scopes

```typescript
import { ScopeSet } from '@atcute/oauth-scope-parser';

const scopes = new ScopeSet('repo:* account:email identity:handle');

// check if a specific permission is granted
scopes.matches('repo', { collection: 'app.bsky.feed.post', action: 'create' }); // true
scopes.matches('account', { attr: 'email', action: 'read' }); // true
scopes.matches('account', { attr: 'email', action: 'manage' }); // false
```

### working with individual permissions

```typescript
import { RepoPermission, RpcPermission } from '@atcute/oauth-scope-parser';

// parse a scope string
const repo = RepoPermission.fromString('repo:app.bsky.feed.post?action=create');
repo.matches({ collection: 'app.bsky.feed.post', action: 'create' }); // true
repo.matches({ collection: 'app.bsky.feed.post', action: 'delete' }); // false

// normalize a scope
repo.toString(); // 'repo:app.bsky.feed.post?action=create'

// generate minimal scope for a permission
RepoPermission.scopeNeededFor({ collection: 'app.bsky.feed.post', action: 'create' });
// 'repo:app.bsky.feed.post?action=create'
```

### normalizing scopes

```typescript
import { normalizeScopes, normalizeScopeValue } from '@atcute/oauth-scope-parser';

// normalize a single scope
normalizeScopeValue('repo?collection=*&collection=app.bsky.feed.post');
// 'repo:*' (wildcard absorbs specific collections)

// normalize a space-separated scope string
normalizeScopes('repo:* repo:app.bsky.feed.post account:email');
// 'account:email repo:*' (sorted, deduplicated)
```

## scope types

| type | syntax | example |
|------|--------|---------|
| `repo` | `repo:<collection>[?action=<action>]` | `repo:app.bsky.feed.post?action=create` |
| `rpc` | `rpc:<lxm>?aud=<audience>` | `rpc:app.bsky.feed.getFeed?aud=*` |
| `blob` | `blob:<accept>` | `blob:image/*` |
| `account` | `account:<attr>[?action=<action>]` | `account:email?action=manage` |
| `identity` | `identity:<attr>` | `identity:handle` |
| `include` | `include:<nsid>[?aud=<audience>]` | `include:app.bsky.authFullApp` |

### static scopes

- `atproto` - base scope (required)
- `transition:generic` - transition scope
- `transition:email` - email transition scope
- `transition:chat.bsky` - chat transition scope

## permission sets

permission sets are lexicon-defined collections of permissions referenced via `include:` scopes.

```typescript
import { IncludeScope, type LexiconPermissionSet } from '@atcute/oauth-scope-parser';

// parse the include scope
const include = IncludeScope.fromString(
  'include:app.bsky.authCreatePosts?aud=did:web:bsky.social#atproto_pds'
);

// resolve the permission set from your lexicon resolver
const permissionSet: LexiconPermissionSet = {
  permissions: [
    {
      resource: 'rpc',
      inheritAud: true,
      lxm: ['app.bsky.video.uploadVideo', 'app.bsky.video.getJobStatus'],
    },
    {
      resource: 'repo',
      action: ['create'],
      collection: ['app.bsky.feed.post', 'app.bsky.feed.postgate'],
    },
  ],
};

// expand to concrete permissions
const { permissions, rejected } = include.toPermissions(permissionSet);

// permissions: [RpcPermission, RepoPermission]
// rejected: [] (any invalid permissions with reasons)
```

### authority validation

permission sets can only grant permissions within their own namespace:

```typescript
const include = new IncludeScope('app.bsky.authCreatePosts');

// allowed: app.bsky.* (same authority)
include.isParentAuthorityOf('app.bsky.feed.post'); // true
include.isParentAuthorityOf('app.bsky.video.uploadVideo'); // true

// rejected: different authority
include.isParentAuthorityOf('com.example.other'); // false
include.isParentAuthorityOf('*'); // false
```

### integrating with ScopeSet

`ScopeSet` handles concrete permissions only. expand `include:` scopes before creating the set:

```typescript
import { ScopeSet, IncludeScope, hasScopePrefix } from '@atcute/oauth-scope-parser';

function createScopeSet(
  scopeString: string,
  resolvePermissionSet: (nsid: string) => LexiconPermissionSet | null,
): ScopeSet {
  const expanded: string[] = [];

  for (const scope of scopeString.split(' ')) {
    if (hasScopePrefix(scope, 'include')) {
      const include = IncludeScope.fromString(scope);
      if (include) {
        const permissionSet = resolvePermissionSet(include.nsid);
        if (permissionSet) {
          const { permissions } = include.toPermissions(permissionSet);
          for (const perm of permissions) {
            expanded.push(perm.toString());
          }
          continue;
        }
      }
    }
    expanded.push(scope);
  }

  return new ScopeSet(expanded);
}
```

## api reference

### ScopeSet

```typescript
class ScopeSet extends Set<string> {
  constructor(scopes: string | Iterable<string>);
  matches<R extends ResourceType>(resource: R, options: ScopeMatchOptions[R]): boolean;
}
```

### permission classes

all permission classes share this interface:

```typescript
class *Permission {
  static fromString(scope: string): *Permission | null;
  static fromSyntax(syntax: ScopeSyntax): *Permission | null;
  static scopeNeededFor(request: *PermissionMatch): string;
  matches(request: *PermissionMatch): boolean;
  toString(): string;
}
```

### IncludeScope

```typescript
class IncludeScope {
  readonly nsid: Nsid;
  readonly aud: AtprotoAudience | undefined;

  static fromString(scope: string): IncludeScope | null;
  isParentAuthorityOf(nsid: '*' | Nsid): boolean;
  toPermissions(permissionSet: LexiconPermissionSet): ExpandedPermissions;
  toString(): string;
}
```

### normalization functions

```typescript
function normalizeScopeValue(scope: string): string | null;
function normalizeScopes(scopes: string): string;
function validateScopes(scopes: string): boolean;
function hasAtprotoScope(scopes: string): boolean;
```

### syntax utilities

```typescript
function parseScopeString(scope: string): ScopeSyntax;
function formatScopeString(options: FormatScopeOptions): string;
function hasScopePrefix(scope: string, prefix: string): boolean;
```
