import { readFileSync, writeFileSync } from 'node:fs';

import { exportJwkKey, generatePrivateKey } from '@atcute/oauth-cab/server';

const upsertEnvVar = (input: string, key: string, value: string): string => {
	const line = `${key}=${value}`;
	const re = new RegExp(`^${key}=.*$`, 'm');

	if (re.test(input)) {
		const match = input.match(re);
		const current = match ? match[0].slice(key.length + 1) : '';
		const trimmed = current.trim();

		// only replace if empty
		if (trimmed === '' || trimmed === `''` || trimmed === `""`) {
			return input.replace(re, line);
		}

		return input;
	}

	const suffix = input.endsWith('\n') || input.length === 0 ? '' : '\n';
	return `${input}${suffix}${line}\n`;
};

let devVars = '';
try {
	devVars = readFileSync('.env', 'utf8');
} catch {
	// file doesn't exist, start fresh
}

const privateKey = await generatePrivateKey('main', 'ES256');
const jwk = await exportJwkKey(privateKey);
const jwkJson = JSON.stringify(jwk);

let updated = devVars;
updated = upsertEnvVar(updated, 'PRIVATE_KEY_JWK', jwkJson);
updated = upsertEnvVar(updated, 'PUBLIC_URL', '');

writeFileSync('.env', updated);

console.log('updated .env');
console.log('');
console.log('next steps:');
console.log('  1. set PUBLIC_URL in .env to your tunnel URL (e.g. https://abc123.trycloudflare.com)');
console.log('  2. run `pnpm run cf-typegen` to regenerate types');
console.log('  3. run `pnpm run dev` to start the dev server');
