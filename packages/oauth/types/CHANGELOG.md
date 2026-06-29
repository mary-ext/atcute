# @atcute/oauth-types

## 1.0.1

### Patch Changes

- 31a3a0b: drop sourcemaps and raw source files from publish
- Updated dependencies [31a3a0b]
  - @atcute/identity@2.0.1
  - @atcute/lexicons@2.0.2
  - @atcute/oauth-keyset@0.1.2

## 1.0.0

### Major Changes

- 7d530ad: migrate from `@badrap/valita` to `valibot`

  exported schemas are now valibot schemas.

  ```ts
  import * as v from 'valibot';
  import { oauthClientMetadataSchema } from '@atcute/oauth-types';

  // before
  const result = oauthClientMetadataSchema.try(input);

  // after
  const result = v.safeParse(oauthClientMetadataSchema, input);
  ```

### Patch Changes

- Updated dependencies [f45af74]
- Updated dependencies [6aa06fb]
- Updated dependencies [1437627]
- Updated dependencies [8d4aebc]
- Updated dependencies [d64ddf1]
  - @atcute/identity@2.0.0
  - @atcute/lexicons@2.0.0
  - @atcute/oauth-keyset@0.1.1

## 0.1.1

### Patch Changes

- 0463193: public client support
