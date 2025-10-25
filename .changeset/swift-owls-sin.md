---
'@atcute/oauth-browser-client': minor
---

add support for client assertions.

this adds an optional `fetchClientAssertion` callback to `configureOAuth` that lets you fetch client
assertions from your backend, allowing your client to be classified as a confidential client.

```ts
import { configureOAuth } from '@atcute/oauth-browser-client';

configureOAuth({
	// ... existing config

	async fetchClientAssertion({ jkt, aud, createDpopProof }) {
		const dpop = await createDpopProof('https://example.com/api/client-assertion');

		const response = await fetch('https://example.com/api/client-assertion', {
			method: 'POST',
			headers: {
				dpop: dpop,
				'content-type': 'application/json',
			},
			body: JSON.stringify({ jkt, aud }),
		});

		const data = await response.json();

		return {
			client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
			client_assertion: data.assertion,
		};
	},
});
```
