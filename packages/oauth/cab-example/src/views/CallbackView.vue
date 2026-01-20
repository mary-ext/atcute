<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import '../lib/oauth';
import { finalizeAuthorization } from '@atcute/oauth-browser-client';

const router = useRouter();

const error = ref('');

onMounted(async () => {
	try {
		// server redirects with params in hash
		const params = new URLSearchParams(location.hash.slice(1));

		// scrub params from URL to prevent replay
		history.replaceState(null, '', location.pathname + location.search);

		const { session } = await finalizeAuthorization(params);

		// store DID for session tracking
		localStorage.setItem('session_did', session.did);

		router.replace('/protected');
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'callback failed';
	}
});
</script>

<template>
	<main>
		<div v-if="error" class="error">
			<h1>callback error</h1>
			<p>{{ error }}</p>
			<router-link to="/">back home</router-link>
		</div>
		<p v-else>completing authorization...</p>
	</main>
</template>

<style scoped>
main {
	max-width: 40rem;
	margin: 2rem auto;
	padding: 0 1rem;
}

.error h1 {
	font-size: 1.25rem;
	margin-bottom: 0.5rem;
}

.error p {
	color: #e53935;
	margin-bottom: 1rem;
}
</style>
