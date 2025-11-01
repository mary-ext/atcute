---
'@atcute/did-plc': minor
---

loosen validations around PLC operations

the schemas still contain constraints that are considered a hard requirement, but the soft
requirements goes to `validateIncomingOp()`, use this if you're trying to check whether the
operation you're trying to submit would pass or not.
