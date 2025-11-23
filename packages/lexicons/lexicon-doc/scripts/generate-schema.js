import * as fs from 'node:fs/promises';

import { toJsonSchema } from '@valibot/to-json-schema';

import * as t from '../lib/typedefs.json-schema.ts';

const schema = toJsonSchema(t.lexiconDoc, {
	definitions: {
		LexBoolean: t.lexBoolean,
		LexInteger: t.lexInteger,
		LexStringFormat: t.lexStringFormat,
		LexString: t.lexString,
		LexBytes: t.lexBytes,
		LexCidLink: t.lexCidLink,
		LexBlob: t.lexBlob,
		LexPrimitive: t.lexPrimitive,
		LexConcrete: t.lexConcrete,
		LexToken: t.lexToken,
		LexRef: t.lexRef,
		LexRefUnion: t.lexRefUnion,
		LexUnknown: t.lexUnknown,
		LexRefVariant: t.lexRefVariant,
		LexMeta: t.lexMeta,
		LexDefinableField: t.lexDefinableField,
		LexField: t.lexField,
		LexArray: t.lexArray,
		LexPrimitiveArray: t.lexPrimitiveArray,
		LexObject: t.lexObject,
		LexContainer: t.lexContainer,
		LexXrpcBody: t.lexXrpcBody,
		LexXrpcSubscriptionMessage: t.lexXrpcSubscriptionMessage,
		LexXrpcError: t.lexXrpcError,
		LexLang: t.lexLang,
		LexXrpcParameters: t.lexXrpcParameters,
		LexPermission: t.lexPermission,
		LexRecord: t.lexRecord,
		LexXrpcQuery: t.lexXrpcQuery,
		LexXrpcProcedure: t.lexXrpcProcedure,
		LexXrpcSubscription: t.lexXrpcSubscription,
		LexPermissionSet: t.lexPermissionSet,
		LexPrimary: t.lexPrimary,
		LexUserType: t.lexUserType,
		LexiconDoc: t.lexiconDoc,
	},
});

await fs.mkdir('schema/', { recursive: true });
await fs.writeFile('schema/lexicon-doc.schema.json', JSON.stringify(schema, null, 2) + '\n');
