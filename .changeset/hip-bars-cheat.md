---
'@atcute/lexicon-doc': major
---

align lexicon document validation schemas closer with the specification

we were originally following @atproto/lexicon, but this has been a source of confusion when
cross-validating against the official specification document.

the only notable deviation is the differentiation between a "field type definition" (LexField) and
an "inlinable field type definition" (LexDefinableField), you can't nest an object inside another
object without a ref in between.

this change should not be a concern if you are only relying on `lexiconDoc` schema.
