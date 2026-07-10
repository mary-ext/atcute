---
'@atcute/mst': patch
---

fix `MSTNode.deserialize` accepting negative or fractional key prefix lengths, which decoded a node
into keys that re-serialize to a different CID
