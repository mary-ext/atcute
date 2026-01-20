import { fileURLToPath, URL } from 'node:url';

import { cloudflare } from '@cloudflare/vite-plugin';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		cloudflare(),
		{
			name: 'oauth-env',
			config() {
				const publicUrl = process.env.PUBLIC_URL;

				process.env.VITE_OAUTH_CLIENT_ID = `${publicUrl}/oauth-client-metadata.json`;
				process.env.VITE_OAUTH_REDIRECT_URI = `${publicUrl}/oauth/callback`;
			},
		},
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
});
