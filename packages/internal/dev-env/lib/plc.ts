import { AppContext, Database, PlcServer } from '@did-plc/server';

import getPort from 'get-port';

export interface PlcServerOptions {
	port?: number;
}

export class TestPlcServer {
	constructor(
		public readonly server: PlcServer,
		public readonly url: string,
		public readonly port: number,
	) {}

	static async create(cfg: PlcServerOptions = {}): Promise<TestPlcServer> {
		const port = cfg.port ?? (await getPort());
		const url = `http://localhost:${port}`;

		const db = Database.mock();
		const server = PlcServer.create({ db, port });

		await server.start();

		return new TestPlcServer(server, url, port);
	}

	get context(): AppContext {
		return this.server.ctx;
	}

	async close() {
		await this.server.destroy();
	}
}
