import { describe, expect, it } from 'vitest';

import { didDocument } from './typedefs.js';
import {
	getAtprotoLabelerVerificationMaterial,
	getAtprotoVerificationMaterial,
	getLabelerEndpoint,
	getPdsEndpoint,
} from './utils.js';

const PRONOUNS_LABELER_DID_DOC = didDocument.parse({
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

describe('getAtprotoServiceEndpoint', () => {
	it('grabs a PDS', () => {
		expect(getPdsEndpoint(PRONOUNS_LABELER_DID_DOC)).toBe('https://pds.bsky.mom');
	});

	it('grabs a labeler', () => {
		expect(getLabelerEndpoint(PRONOUNS_LABELER_DID_DOC)).toBe('https://api.pronouns.diy');
	});
});

describe('getVerificationMaterial', () => {
	it('grabs PDS signing keys', () => {
		expect(getAtprotoVerificationMaterial(PRONOUNS_LABELER_DID_DOC)).toEqual({
			type: 'Multikey',
			publicKeyMultibase: 'zQ3sho8kubdqeS5wbxPDpNBBqg2tvJTKF1jovJKzQzhu4S8fH',
		});
	});

	it('grabs labeler signing keys', () => {
		expect(getAtprotoLabelerVerificationMaterial(PRONOUNS_LABELER_DID_DOC)).toEqual({
			type: 'Multikey',
			publicKeyMultibase: 'zQ3shQo2ZK9ZwNRxkEM1sSkpJKfx1NN6WWcvtMTDyJeCwPB7o',
		});
	});
});
