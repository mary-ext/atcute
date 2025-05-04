# @atcute/client

## 3.1.0

### Minor Changes

- 49028fb: a new Client class for making API requests, replacing the previous `XRPC` class.

  key changes include:

  - **explicit error handling**: the new `Client` class returns an object of `{ ok, data }` instead
    of throwing on non-successful responses. this should make it easier to handle these exceptional
    cases without needing to wrap the request in a try-catch block.

    ```ts
    const { ok, data } = await client.get('app.bsky.actor.getProfile', {
    	params: { actor: 'bsky.app' },
    });

    if (!ok) {
    	switch (data.error) {
    		case 'InvalidRequest': {
    			// account doesn't exist
    			break;
    		}
    		default: {
    			// default error handling
    		}
    	}
    }

    if (ok) {
    	console.log(data.displayName);
    	// -> "Bluesky"
    }
    ```

  - **optimistic response handling**: a `ok()` helper function is provided if you would like to use
    the old "optimistic" behavior.

    ```ts
    try {
    	const data = await ok(
    		client.get('app.bsky.actor.getProfile', {
    			params: { actor: 'bsky.app' },
    		}),
    	);

    	console.log(data.displayName);
    	// -> "Bluesky"
    } catch (err) {
    	if (err instanceof ClientResponseError) {
    		switch (err.error) {
    			case 'InvalidRequest': {
    				// account doesn't exist
    				break;
    			}
    			default: {
    				// default error handling
    			}
    		}
    	}
    }
    ```

  - **configurable response format**: the `as` field can be used to configure how the response body
    should be returned:

    - `"json"` parsed as JSON
    - `"blob"` returns a Blob
    - `"bytes"` returns a Uint8Array
    - `"stream"` returns a readable stream
    - `null` discards the response body

    providing this field is required if you're making a request to queries or procedures that do not
    return a JSON response. (e.g. `com.atproto.sync.getBlob`)

  - **clearer naming**:

    - `.call()` method is renamed to `.post()` to better reflect that it makes an HTTP POST request.
    - configuring service proxying should be less confusing.

      ```ts
      const client = new Client({
      	// ...
      	proxy: {
      		did: 'did:web:api.bsky.chat',
      		serviceId: '#bsky_chat',
      	},
      });
      ```

## 3.0.1

### Patch Changes

- 4f59252: pull latest Bluesky lexicons

## 3.0.0

this version contains breaking changes to the lexicon type definitions.

### Major Changes

- 813679f: add `At.Nsid` string type

  this is a specialized type for `nsid` formatted strings, where there were previously none.

- d3fbc7e: consistent casing on types and interfaces

  no more capitalized/pascalcase mixing, these following types are renamed:

  - `At.CID` → `At.Cid`
  - `At.CIDLink` → `At.CidLink`
  - `At.DID` → `At.Did`

- c7e8573: add `At.ResourceUri` string type

  this is a specialized type for `at-uri` formatted strings, replacing the previous `At.Uri` string

- 61bd8d2: add `At.GenericUri` string type

  this is a specialized type for `uri` formatted strings, where there were previously none.

### Minor Changes

- 9d05dfd: add `At.RecordKey` string type

  this is currently an alias to `string` for now.

- 13f35e4: allow passing ReadableStream and ArrayBuffer as input
- a47373f: add `At.Identifier` string type

  an alias for either `At.DID` or `At.Handle`

- 2d10bd8: add `At.CanonicalResourceUri` string type
- 8aedcc5: `At.Did` now contains a `TMethod` type parameter for specifying DID methods in the
  identifier.
- 45cfe46: add new response field, deprecating the old output field
- 24be9be: `At.Handle` string type is now stricter
- 87a99f1: add `At.Tid` string type

  this is currently an alias to string for now, but it can be made stricter later.

### Patch Changes

- 45cc699: clean up base types JSDoc

## 2.0.9

### Patch Changes

- 298189f: pull latest Bluesky lexicons
