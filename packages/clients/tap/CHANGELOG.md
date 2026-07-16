# @atcute/tap

## 1.0.2

### Patch Changes

- bdffc84: fix `adminPassword` not being sent on the subscription websocket upgrade.
- Updated dependencies [9882a31]
- Updated dependencies [72fe990]
- Updated dependencies [cb01440]
- Updated dependencies [96c679b]
- Updated dependencies [f31de6d]
- Updated dependencies [8482323]
- Updated dependencies [7bcf27c]
- Updated dependencies [87f3666]
- Updated dependencies [89f5536]
- Updated dependencies [d18b465]
- Updated dependencies [06d2f55]
- Updated dependencies [9738798]
- Updated dependencies [ffea168]
- Updated dependencies [0e039ef]
- Updated dependencies [ea64aa0]
  - @atcute/lexicons@2.0.3
  - @atcute/uint8array@1.1.5
  - @atcute/identity@2.0.2
  - @atcute/multibase@1.2.5

## 1.0.1

### Patch Changes

- 31a3a0b: drop sourcemaps and raw source files from publish
- Updated dependencies [31a3a0b]
  - @atcute/multibase@1.2.4
  - @atcute/identity@2.0.1
  - @atcute/lexicons@2.0.2
  - @atcute/uint8array@1.1.3

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
