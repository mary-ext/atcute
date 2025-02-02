# @atcute/did-plc

> [!NOTE]  
> not yet published.

validations, type definitions and schemas for did:plc operations

```ts
import { defs, validateIndexedOperationLog } from '@atcute/did-plc';

const did = `did:plc:ragtjsm2j2vknwkz3zp4oxrd`;

const response = await fetch(`https://plc.directory/${did}/log/audit`);
const json = await response.json();

const logs = defs.indexedOperationLog.parse(json);
await validateIndexedOperationLog(did, logs);
```
