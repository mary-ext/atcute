import type { BaseSchema, InferOutput, ObjectSchema } from '@atcute/lexicons/validations';

import {
	type EntityDefinition,
	type EntitySubscriber,
	type EntityTypeId,
	type TypeSubscriber,
	getTypeIdFromSchema,
} from './types.ts';
import { WalkerCache } from './walker.ts';

type AnyEntityDefinition = EntityDefinition<ObjectSchema>;

interface EntityStoreEntry {
	definition: AnyEntityDefinition;
	entities: Map<string, WeakRef<object>>;
	subscribers: Map<string, Set<EntitySubscriber<unknown>>>;
	typeSubscribers: Set<TypeSubscriber<unknown>>;
}

export interface NormalizedCacheOptions {
	wrapEntity?: (entity: unknown) => unknown;
}

/** normalized cache store for AT Protocol responses */
export class NormalizedCache {
	#schemaToTypeId = new Map<ObjectSchema, EntityTypeId>();

	#stores = new Map<EntityTypeId, EntityStoreEntry>();
	#wrapEntity: ((entity: unknown) => unknown) | undefined;

	#walkerCache = new WalkerCache({
		isEntityType: (typeId) => this.#stores.has(typeId),
		upsertEntity: (typeId, incoming) => this.#upsertEntity(typeId, incoming),
	});

	#registry = new FinalizationRegistry<{ typeId: EntityTypeId; key: string }>((held) => {
		const store = this.#stores.get(held.typeId);
		if (store) {
			const ref = store.entities.get(held.key);
			// only delete if the ref is actually dead (not replaced with a new one)
			if (ref !== undefined && ref.deref() === undefined) {
				store.entities.delete(held.key);
			}
		}
	});

	constructor(options?: NormalizedCacheOptions) {
		this.#wrapEntity = options?.wrapEntity;
	}

	#getTypeId(schema: ObjectSchema): EntityTypeId | undefined {
		let typeId = this.#schemaToTypeId.get(schema);
		if (typeId === undefined) {
			typeId = getTypeIdFromSchema(schema);
			if (typeId !== undefined) {
				this.#schemaToTypeId.set(schema, typeId);
			}
		}
		return typeId;
	}

	#getStore(schema: ObjectSchema): EntityStoreEntry | undefined {
		const typeId = this.#getTypeId(schema);
		return typeId ? this.#stores.get(typeId) : undefined;
	}

	#notifySubscribers(store: EntityStoreEntry, key: string, entity: object | undefined): void {
		// notify entity-specific subscribers
		const entitySubs = store.subscribers.get(key);
		if (entitySubs) {
			for (const cb of entitySubs) {
				cb(entity);
			}
		}

		// notify type subscribers
		for (const cb of store.typeSubscribers) {
			cb(key, entity);
		}
	}

	#upsertEntity(typeId: EntityTypeId, incoming: object): object {
		const store = this.#stores.get(typeId)!;
		const key = store.definition.key(incoming);

		const existingRef = store.entities.get(key);
		const existing = existingRef?.deref();

		if (existing !== undefined) {
			// merge incoming into existing
			const merge = store.definition.merge;
			const merged = merge ? merge(existing, incoming) : incoming;
			Object.assign(existing, merged);
			this.#notifySubscribers(store, key, existing);
			return existing;
		}

		// new entity - wrap and store it
		// oxlint-disable-next-line typescript/no-explicit-any
		const entity: any = this.#wrapEntity ? this.#wrapEntity(incoming) : incoming;
		store.entities.set(key, new WeakRef(entity));
		this.#registry.register(entity, { typeId, key });
		this.#notifySubscribers(store, key, entity);
		return entity;
	}

	/**
	 * register an entity type for normalization
	 *
	 * @param definition entity definition with schema, key extractor, and optional merge function
	 */
	define<T extends ObjectSchema>(definition: EntityDefinition<T>): void {
		const typeId = getTypeIdFromSchema(definition.schema);
		if (typeId === undefined) {
			throw new Error('schema must have a $type literal field');
		}

		if (this.#stores.has(typeId)) {
			throw new Error(`entity type "${typeId}" is already defined`);
		}

		this.#stores.set(typeId, {
			definition: definition as unknown as AnyEntityDefinition,
			entities: new Map(),
			subscribers: new Map(),
			typeSubscribers: new Set(),
		});

		this.#schemaToTypeId.set(definition.schema, typeId);

		// invalidate cached walkers since entity types changed
		this.#walkerCache.invalidate();
	}

	/**
	 * walk response using schema, normalize and cache entities
	 *
	 * @param schema the response schema
	 * @param data the response data
	 * @returns response with cached entity refs swapped in
	 */
	normalize<T extends BaseSchema>(schema: T, data: InferOutput<T>): InferOutput<T> {
		return this.#walkerCache.getWalker(schema)(data) as InferOutput<T>;
	}

	/**
	 * create a reusable normalizer function for a schema
	 *
	 * @param schema the response schema
	 * @returns function that normalizes data according to schema
	 */
	normalizer<T extends BaseSchema>(schema: T): (data: InferOutput<T>) => InferOutput<T> {
		return (data) => this.normalize(schema, data);
	}

	/**
	 * get entity from cache by schema and key
	 *
	 * @param schema the entity schema
	 * @param key the entity key
	 * @returns the cached entity or undefined if not found/collected
	 */
	get<T extends ObjectSchema>(schema: T, key: string): InferOutput<T> | undefined {
		const store = this.#getStore(schema);
		if (!store) {
			return undefined;
		}

		const ref = store.entities.get(key);
		return ref?.deref() as InferOutput<T> | undefined;
	}

	/**
	 * check if entity exists in cache
	 *
	 * @param schema the entity schema
	 * @param key the entity key
	 */
	has(schema: ObjectSchema, key: string): boolean {
		const store = this.#getStore(schema);
		if (!store) {
			return false;
		}

		const ref = store.entities.get(key);
		return ref?.deref() !== undefined;
	}

	/**
	 * get all cached entities of a type
	 *
	 * @param schema the entity schema
	 * @returns map of key to entity (only includes live refs)
	 */
	getAll<T extends ObjectSchema>(schema: T): Map<string, InferOutput<T>> {
		const store = this.#getStore(schema);
		const result = new Map<string, InferOutput<T>>();

		if (!store) {
			return result;
		}

		for (const [key, ref] of store.entities) {
			const entity = ref.deref();
			if (entity !== undefined) {
				result.set(key, entity as InferOutput<T>);
			}
		}

		return result;
	}

	/**
	 * set entity directly in cache
	 *
	 * @param schema the entity schema
	 * @param key the entity key
	 * @param entity the entity to cache
	 */
	set<T extends ObjectSchema>(schema: T, key: string, entity: InferOutput<T>): void {
		const typeId = this.#getTypeId(schema);
		if (typeId === undefined || !this.#stores.has(typeId)) {
			throw new Error('schema is not registered');
		}

		const store = this.#stores.get(typeId)!;
		const existingRef = store.entities.get(key);
		const existing = existingRef?.deref();

		if (existing !== undefined) {
			Object.assign(existing, entity);
			this.#notifySubscribers(store, key, existing);
		} else {
			// oxlint-disable-next-line typescript/no-explicit-any
			const wrapped: any = this.#wrapEntity ? this.#wrapEntity(entity) : entity;
			store.entities.set(key, new WeakRef(wrapped));
			this.#registry.register(wrapped, { typeId, key });
			this.#notifySubscribers(store, key, wrapped);
		}
	}

	/**
	 * update entity with updater function
	 *
	 * @param schema the entity schema
	 * @param key the entity key
	 * @param updater function that returns updated entity
	 * @returns true if entity was found and updated
	 */
	update<T extends ObjectSchema>(
		schema: T,
		key: string,
		updater: (entity: InferOutput<T>) => InferOutput<T>,
	): boolean {
		const store = this.#getStore(schema);
		if (!store) {
			return false;
		}

		const ref = store.entities.get(key);
		const existing = ref?.deref() as InferOutput<T> | undefined;

		if (existing === undefined) {
			return false;
		}

		const updated = updater(existing);
		Object.assign(existing, updated);
		this.#notifySubscribers(store, key, existing);
		return true;
	}

	/**
	 * delete entity from cache
	 *
	 * @param schema the entity schema
	 * @param key the entity key
	 * @returns true if entity was found and deleted
	 */
	delete(schema: ObjectSchema, key: string): boolean {
		const store = this.#getStore(schema);
		if (!store) {
			return false;
		}

		const existed = store.entities.has(key);
		store.entities.delete(key);

		if (existed) {
			this.#notifySubscribers(store, key, undefined);
		}

		return existed;
	}

	/**
	 * delete all entities of a type
	 *
	 * @param schema the entity schema
	 */
	deleteType(schema: ObjectSchema): void {
		const store = this.#getStore(schema);
		if (!store) {
			return;
		}

		const keys = [...store.entities.keys()];
		store.entities.clear();

		for (const key of keys) {
			this.#notifySubscribers(store, key, undefined);
		}
	}

	/** clear entire cache */
	clear(): void {
		for (const [_typeId, store] of this.#stores) {
			const keys = [...store.entities.keys()];
			store.entities.clear();

			for (const key of keys) {
				this.#notifySubscribers(store, key, undefined);
			}
		}
	}

	/**
	 * subscribe to changes for a specific entity
	 *
	 * @param schema the entity schema
	 * @param key the entity key
	 * @param callback called when entity changes
	 * @returns unsubscribe function
	 */
	subscribe<T extends ObjectSchema>(
		schema: T,
		key: string,
		callback: EntitySubscriber<InferOutput<T>>,
	): () => void {
		const store = this.#getStore(schema);
		if (!store) {
			throw new Error('schema is not registered');
		}

		let subs = store.subscribers.get(key);
		if (!subs) {
			subs = new Set();
			store.subscribers.set(key, subs);
		}

		subs.add(callback as EntitySubscriber<unknown>);

		return () => {
			subs!.delete(callback as EntitySubscriber<unknown>);
			if (subs!.size === 0 && store.subscribers.get(key) === subs) {
				store.subscribers.delete(key);
			}
		};
	}

	/**
	 * subscribe to all changes for an entity type
	 *
	 * @param schema the entity schema
	 * @param callback called when any entity of this type changes
	 * @returns unsubscribe function
	 */
	subscribeType<T extends ObjectSchema>(schema: T, callback: TypeSubscriber<InferOutput<T>>): () => void {
		const store = this.#getStore(schema);
		if (!store) {
			throw new Error('schema is not registered');
		}

		store.typeSubscribers.add(callback as TypeSubscriber<unknown>);

		return () => {
			store.typeSubscribers.delete(callback as TypeSubscriber<unknown>);
		};
	}
}
