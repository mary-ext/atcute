import { encode } from './lib/index';

const record = {
	$type: 'app.bsky.feed.post',
	createdAt: '2024-08-18T03:18:24.000Z',
	langs: ['en'],
	text: 'hello world!',
};

console.log(encode(record));
