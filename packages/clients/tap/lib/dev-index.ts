import { TapClient } from './tap-client.js';

const tap = new TapClient({ url: 'http://localhost:2480' });

const subscription = tap.subscribe({
	onConnectionOpen() {
		console.log(`ws open`);
	},
	onConnectionClose() {
		console.log(`ws close`);
	},
	onConnectionError(ev) {
		console.log(`ws error`, ev);
	},
	onError(err) {
		console.error('tap subscription error', err);
	},
});

for await (const { event, ack } of subscription) {
	console.log(event);

	await ack();
}
