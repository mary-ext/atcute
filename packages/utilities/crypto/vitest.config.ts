import { defineConfig } from 'vitest/config';

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
						provider: 'playwright',
						headless: true,
						instances: [{ browser: 'chromium' }, { browser: 'firefox' }],
						screenshotFailures: false,
					},
				},
			},
		],
	},
});
