<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import '../lib/oauth';
import { createAuthorizationUrl, getSession } from '@atcute/oauth-browser-client';
import { isActorIdentifier } from '@atcute/lexicons/syntax';

const router = useRouter();

const identifier = ref('');
const error = ref('');
const loading = ref(false);
const sessionDid = ref<string | null>(localStorage.getItem('session_did'));

const login = async () => {
	const value = identifier.value.trim();
	if (!value) {
		error.value = 'please enter a handle or DID';
		return;
	}

	if (!isActorIdentifier(value)) {
		error.value = 'invalid handle or DID';
		return;
	}

	error.value = '';
	loading.value = true;

	try {
		const authUrl = await createAuthorizationUrl({
			target: { type: 'account', identifier: value },
			scope: 'atproto transition:generic',
		});

		await new Promise((resolve) => setTimeout(resolve, 200));
		window.location.assign(authUrl);
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'authorization failed';
		loading.value = false;
	}
};

const logout = () => {
	localStorage.removeItem('session_did');
	sessionDid.value = null;
};

const goToProtected = async () => {
	if (!sessionDid.value) {
		return;
	}

	try {
		await getSession(sessionDid.value, { allowStale: true });
		router.push('/protected');
	} catch {
		logout();
	}
};
</script>

<template>
	<main>
		<h1>atcute oauth cab example</h1>

		<div v-if="sessionDid" class="session">
			<p>
				signed in as <code>{{ sessionDid }}</code>
			</p>
			<div class="actions">
				<button @click="goToProtected">open protected page</button>
				<button @click="logout">logout</button>
			</div>
		</div>

		<form v-else @submit.prevent="login" class="login-form">
			<input
				v-model="identifier"
				type="text"
				placeholder="handle (alice.bsky.social) or DID (did:plc:...)"
				:disabled="loading"
			/>
			<button type="submit" :disabled="loading">
				{{ loading ? 'redirecting...' : 'login' }}
			</button>
			<p v-if="error" class="error">{{ error }}</p>
		</form>

		<hr />

		<p class="muted">
			debug:
			<a href="/oauth-client-metadata.json">client metadata</a>,
			<a href="/jwks.json">jwks</a>
		</p>
	</main>
</template>

<style scoped>
main {
	max-width: 40rem;
	margin: 2rem auto;
	padding: 0 1rem;
}

h1 {
	font-size: 1.5rem;
	margin-bottom: 1.5rem;
}

.session {
	margin-bottom: 1.5rem;
}

.session code {
	font-size: 0.9em;
	background: var(--color-background-soft);
	padding: 0.2em 0.4em;
	border-radius: 4px;
}

.actions {
	display: flex;
	gap: 0.5rem;
	margin-top: 0.75rem;
}

.login-form {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	max-width: 24rem;
}

.login-form input {
	padding: 0.6rem 0.8rem;
	border: 1px solid var(--color-border);
	border-radius: 4px;
	background: var(--color-background);
	color: var(--color-text);
}

button {
	padding: 0.6rem 0.8rem;
	border: none;
	border-radius: 4px;
	background: var(--color-heading);
	color: var(--color-background);
	cursor: pointer;
}

button:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

.error {
	color: #e53935;
	margin: 0;
}

hr {
	border: none;
	border-top: 1px solid var(--color-border);
	margin: 1.5rem 0;
}

.muted {
	opacity: 0.7;
	font-size: 0.9rem;
}

.muted a {
	color: inherit;
}
</style>
