# @atcute/did-plc

validate, sign, and interact with did:plc operations.

```sh
npm install @atcute/did-plc
```

did:plc is a self-certifying DID method where the audit log serves as the source of truth. this
package validates that operations are properly signed and chained, and provides utilities for
creating and submitting new operations.

## usage

### using the client

```ts
import { PlcClient } from '@atcute/did-plc';

const client = new PlcClient();

// fetch DID document
const doc = await client.getDocument('did:plc:ragtjsm2j2vknwkz3zp4oxrd');

// fetch current identity state
const state = await client.getState('did:plc:ragtjsm2j2vknwkz3zp4oxrd');

// fetch operation log
const log = await client.getOperationLog('did:plc:ragtjsm2j2vknwkz3zp4oxrd');

// fetch last operation
const lastOp = await client.getLastOperation('did:plc:ragtjsm2j2vknwkz3zp4oxrd');

// submit a signed operation
await client.submitOperation('did:plc:ragtjsm2j2vknwkz3zp4oxrd', signedOperation);
```

### signing operations

```ts
import { signOperation, signTombstone, deriveDidFromGenesisOp } from '@atcute/did-plc';

// sign an unsigned operation
const signedOp = await signOperation(unsignedOp, rotationKey);

// sign a tombstone
const signedTombstone = await signTombstone(unsignedTombstone, rotationKey);

// derive did:plc from genesis operation
const did = await deriveDidFromGenesisOp(signedGenesisOp);
```

### validating audit logs

```ts
import { defs, processIndexedEntryLog } from '@atcute/did-plc';
import * as v from 'valibot';

const did = 'did:plc:ragtjsm2j2vknwkz3zp4oxrd';

const response = await fetch(`https://plc.directory/${did}/log/audit`);
const json = await response.json();

const logs = v.parse(defs.indexedEntryLog, json);
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

// assuming `canonical` from processIndexedEntryLog result above

// find operations that a rotation key can dispute
const candidates = getDisputeCandidates(canonical, 'did:key:z...');

// check if a specific operation can still be disputed (72-hour window)
const entry = canonical.at(-1);
if (entry && isDisputePeriodActive(entry)) {
	// entry is still within the dispute window
}
```
