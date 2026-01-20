<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import '../lib/oauth';
import { Client } from '@atcute/client';
import { deleteStoredSession, getSession, OAuthUserAgent } from '@atcute/oauth-browser-client';

const router = useRouter();

const sessionDid = ref(localStorage.getItem('session_did'));
const tokenInfo = ref<object | null>(null);
const pdsSession = ref<object | null>(null);
const error = ref('');

const logout = async () => {
	if (!sessionDid.value) {
		return;
	}

	try {
		const session = await getSession(sessionDid.value, { allowStale: true });
		const agent = new OAuthUserAgent(session);
		await agent.signOut();
	} catch {
		deleteStoredSession(sessionDid.value);
	}

	localStorage.removeItem('session_did');
	router.replace('/');
};

onMounted(async () => {
	if (!sessionDid.value) {
		router.replace('/');
		return;
	}

	try {
		const session = await getSession(sessionDid.value, { allowStale: true });
		const agent = new OAuthUserAgent(session);
		const rpc = new Client({ handler: agent });

		tokenInfo.value = await session.getTokenInfo('auto');

		const response = await rpc.get('com.atproto.server.getSession', {});
		pdsSession.value = response.data;
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'failed to load session';
	}
});
</script>

<template>
	<main>
		<h1>protected</h1>

		<p class="desc">this page calls <code>com.atproto.server.getSession</code> using the OAuth session.</p>

		<div class="actions">
			<router-link to="/">home</router-link>
			<button @click="logout">logout</button>
		</div>

		<div v-if="error" class="error">
			<p>{{ error }}</p>
		</div>

		<template v-else-if="tokenInfo && pdsSession">
			<section>
				<h2>token</h2>
				<pre>{{ JSON.stringify(tokenInfo, null, 2) }}</pre>
			</section>

			<section>
				<h2>pds session</h2>
				<pre>{{ JSON.stringify(pdsSession, null, 2) }}</pre>
			</section>
		</template>

		<p v-else>loading...</p>
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
	margin-bottom: 0.5rem;
}

h2 {
	font-size: 1.1rem;
	margin-bottom: 0.5rem;
}

.desc {
	margin-bottom: 1rem;
	opacity: 0.8;
}

.desc code {
	font-size: 0.9em;
	background: var(--color-background-soft);
	padding: 0.2em 0.4em;
	border-radius: 4px;
}

.actions {
	display: flex;
	gap: 1rem;
	align-items: center;
	margin-bottom: 1.5rem;
}

.actions a {
	color: var(--color-text);
}

button {
	padding: 0.5rem 0.75rem;
	border: none;
	border-radius: 4px;
	background: var(--color-heading);
	color: var(--color-background);
	cursor: pointer;
}

section {
	margin-bottom: 1.5rem;
}

pre {
	background: var(--color-background-soft);
	padding: 1rem;
	border-radius: 4px;
	overflow-x: auto;
	font-size: 0.85rem;
}

.error p {
	color: #e53935;
}
</style>
