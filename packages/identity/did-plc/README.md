# @atcute/did-plc

validate and process did:plc operation logs.

```sh
npm install @atcute/did-plc
```

did:plc is a self-certifying DID method where the audit log serves as the source of truth. this
package validates that operations are properly signed and chained.

## usage

### validating audit logs

```ts
import { defs, processIndexedEntryLog } from '@atcute/did-plc';

const did = 'did:plc:ragtjsm2j2vknwkz3zp4oxrd';

const response = await fetch(`https://plc.directory/${did}/log/audit`);
const json = await response.json();

const logs = defs.indexedOperationLog.parse(json);
const { canonical, nullified } = await processIndexedEntryLog(did, logs);
```

### validating new operations

before submitting a new operation to plc.directory:

```ts
import { validateIncomingOp } from '@atcute/did-plc';

// throws if operation exceeds size limits or has invalid structure
validateIncomingOp(operation);
```

### checking dispute windows

```ts
import { isDisputePeriodActive, getDisputeCandidates } from '@atcute/did-plc';

// check if an operation can still be disputed (72-hour window)
if (isDisputePeriodActive(operation)) {
	// operation is still within the recovery window
}

// find operations that a key can dispute
const candidates = getDisputeCandidates(canonicalLog, rotationKey);
```
