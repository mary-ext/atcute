# @atcute/lexicon-doc

## 1.3.0

### Minor Changes

- f31e261: add support for permission sets
- 262db99: add builders for permission sets

### Patch Changes

- ae2015a: properly validate string constraints on token values
- d70f4f6: raise error if default value does not match enum
- 178714d: raise error if knownValues is used with const/enum
- fdf6519: raise error if values do not match string format
- Updated dependencies [2e2159b]
  - @atcute/lexicons@1.2.3

## 1.2.0

### Minor Changes

- e8e4f43: new builder API for easy authoring of lexicon documents

  here's an example representing how a basic rich text document could've looked (inspired by
  Leaflet.)

  ```ts
  // color.ts
  import { document, integer, object, required, union } from '@atcute/lexicon-doc/builder';

  const channel = integer({ minimum: 0, maximum: 255 });
  const alpha = integer({ minimum: 0, maximum: 100 });

  export const rgb = object({
  	properties: {
  		r: required(channel),
  		g: required(channel),
  		b: required(channel),
  	},
  });

  export const rgba = object({
  	properties: {
  		r: required(channel),
  		g: required(channel),
  		b: required(channel),
  		a: required(alpha),
  	},
  });

  export const anyColor = union({ refs: [rgb, rgba] });

  export default document({
  	id: 'com.example.color',
  	defs: { rgb, rgba },
  });

  // text-block.ts
  import { document, object, string, token, required } from '@atcute/lexicon-doc/builder';

  export const alignStart = token();
  export const alignCenter = token();
  export const alignEnd = token();

  export const main = object({
  	properties: {
  		content: required(string()),
  		alignment: string({
  			default: alignStart,
  			knownValues: [alignCenter, alignCenter, alignRight],
  		}),
  	},
  });

  export default document({
  	id: 'com.example.text-block',
  	defs: { main, alignStart, alignCenter, alignEnd },
  });

  // document.ts
  import { array, document, object, record, required, string } from '@atcute/lexicon-doc/builder';

  import { anyColor } from './color.ts';
  import { main as textBlock } from './text-block.ts';

  export const main = record({
  	key: 'tid',
  	record: object({
  		properties: {
  			title: required(string({ maxLength: 300 })),
  			backgroundColor: anyColor,
  			blocks: required(
  				array({
  					items: union({
  						refs: [textBlock],
  					}),
  				}),
  			),
  		},
  	}),
  });

  export default document({
  	id: 'com.example.document',
  	defs: { main },
  });
  ```

  you'd then call `build()` to get the final lexicon documents

  ```ts
  import { build } from '@atcute/lexicon-doc/builder';

  import colorDoc from './color.ts';
  import textBlockDoc from './text-block.ts';
  import documentDoc from './document.ts';

  const lexicons = build({ documents: [colorDoc, textBlockDoc, documentDoc] });
  //    ^? { 'com.example.color': { lexicon: 1, ... } }
  ```

### Patch Changes

- d53a847: raise error if default value does not match provided constant values
- 053958e: raise error if closed union has zero members

## 1.1.4

### Patch Changes

- d901d8a: throw if definition ID is invalid
- c603d16: add JSON schema for lexicon schemas
- 84b135f: clean up Valita schemas

## 1.1.3

### Patch Changes

- a945bc3: fix infinite recursion when crawling internal references

## 1.1.2

### Patch Changes

- b30da0e: add `declarationMap` to tsconfig

## 1.1.1

### Patch Changes

- a025873: change the return type of `findExternalReferences`

  this is a breaking change, I've made the mistake of shipping this function too early. it will now
  return the full NSID + definition IDs, instead of just NSIDs. it's also now returned as a set
  instead of a sorted array.

- a025873: make `findExternalReferences` walk a sibling's definitions if referenced
- a025873: add an optional definition ID parameter to `findExternalReferences`

  this will let you view all the external references from a specific schema definition instead of
  the whole schema.

## 1.1.0

### Minor Changes

- 29f8857: `findExternalReferences` function for extracting all external references from a document

## 1.0.3

### Patch Changes

- d17735e: fix faulty UTF-16 fast-path constraint validation

## 1.0.2

### Patch Changes

- 3efa702: validate default/const/known values with the given constraints

## 1.0.1

### Patch Changes

- 2249c88: validate mime-type/encoding in xrpc body
