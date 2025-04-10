---
'@atcute/client': major
---

a new Client class for making API requests, replacing the previous `XRPC` class.

key changes include:

- **explicit error handling**: the new `Client` class returns an object of `{ ok, data }` instead of
  throwing on non-successful responses. this should make it easier to handle these exceptional cases
  without needing to wrap the request in a try-catch block.

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
