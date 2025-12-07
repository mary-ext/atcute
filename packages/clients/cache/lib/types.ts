import type { BaseSchema, InferOutput, ObjectSchema } from '@atcute/lexicons/validations';

import { isLiteralSchema, isOptionalSchema } from './predicates.js';

/** entity type identifier, extracted from schema's $type literal */
export type EntityTypeId = string;

/**
 * definition for an entity type that can be normalized
 * @template T the object schema type
 */
export interface EntityDefinition<T extends ObjectSchema = ObjectSchema> {
	/** the schema for this entity type */
	schema: T;
	/** extract cache key from entity instance */
	key: (entity: InferOutput<T>) => string;
	/**
	 * merge strategy when entity already exists in cache
	 * @param existing the currently cached entity
	 * @param incoming the new entity data
	 * @returns partial entity with fields to update
	 */
	merge?: (existing: InferOutput<T>, incoming: InferOutput<T>) => Partial<InferOutput<T>>;
}

/** subscriber callback type */
export type EntitySubscriber<T> = (entity: T | undefined) => void;

/** type-level subscriber callback */
export type TypeSubscriber<T> = (key: string, entity: T | undefined) => void;

/**
 * extract the $type literal value from an object schema
 * @param schema object schema with $type field
 * @returns the $type string value or undefined
 */
export const getTypeIdFromSchema = (schema: ObjectSchema): EntityTypeId | undefined => {
	const shape = schema.shape;
	let typeField: BaseSchema | undefined = shape.$type;

	if (typeField === undefined) {
		return undefined;
	}

	// unwrap optional
	if (isOptionalSchema(typeField)) {
		typeField = typeField.wrapped;
	}

	if (isLiteralSchema(typeField) && typeof typeField.expected === 'string') {
		return typeField.expected;
	}

	return undefined;
};
