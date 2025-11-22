---
'@atcute/lexicon-doc': major
---

make lexicon document validation more lenient

the `lexiconDoc` schema provided now only performs structural validation, it will not check whether
any of the definitions in the document is valid or not. said constraint validations can be performed
by `validateLexiconDoc` and the various refine functions exported by the library.

this should allow network validations to only throw on the definitions that are actually being used.
