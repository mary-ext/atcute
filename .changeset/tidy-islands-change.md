---
'@atcute/lexicon-doc': major
---

make lexicon document validation lenient

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
validators, they'd have the ability to only throw on definitions that are actually being used in the
validation process.
