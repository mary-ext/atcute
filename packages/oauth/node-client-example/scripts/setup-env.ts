import { existsSync } from 'node:fs';
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { generateClientAssertionKey } from '@atcute/oauth-node-client';

import { nanoid } from 'nanoid';

const ensureEnvLocal = async (): Promise<string> => {
	const envPath = resolve(process.cwd(), '.env');
	const envLocalPath = resolve(process.cwd(), '.env.local');

	if (!existsSync(envLocalPath)) {
		await copyFile(envPath, envLocalPath);
	}

	return envLocalPath;
};

const upsertEnvVar = (input: string, key: string, value: string): string => {
	const line = `${key}=${value}`;
	const re = new RegExp(`^${key}=.*$`, 'm');

	if (re.test(input)) {
		const match = input.match(re);
		const current = match ? match[0].slice(key.length + 1) : '';
		const trimmed = current.trim();

		if (trimmed === '' || trimmed === `''` || trimmed === `""`) {
			return input.replace(re, line);
		}

		return input;
	}

	const suffix = input.endsWith('\n') || input.length === 0 ? '' : '\n';
	return `${input}${suffix}${line}\n`;
};

const envLocalPath = await ensureEnvLocal();
const envLocal = await readFile(envLocalPath, 'utf8');

const jwk = await generateClientAssertionKey('main', 'ES256');
const jwkJson = JSON.stringify(jwk);

const cookieSecret = nanoid(32);

let updated = envLocal;
updated = upsertEnvVar(updated, 'PRIVATE_KEY_JWK', `'${jwkJson}'`);
updated = upsertEnvVar(updated, 'COOKIE_SECRET', cookieSecret);

await writeFile(envLocalPath, updated);

console.log(`updated ${envLocalPath}`);
