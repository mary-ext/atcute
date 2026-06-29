# @atcute/oauth-crypto

## 1.0.1

### Patch Changes

- 31a3a0b: drop sourcemaps and raw source files from publish
- Updated dependencies [31a3a0b]
  - @atcute/multibase@1.2.4
  - @atcute/uint8array@1.1.3

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
