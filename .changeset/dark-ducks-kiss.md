---
'@atcute/lexicon-doc': patch
---

change the return type of `findExternalReferences`

this is a breaking change, I've made the mistake of shipping this function too early. it will now
return the full NSID + definition IDs, instead of just NSIDs. it's also now returned as a set
instead of a sorted array.
