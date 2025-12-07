import type { BaseSchema, ObjectSchema, VariantSchema } from '@atcute/lexicons/validations';

import {
	isArraySchema,
	isNullableSchema,
	isObjectSchema,
	isOptionalSchema,
	isVariantSchema,
} from './predicates.js';
import type { EntityTypeId } from './types.js';
import { getTypeIdFromSchema } from './types.js';

/**
 * compiled walk function for a schema
 * @param data input data to walk
 * @returns walked data with entities swapped in
 */
export type WalkFn = (data: unknown) => unknown;

/** identity walker - returns data unchanged */
const identity: WalkFn = (data) => data;

/**
 * context for building and executing schema walkers
 */
export interface WalkerContext {
	/** check if a type ID is a registered entity */
	isEntityType: (typeId: EntityTypeId) => boolean;
	/** upsert entity into cache, returns the cached entity */
	upsertEntity: (typeId: EntityTypeId, incoming: object) => object;
}

/**
 * walker cache that tracks schema -> compiled walker mappings
 * invalidated when entity definitions change
 */
export class WalkerCache {
	#ctx: WalkerContext;
	#cache = new WeakMap<BaseSchema, WalkFn>();

	constructor(ctx: WalkerContext) {
		this.#ctx = ctx;
	}

	/** clear all cached walkers */
	invalidate(): void {
		this.#cache = new WeakMap<BaseSchema, WalkFn>();
	}

	/**
	 * get or build a walker for a schema
	 * @param schema schema to get walker for
	 * @returns walk function
	 */
	getWalker(schema: BaseSchema): WalkFn {
		return this.#build(schema);
	}

	#build(schema: BaseSchema): WalkFn {
		const cached = this.#cache.get(schema);
		if (cached !== undefined) {
			return cached;
		}

		// set thunk for cycle detection - will be replaced with actual walker
		this.#cache.set(schema, (data) => this.#cache.get(schema)!(data));

		const walker = this.#buildForSchema(schema);

		this.#cache.set(schema, walker);

		return walker;
	}

	#buildForSchema(schema: BaseSchema): WalkFn {
		if (isObjectSchema(schema)) {
			return this.#buildObjectWalker(schema);
		}

		if (isArraySchema(schema)) {
			return this.#buildArrayWalker(schema);
		}

		if (isVariantSchema(schema)) {
			return this.#buildVariantWalker(schema);
		}

		if (isOptionalSchema(schema)) {
			const innerWalker = this.#build(schema.wrapped);
			if (innerWalker === identity) {
				return identity;
			}

			return (data) => (data === undefined ? data : innerWalker(data));
		}

		if (isNullableSchema(schema)) {
			const innerWalker = this.#build(schema.wrapped);
			if (innerWalker === identity) {
				return identity;
			}

			return (data) => (data === null ? data : innerWalker(data));
		}

		// primitive types - no walking needed
		return identity;
	}

	#buildObjectWalker(schema: ObjectSchema): WalkFn {
		const ctx = this.#ctx;

		// check if this is a registered entity type
		const typeId = getTypeIdFromSchema(schema);
		const entityTypeId = typeId !== undefined && ctx.isEntityType(typeId) ? typeId : undefined;

		// build walkers for properties that need walking
		const shape = schema.shape;
		let propWalkers: [string, WalkFn][] | undefined = [];

		for (const propName in shape) {
			const propSchema = shape[propName];
			const propWalker = this.#build(propSchema);

			if (propWalker !== identity) {
				propWalkers.push([propName, propWalker]);
			}
		}

		if (propWalkers.length === 0) {
			propWalkers = undefined;
		}

		// nothing to do
		if (entityTypeId === undefined && propWalkers === undefined) {
			return identity;
		}

		return (data) => {
			// if entity, upsert to get cached reference (mutate in place)
			// if not entity, clone on first property change
			let entity = data as Record<string, unknown>;
			let cloned = entityTypeId !== undefined;

			if (entityTypeId !== undefined) {
				entity = ctx.upsertEntity(entityTypeId, entity) as Record<string, unknown>;
			}

			if (propWalkers !== undefined) {
				for (const [name, walk] of propWalkers) {
					const propValue = entity[name];
					const walked = walk(propValue);

					if (walked !== propValue) {
						if (entityTypeId === undefined && !cloned) {
							entity = { ...entity };
							cloned = true;
						}

						entity[name] = walked;
					}
				}
			}

			return entity;
		};
	}

	#buildArrayWalker(schema: { item: BaseSchema }): WalkFn {
		const itemWalker = this.#build(schema.item);

		if (itemWalker === identity) {
			return identity;
		}

		return (data) => {
			const prev = data as unknown[];
			let next: unknown[] | undefined;

			for (let i = 0; i < prev.length; i++) {
				const item = prev[i];
				const walked = itemWalker(item);

				if (walked !== item) {
					if (next === undefined) {
						next = prev.slice(0, i);
					}
					next.push(walked);
				} else if (next !== undefined) {
					next.push(walked);
				}
			}

			return next ?? prev;
		};
	}

	#buildVariantWalker(schema: VariantSchema): WalkFn {
		// build a map of type ID -> walker for members that need walking
		const walkerMap: Record<string, WalkFn> = Object.create(null);
		let hasWalkers = false;

		for (const member of schema.members) {
			const memberSchema = member as ObjectSchema;
			const memberTypeId = getTypeIdFromSchema(memberSchema);

			if (memberTypeId !== undefined) {
				const memberWalker = this.#build(memberSchema);

				if (memberWalker !== identity) {
					walkerMap[memberTypeId] = memberWalker;
					hasWalkers = true;
				}
			}
		}

		if (!hasWalkers) {
			return identity;
		}

		return (data) => {
			const obj = data as Record<string, unknown>;
			const type = obj.$type as string | undefined;

			if (type === undefined) {
				return data;
			}

			const memberWalker = walkerMap[type];
			return memberWalker ? memberWalker(data) : data;
		};
	}
}
