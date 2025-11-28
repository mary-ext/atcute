import { describe, expect, it } from 'vitest';

import { didDocument } from './typedefs.js';

describe('didDocument', () => {
	it('parses a did:plc document', () => {
		const doc = didDocument.parse({
			'@context': [
				'https://www.w3.org/ns/did/v1',
				'https://w3id.org/security/multikey/v1',
				'https://w3id.org/security/suites/secp256k1-2019/v1',
			],
			id: 'did:plc:ia76kvnndjutgedggx2ibrem',
			alsoKnownAs: ['at://mary.my.id'],
			verificationMethod: [
				{
					id: 'did:plc:ia76kvnndjutgedggx2ibrem#atproto',
					type: 'Multikey',
					controller: 'did:plc:ia76kvnndjutgedggx2ibrem',
					publicKeyMultibase: 'zQ3shuqiNQXNGKBBbNvPhcaZy8DjP3BF3yhmSeAjFXQjgPJrG',
				},
			],
			service: [
				{
					id: '#atproto_pds',
					type: 'AtprotoPersonalDataServer',
					serviceEndpoint: 'https://porcini.us-east.host.bsky.network',
				},
			],
		});

		expect(doc).toEqual({
			'@context': [
				'https://www.w3.org/ns/did/v1',
				'https://w3id.org/security/multikey/v1',
				'https://w3id.org/security/suites/secp256k1-2019/v1',
			],
			alsoKnownAs: ['at://mary.my.id'],
			id: 'did:plc:ia76kvnndjutgedggx2ibrem',
			service: [
				{
					id: '#atproto_pds',
					serviceEndpoint: 'https://porcini.us-east.host.bsky.network',
					type: 'AtprotoPersonalDataServer',
				},
			],
			verificationMethod: [
				{
					controller: 'did:plc:ia76kvnndjutgedggx2ibrem',
					id: 'did:plc:ia76kvnndjutgedggx2ibrem#atproto',
					publicKeyMultibase: 'zQ3shuqiNQXNGKBBbNvPhcaZy8DjP3BF3yhmSeAjFXQjgPJrG',
					type: 'Multikey',
				},
			],
		});
	});

	it('parses a did:plc document containing a labeler', () => {
		const doc = didDocument.parse({
			'@context': [
				'https://www.w3.org/ns/did/v1',
				'https://w3id.org/security/multikey/v1',
				'https://w3id.org/security/suites/secp256k1-2019/v1',
			],
			id: 'did:plc:wkoofae5uytcm7bjncmev6n6',
			alsoKnownAs: ['at://pronouns.diy'],
			verificationMethod: [
				{
					id: 'did:plc:wkoofae5uytcm7bjncmev6n6#atproto',
					type: 'Multikey',
					controller: 'did:plc:wkoofae5uytcm7bjncmev6n6',
					publicKeyMultibase: 'zQ3sho8kubdqeS5wbxPDpNBBqg2tvJTKF1jovJKzQzhu4S8fH',
				},
				{
					id: 'did:plc:wkoofae5uytcm7bjncmev6n6#atproto_label',
					type: 'Multikey',
					controller: 'did:plc:wkoofae5uytcm7bjncmev6n6',
					publicKeyMultibase: 'zQ3shQo2ZK9ZwNRxkEM1sSkpJKfx1NN6WWcvtMTDyJeCwPB7o',
				},
			],
			service: [
				{
					id: '#atproto_pds',
					type: 'AtprotoPersonalDataServer',
					serviceEndpoint: 'https://pds.bsky.mom',
				},
				{
					id: '#atproto_labeler',
					type: 'AtprotoLabeler',
					serviceEndpoint: 'https://api.pronouns.diy',
				},
			],
		});

		expect(doc).toEqual({
			'@context': [
				'https://www.w3.org/ns/did/v1',
				'https://w3id.org/security/multikey/v1',
				'https://w3id.org/security/suites/secp256k1-2019/v1',
			],
			alsoKnownAs: ['at://pronouns.diy'],
			id: 'did:plc:wkoofae5uytcm7bjncmev6n6',
			service: [
				{
					id: '#atproto_pds',
					serviceEndpoint: 'https://pds.bsky.mom',
					type: 'AtprotoPersonalDataServer',
				},
				{
					id: '#atproto_labeler',
					serviceEndpoint: 'https://api.pronouns.diy',
					type: 'AtprotoLabeler',
				},
			],
			verificationMethod: [
				{
					controller: 'did:plc:wkoofae5uytcm7bjncmev6n6',
					id: 'did:plc:wkoofae5uytcm7bjncmev6n6#atproto',
					publicKeyMultibase: 'zQ3sho8kubdqeS5wbxPDpNBBqg2tvJTKF1jovJKzQzhu4S8fH',
					type: 'Multikey',
				},
				{
					controller: 'did:plc:wkoofae5uytcm7bjncmev6n6',
					id: 'did:plc:wkoofae5uytcm7bjncmev6n6#atproto_label',
					publicKeyMultibase: 'zQ3shQo2ZK9ZwNRxkEM1sSkpJKfx1NN6WWcvtMTDyJeCwPB7o',
					type: 'Multikey',
				},
			],
		});
	});

	it('parses a did:web document', () => {
		const doc = didDocument.parse({
			'@context': [
				'https://www.w3.org/ns/did/v1',
				'https://w3id.org/security/multikey/v1',
				'https://w3id.org/security/suites/secp256k1-2019/v1',
			],
			id: 'did:web:didd.uk',
			alsoKnownAs: [
				'at://didd.uk',
				'did:plc:kv7sv4lynbv5s6gdhn5r5vcw',
				'web+ap://bsky.brid.gy/@ducky.ws',
				'web+ap://fedia.social/@theducky',
				'https://t.me/theducky',
			],
			verificationMethod: [
				{
					id: 'did:web:didd.uk#atproto',
					type: 'Multikey',
					controller: 'did:web:didd.uk',
					publicKeyMultibase: 'zQ3shYRepkfnXhDjKBmvBVNtu2tswxPjjTDgKWTUcuFdt7xtH',
				},
			],
			service: [
				{
					id: '#atproto_pds',
					type: 'AtprotoPersonalDataServer',
					serviceEndpoint: 'https://zio.blue',
				},
			],
		});

		expect(doc).toEqual({
			'@context': [
				'https://www.w3.org/ns/did/v1',
				'https://w3id.org/security/multikey/v1',
				'https://w3id.org/security/suites/secp256k1-2019/v1',
			],
			alsoKnownAs: [
				'at://didd.uk',
				'did:plc:kv7sv4lynbv5s6gdhn5r5vcw',
				'web+ap://bsky.brid.gy/@ducky.ws',
				'web+ap://fedia.social/@theducky',
				'https://t.me/theducky',
			],
			id: 'did:web:didd.uk',
			service: [
				{
					id: '#atproto_pds',
					serviceEndpoint: 'https://zio.blue',
					type: 'AtprotoPersonalDataServer',
				},
			],
			verificationMethod: [
				{
					controller: 'did:web:didd.uk',
					id: 'did:web:didd.uk#atproto',
					publicKeyMultibase: 'zQ3shYRepkfnXhDjKBmvBVNtu2tswxPjjTDgKWTUcuFdt7xtH',
					type: 'Multikey',
				},
			],
		});
	});
});
