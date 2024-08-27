import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { Secp256k1Keypair, randomStr } from '@atproto/crypto';
import * as pds from '@atproto/pds';

import getPort from 'get-port';
import * as ui8 from 'uint8arrays';

import { ADMIN_PASSWORD, JWT_SECRET } from './constants.js';

export interface PdsServerOptions extends Partial<pds.ServerEnvironment> {
	didPlcUrl: string;
}

export interface AdditionalPdsContext {
	dataDirectory: string;
	blobstoreLoc: string;
}

export class TestPdsServer {
	constructor(
		public readonly server: pds.PDS,
		public readonly url: string,
		public readonly port: number,
		public readonly additional: AdditionalPdsContext,
	) {}

	static async create(config: PdsServerOptions): Promise<TestPdsServer> {
		const plcRotationKey = await Secp256k1Keypair.create({ exportable: true });
		const plcRotationPriv = ui8.toString(await plcRotationKey.export(), 'hex');
		const recoveryKey = (await Secp256k1Keypair.create()).did();

		const port = config.port || (await getPort());
		const url = `http://localhost:${port}`;

		const blobstoreLoc = path.join(os.tmpdir(), randomStr(8, 'base32'));
		const dataDirectory = path.join(os.tmpdir(), randomStr(8, 'base32'));

		await fs.mkdir(dataDirectory, { recursive: true });

		const env: pds.ServerEnvironment = {
			devMode: true,
			port,
			dataDirectory: dataDirectory,
			blobstoreDiskLocation: blobstoreLoc,
			recoveryDidKey: recoveryKey,
			adminPassword: ADMIN_PASSWORD,
			jwtSecret: JWT_SECRET,
			serviceHandleDomains: ['.test'],
			bskyAppViewUrl: 'https://appview.invalid',
			bskyAppViewDid: 'did:example:invalid',
			bskyAppViewCdnUrlPattern: 'http://cdn.appview.com/%s/%s/%s',
			modServiceUrl: 'https://moderator.invalid',
			modServiceDid: 'did:example:invalid',
			plcRotationKeyK256PrivateKeyHex: plcRotationPriv,
			inviteRequired: false,
			fetchDisableSsrfProtection: true,
			serviceName: 'Development PDS',
			brandColor: '#ffcb1e',
			errorColor: undefined,
			logoUrl: 'https://uxwing.com/wp-content/themes/uxwing/download/animals-and-birds/bee-icon.png',
			homeUrl: 'https://bsky.social/',
			termsOfServiceUrl: 'https://bsky.social/about/support/tos',
			privacyPolicyUrl: 'https://bsky.social/about/support/privacy-policy',
			supportUrl: 'https://blueskyweb.zendesk.com/hc/en-us',
			...config,
		};

		const cfg = pds.envToCfg(env);
		const secrets = pds.envToSecrets(env);

		const server = await pds.PDS.create(cfg, secrets);

		await server.start();

		return new TestPdsServer(server, url, port, {
			dataDirectory: dataDirectory,
			blobstoreLoc: blobstoreLoc,
		});
	}

	get ctx(): pds.AppContext {
		return this.server.ctx;
	}

	adminAuth(): string {
		return 'Basic ' + ui8.toString(ui8.fromString(`admin:${ADMIN_PASSWORD}`, 'utf8'), 'base64pad');
	}

	adminAuthHeaders() {
		return {
			authorization: this.adminAuth(),
		};
	}

	jwtSecretKey() {
		return pds.createSecretKeyObject(JWT_SECRET);
	}

	async processAll() {
		await this.ctx.backgroundQueue.processAll();
	}

	async close() {
		await this.server.destroy();

		await fs.rm(this.additional.dataDirectory, { recursive: true, force: true });
		await fs.rm(this.additional.blobstoreLoc, { force: true });
	}
}
