# @atcute/tap

## 1.0.0

### Major Changes

- cda96fb: migrate from `@badrap/valita` to `valibot`

  exported schemas are now valibot schemas.

  ```ts
  import * as v from 'valibot';
  import { tapEventWireSchema } from '@atcute/tap';

  // before
  const result = tapEventWireSchema.try(input);

  // after
  const result = v.safeParse(tapEventWireSchema, input);
  ```

### Patch Changes

- Updated dependencies [f45af74]
- Updated dependencies [6aa06fb]
- Updated dependencies [1437627]
- Updated dependencies [8d4aebc]
- Updated dependencies [d64ddf1]
  - @atcute/identity@2.0.0
  - @atcute/lexicons@2.0.0

## 0.1.2

### Patch Changes

- d174298: mark some dependencies as peer dependencies to avoid breakages in the future.
- Updated dependencies [d174298]
- Updated dependencies [87c00bb]
- Updated dependencies [8b6c404]
  - @atcute/identity@1.1.5
  - @atcute/lexicons@1.3.1

## 0.1.1

### Patch Changes

- fbbe907: properly differentiate record event actions
