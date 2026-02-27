import { TestPdsServer, type PdsServerOptions } from './pds.ts';
import { TestPlcServer, type PlcServerOptions } from './plc.ts';
import { mockNetworkUtilities } from './utils.ts';

export type NetworkConfig = {
	pds: Partial<PdsServerOptions>;
	plc: Partial<PlcServerOptions>;
};

export class TestNetwork {
	readonly plc: TestPlcServer;
	readonly pds: TestPdsServer;

	constructor(plc: TestPlcServer, pds: TestPdsServer) {
		this.plc = plc;
		this.pds = pds;
	}

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
