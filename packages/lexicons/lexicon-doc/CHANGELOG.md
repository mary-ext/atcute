# @atcute/lexicon-doc

## 2.1.2

### Patch Changes

- 1ed09c9: verify external references have valid NSID

## 2.1.1

### Patch Changes

- 33f811a: don't make findExternalReferences recurse
- Updated dependencies [95dfb99]
- Updated dependencies [6e63aab]
- Updated dependencies [fe963f8]
- Updated dependencies [441b28a]
- Updated dependencies [d7a8f60]
  - @atcute/lexicons@1.2.9
  - @atcute/uint8array@1.1.1
  - @atcute/util-text@1.1.1

## 2.1.0

### Minor Changes

- 2c386c7: include lexicon ref parsing utilities

### Patch Changes

- 066bc16: faster UTF-8 and grapheme length validation
- Updated dependencies [e73fddf]
- Updated dependencies [2aee780]
- Updated dependencies [a60d862]
- Updated dependencies [2772033]
  - @atcute/lexicons@1.2.7
  - @atcute/util-text@1.1.0
  - @atcute/uint8array@1.1.0

## 2.0.6

### Patch Changes

- 1bba4f3: alter rpcPermission aud
- f737494: make use of util-text dependency for grapheme counting
- Updated dependencies [f737494]
  - @atcute/lexicons@1.2.6

## 2.0.5

### Patch Changes

- 32c0da6: rectify permission set validation once again

## 2.0.4

### Patch Changes

- 61a57f7: fix dependency constraint
- 30fcaaf: remove permissions that can't be represented in a permission set
- 30fcaaf: issue refinement error for incorrect permission resource

## 2.0.3

### Patch Changes

- 90690b8: fix missing description in string definitions

## 2.0.2

### Patch Changes

- Updated dependencies [03a13b3]
  - @atcute/lexicons@1.2.5

## 2.0.1

### Patch Changes

- cb2347f: improve lex permission refinement
- f82cff8: slight wording change on linting messages
- Updated dependencies [4b4a027]
  - @atcute/identity@1.1.3

## 2.0.0

### Major Changes

- d319bb1: align lexicon document validation schemas closer with the specification

  we were originally following @atproto/lexicon, but this has been a source of confusion when
  cross-validating against the official specification document.

  the only notable deviation is the differentiation between a "field type definition" (LexField) and
  an "inlinable field type definition" (LexDefinableField), you can't nest an object inside another
  object without a ref in between.

  this change should not be a concern if you are only relying on `lexiconDoc` schema.

- 082683e: make lexicon document validation lenient

  the `lexiconDoc` schema will no longer perform constraint checks that ensures that all of the
  definitions in the document is nonambiguous (like ensuring that default string values don't go
  beyond its specified maxLength), all constraint checks are now performed by `refine*` functions.

  you can get the previous functionality back by passing the resulting parsed document to
  `refineLexiconDoc` with the second parameter set to true (which enables performing nested checks.)

  ```ts
  const doc = lexiconDoc.parse(input);
  const issues = refineLexiconDoc(doc, true);
  //    ^? RefineIssue[]
  ```

  the side-benefit is that this allows lexicon documents to be partly salvagable by runtime-based
  validators, they'd have the ability to only throw on definitions that are actually being used in
  the validation process.

### Minor Changes

- d319bb1: add RecordValidator for record validations using remote schemas

  this is useful for PDS implementations that wants to validate a record that a user is putting into
  their repository but don't have local copies of its schema.

  ```ts
  import { RecordValidator } from '@atcute/lexicon-doc/validations';

  // lexicon documents retrieved from the network or loaded from disk
  const docs = {
  	'app.bsky.feed.post': {
  		lexicon: 1,
  		id: 'app.bsky.feed.post',
  		defs: {
  			main: {
  				type: 'record',
  				record: {
  					type: 'object',
  					required: ['text', 'createdAt'],
  					properties: {
  						text: { type: 'string', maxLength: 300 },
  						createdAt: { type: 'string', format: 'datetime' },
  					},
  				},
  			},
  		},
  	},
  };

  const validator = new RecordValidator(docs, 'app.bsky.feed.post');

  validator.parse({
  	key: '3m6bkzurm4c7w',
  	object: {
  		$type: 'app.bsky.feed.post',
  		text: 'hello world',
  		createdAt: '2024-01-01T00:00:00.000Z',
  	},
  });
  ```

### Patch Changes

- 4a7e8dc: add additionalProperties to lexicon documents
- 2d7c5d8: allow passing records/XRPC methods to permissions
- Updated dependencies [630623c]
  - @atcute/lexicons@1.2.4

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
