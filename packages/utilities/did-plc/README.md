# @atcute/did-plc

> [!NOTE]  
> not yet published.

lightweight did:plc utilities library, currently only provides type definitions and basic
validations around the audit log.

```ts
import { defs, validateIndexedOperationLog } from '@atcute/did-plc';

const did = `did:plc:ragtjsm2j2vknwkz3zp4oxrd`;

const response = await fetch(`https://plc.directory/${did}/log/audit`);
const json = await response.json();

const logs = defs.indexedOperationLog.parse(json);
await validateIndexedOperationLog(did, logs);
```
