import { TestPdsServer, type PdsServerOptions } from './pds.js';
import { TestPlcServer, type PlcServerOptions } from './plc.js';
import { mockNetworkUtilities } from './utils.js';

export type NetworkConfig = {
	pds: Partial<PdsServerOptions>;
	plc: Partial<PlcServerOptions>;
};

export class TestNetwork {
	constructor(
		public readonly plc: TestPlcServer,
		public readonly pds: TestPdsServer,
	) {}

	static async create(cfg: Partial<NetworkConfig>): Promise<TestNetwork> {
		const plc = await TestPlcServer.create(cfg.plc ?? {});
		const pds = await TestPdsServer.create({ didPlcUrl: plc.url, ...cfg.pds });

		mockNetworkUtilities(pds);

		return new TestNetwork(plc, pds);
	}

	async processAll() {
		await this.pds.processAll();
	}

	async close() {
		await Promise.all([this.plc.close(), this.pds.close()]);
	}
}
