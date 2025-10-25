import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
	test: {
		projects: [
			{
				test: {
					name: 'node',
					include: ['**/*.test.ts'],
					environment: 'node',
				},
			},
			{
				test: {
					name: 'browser',
					include: ['**/*.test.ts', '!**/*-node.test.ts'],
					browser: {
						enabled: true,
						provider: playwright(),
						headless: true,
						instances: [{ browser: 'chromium' }],
						screenshotFailures: false,
					},
				},
			},
		],
	},
});
