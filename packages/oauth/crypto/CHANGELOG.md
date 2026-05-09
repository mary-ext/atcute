# @atcute/oauth-crypto

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
