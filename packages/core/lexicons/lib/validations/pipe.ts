import {
	FLAG_ABORT_EARLY,
	joinIssues,
	type BaseSchema,
	type BaseConstraint,
	type InferOutput,
	type SchemaWithPipe,
} from './base.js';

export function pipe<
	const TSchema extends BaseSchema<unknown, unknown>,
	const TItem1 extends BaseConstraint<InferOutput<TSchema>, unknown>,
>(
	schema: TSchema,
	item1: TItem1 | BaseConstraint<InferOutput<TSchema>, InferOutput<TItem1>>,
): SchemaWithPipe<readonly [TSchema, TItem1]>;

export function pipe<
	const TSchema extends BaseSchema<unknown, unknown>,
	const TItem1 extends BaseConstraint<InferOutput<TSchema>, unknown>,
	const TItem2 extends BaseConstraint<InferOutput<TItem1>, unknown>,
>(
	schema: TSchema,
	item1: TItem1 | BaseConstraint<InferOutput<TSchema>, InferOutput<TItem1>>,
	item2: TItem2 | BaseConstraint<InferOutput<TItem1>, InferOutput<TItem2>>,
): SchemaWithPipe<readonly [TSchema, TItem1, TItem2]>;

export function pipe<
	const TSchema extends BaseSchema<unknown, unknown>,
	const TItem1 extends BaseConstraint<InferOutput<TSchema>, unknown>,
	const TItem2 extends BaseConstraint<InferOutput<TItem1>, unknown>,
	const TItem3 extends BaseConstraint<InferOutput<TItem2>, unknown>,
>(
	schema: TSchema,
	item1: TItem1 | BaseConstraint<InferOutput<TSchema>, InferOutput<TItem1>>,
	item2: TItem2 | BaseConstraint<InferOutput<TItem1>, InferOutput<TItem2>>,
	item3: TItem3 | BaseConstraint<InferOutput<TItem2>, InferOutput<TItem3>>,
): SchemaWithPipe<readonly [TSchema, TItem1, TItem2, TItem3]>;

export function pipe<
	const TSchema extends BaseSchema<unknown, unknown>,
	const TItem1 extends BaseConstraint<InferOutput<TSchema>, unknown>,
	const TItem2 extends BaseConstraint<InferOutput<TItem1>, unknown>,
	const TItem3 extends BaseConstraint<InferOutput<TItem2>, unknown>,
	const TItem4 extends BaseConstraint<InferOutput<TItem3>, unknown>,
>(
	schema: TSchema,
	item1: TItem1 | BaseConstraint<InferOutput<TSchema>, InferOutput<TItem1>>,
	item2: TItem2 | BaseConstraint<InferOutput<TItem1>, InferOutput<TItem2>>,
	item3: TItem3 | BaseConstraint<InferOutput<TItem2>, InferOutput<TItem3>>,
	item4: TItem4 | BaseConstraint<InferOutput<TItem3>, InferOutput<TItem4>>,
): SchemaWithPipe<readonly [TSchema, TItem1, TItem2, TItem3, TItem4]>;

export function pipe<
	const TSchema extends BaseSchema<unknown, unknown>,
	const TItem1 extends BaseConstraint<InferOutput<TSchema>, unknown>,
	const TItem2 extends BaseConstraint<InferOutput<TItem1>, unknown>,
	const TItem3 extends BaseConstraint<InferOutput<TItem2>, unknown>,
	const TItem4 extends BaseConstraint<InferOutput<TItem3>, unknown>,
	const TItem5 extends BaseConstraint<InferOutput<TItem4>, unknown>,
>(
	schema: TSchema,
	item1: TItem1 | BaseConstraint<InferOutput<TSchema>, InferOutput<TItem1>>,
	item2: TItem2 | BaseConstraint<InferOutput<TItem1>, InferOutput<TItem2>>,
	item3: TItem3 | BaseConstraint<InferOutput<TItem2>, InferOutput<TItem3>>,
	item4: TItem4 | BaseConstraint<InferOutput<TItem3>, InferOutput<TItem4>>,
	item5: TItem5 | BaseConstraint<InferOutput<TItem4>, InferOutput<TItem5>>,
): SchemaWithPipe<readonly [TSchema, TItem1, TItem2, TItem3, TItem4, TItem5]>;

export function pipe<
	const TSchema extends BaseSchema<unknown, unknown>,
	const TItem1 extends BaseConstraint<InferOutput<TSchema>, unknown>,
	const TItem2 extends BaseConstraint<InferOutput<TItem1>, unknown>,
	const TItem3 extends BaseConstraint<InferOutput<TItem2>, unknown>,
	const TItem4 extends BaseConstraint<InferOutput<TItem3>, unknown>,
	const TItem5 extends BaseConstraint<InferOutput<TItem4>, unknown>,
	const TItem6 extends BaseConstraint<InferOutput<TItem5>, unknown>,
>(
	schema: TSchema,
	item1: TItem1 | BaseConstraint<InferOutput<TSchema>, InferOutput<TItem1>>,
	item2: TItem2 | BaseConstraint<InferOutput<TItem1>, InferOutput<TItem2>>,
	item3: TItem3 | BaseConstraint<InferOutput<TItem2>, InferOutput<TItem3>>,
	item4: TItem4 | BaseConstraint<InferOutput<TItem3>, InferOutput<TItem4>>,
	item5: TItem5 | BaseConstraint<InferOutput<TItem4>, InferOutput<TItem5>>,
	item6: TItem6 | BaseConstraint<InferOutput<TItem5>, InferOutput<TItem6>>,
): SchemaWithPipe<readonly [TSchema, TItem1, TItem2, TItem3, TItem4, TItem5, TItem6]>;

export function pipe<
	const TSchema extends BaseSchema<unknown, unknown>,
	const TItem1 extends BaseConstraint<InferOutput<TSchema>, unknown>,
	const TItem2 extends BaseConstraint<InferOutput<TItem1>, unknown>,
	const TItem3 extends BaseConstraint<InferOutput<TItem2>, unknown>,
	const TItem4 extends BaseConstraint<InferOutput<TItem3>, unknown>,
	const TItem5 extends BaseConstraint<InferOutput<TItem4>, unknown>,
	const TItem6 extends BaseConstraint<InferOutput<TItem5>, unknown>,
	const TItem7 extends BaseConstraint<InferOutput<TItem6>, unknown>,
>(
	schema: TSchema,
	item1: TItem1 | BaseConstraint<InferOutput<TSchema>, InferOutput<TItem1>>,
	item2: TItem2 | BaseConstraint<InferOutput<TItem1>, InferOutput<TItem2>>,
	item3: TItem3 | BaseConstraint<InferOutput<TItem2>, InferOutput<TItem3>>,
	item4: TItem4 | BaseConstraint<InferOutput<TItem3>, InferOutput<TItem4>>,
	item5: TItem5 | BaseConstraint<InferOutput<TItem4>, InferOutput<TItem5>>,
	item6: TItem6 | BaseConstraint<InferOutput<TItem5>, InferOutput<TItem6>>,
	item7: TItem7 | BaseConstraint<InferOutput<TItem6>, InferOutput<TItem7>>,
): SchemaWithPipe<readonly [TSchema, TItem1, TItem2, TItem3, TItem4, TItem5, TItem6, TItem7]>;

export function pipe<
	const TSchema extends BaseSchema<unknown, unknown>,
	const TItem1 extends BaseConstraint<InferOutput<TSchema>, unknown>,
	const TItem2 extends BaseConstraint<InferOutput<TItem1>, unknown>,
	const TItem3 extends BaseConstraint<InferOutput<TItem2>, unknown>,
	const TItem4 extends BaseConstraint<InferOutput<TItem3>, unknown>,
	const TItem5 extends BaseConstraint<InferOutput<TItem4>, unknown>,
	const TItem6 extends BaseConstraint<InferOutput<TItem5>, unknown>,
	const TItem7 extends BaseConstraint<InferOutput<TItem6>, unknown>,
	const TItem8 extends BaseConstraint<InferOutput<TItem7>, unknown>,
>(
	schema: TSchema,
	item1: TItem1 | BaseConstraint<InferOutput<TSchema>, InferOutput<TItem1>>,
	item2: TItem2 | BaseConstraint<InferOutput<TItem1>, InferOutput<TItem2>>,
	item3: TItem3 | BaseConstraint<InferOutput<TItem2>, InferOutput<TItem3>>,
	item4: TItem4 | BaseConstraint<InferOutput<TItem3>, InferOutput<TItem4>>,
	item5: TItem5 | BaseConstraint<InferOutput<TItem4>, InferOutput<TItem5>>,
	item6: TItem6 | BaseConstraint<InferOutput<TItem5>, InferOutput<TItem6>>,
	item7: TItem7 | BaseConstraint<InferOutput<TItem6>, InferOutput<TItem7>>,
	item8: TItem8 | BaseConstraint<InferOutput<TItem7>, InferOutput<TItem8>>,
): SchemaWithPipe<readonly [TSchema, TItem1, TItem2, TItem3, TItem4, TItem5, TItem6, TItem7, TItem8]>;

export function pipe<
	const TSchema extends BaseSchema<unknown, unknown>,
	const TItem1 extends BaseConstraint<InferOutput<TSchema>, unknown>,
	const TItem2 extends BaseConstraint<InferOutput<TItem1>, unknown>,
	const TItem3 extends BaseConstraint<InferOutput<TItem2>, unknown>,
	const TItem4 extends BaseConstraint<InferOutput<TItem3>, unknown>,
	const TItem5 extends BaseConstraint<InferOutput<TItem4>, unknown>,
	const TItem6 extends BaseConstraint<InferOutput<TItem5>, unknown>,
	const TItem7 extends BaseConstraint<InferOutput<TItem6>, unknown>,
	const TItem8 extends BaseConstraint<InferOutput<TItem7>, unknown>,
	const TItem9 extends BaseConstraint<InferOutput<TItem8>, unknown>,
>(
	schema: TSchema,
	item1: TItem1 | BaseConstraint<InferOutput<TSchema>, InferOutput<TItem1>>,
	item2: TItem2 | BaseConstraint<InferOutput<TItem1>, InferOutput<TItem2>>,
	item3: TItem3 | BaseConstraint<InferOutput<TItem2>, InferOutput<TItem3>>,
	item4: TItem4 | BaseConstraint<InferOutput<TItem3>, InferOutput<TItem4>>,
	item5: TItem5 | BaseConstraint<InferOutput<TItem4>, InferOutput<TItem5>>,
	item6: TItem6 | BaseConstraint<InferOutput<TItem5>, InferOutput<TItem6>>,
	item7: TItem7 | BaseConstraint<InferOutput<TItem6>, InferOutput<TItem7>>,
	item8: TItem8 | BaseConstraint<InferOutput<TItem7>, InferOutput<TItem8>>,
	item9: TItem9 | BaseConstraint<InferOutput<TItem8>, InferOutput<TItem9>>,
): SchemaWithPipe<readonly [TSchema, TItem1, TItem2, TItem3, TItem4, TItem5, TItem6, TItem7, TItem8, TItem9]>;

export function pipe<
	const TSchema extends BaseSchema<unknown, unknown>,
	const TItem1 extends BaseConstraint<InferOutput<TSchema>, unknown>,
	const TItem2 extends BaseConstraint<InferOutput<TItem1>, unknown>,
	const TItem3 extends BaseConstraint<InferOutput<TItem2>, unknown>,
	const TItem4 extends BaseConstraint<InferOutput<TItem3>, unknown>,
	const TItem5 extends BaseConstraint<InferOutput<TItem4>, unknown>,
	const TItem6 extends BaseConstraint<InferOutput<TItem5>, unknown>,
	const TItem7 extends BaseConstraint<InferOutput<TItem6>, unknown>,
	const TItem8 extends BaseConstraint<InferOutput<TItem7>, unknown>,
	const TItem9 extends BaseConstraint<InferOutput<TItem8>, unknown>,
	const TItem10 extends BaseConstraint<InferOutput<TItem9>, unknown>,
>(
	schema: TSchema,
	item1: TItem1 | BaseConstraint<InferOutput<TSchema>, InferOutput<TItem1>>,
	item2: TItem2 | BaseConstraint<InferOutput<TItem1>, InferOutput<TItem2>>,
	item3: TItem3 | BaseConstraint<InferOutput<TItem2>, InferOutput<TItem3>>,
	item4: TItem4 | BaseConstraint<InferOutput<TItem3>, InferOutput<TItem4>>,
	item5: TItem5 | BaseConstraint<InferOutput<TItem4>, InferOutput<TItem5>>,
	item6: TItem6 | BaseConstraint<InferOutput<TItem5>, InferOutput<TItem6>>,
	item7: TItem7 | BaseConstraint<InferOutput<TItem6>, InferOutput<TItem7>>,
	item8: TItem8 | BaseConstraint<InferOutput<TItem7>, InferOutput<TItem8>>,
	item9: TItem9 | BaseConstraint<InferOutput<TItem8>, InferOutput<TItem9>>,
	item10: TItem10 | BaseConstraint<InferOutput<TItem9>, InferOutput<TItem10>>,
): SchemaWithPipe<
	readonly [TSchema, TItem1, TItem2, TItem3, TItem4, TItem5, TItem6, TItem7, TItem8, TItem9, TItem10]
>;

export function pipe<
	const TSchema extends BaseSchema<unknown, unknown>,
	const TItem1 extends BaseConstraint<InferOutput<TSchema>, unknown>,
	const TItem2 extends BaseConstraint<InferOutput<TItem1>, unknown>,
	const TItem3 extends BaseConstraint<InferOutput<TItem2>, unknown>,
	const TItem4 extends BaseConstraint<InferOutput<TItem3>, unknown>,
	const TItem5 extends BaseConstraint<InferOutput<TItem4>, unknown>,
	const TItem6 extends BaseConstraint<InferOutput<TItem5>, unknown>,
	const TItem7 extends BaseConstraint<InferOutput<TItem6>, unknown>,
	const TItem8 extends BaseConstraint<InferOutput<TItem7>, unknown>,
	const TItem9 extends BaseConstraint<InferOutput<TItem8>, unknown>,
	const TItem10 extends BaseConstraint<InferOutput<TItem9>, unknown>,
	const TItem11 extends BaseConstraint<InferOutput<TItem10>, unknown>,
>(
	schema: TSchema,
	item1: TItem1 | BaseConstraint<InferOutput<TSchema>, InferOutput<TItem1>>,
	item2: TItem2 | BaseConstraint<InferOutput<TItem1>, InferOutput<TItem2>>,
	item3: TItem3 | BaseConstraint<InferOutput<TItem2>, InferOutput<TItem3>>,
	item4: TItem4 | BaseConstraint<InferOutput<TItem3>, InferOutput<TItem4>>,
	item5: TItem5 | BaseConstraint<InferOutput<TItem4>, InferOutput<TItem5>>,
	item6: TItem6 | BaseConstraint<InferOutput<TItem5>, InferOutput<TItem6>>,
	item7: TItem7 | BaseConstraint<InferOutput<TItem6>, InferOutput<TItem7>>,
	item8: TItem8 | BaseConstraint<InferOutput<TItem7>, InferOutput<TItem8>>,
	item9: TItem9 | BaseConstraint<InferOutput<TItem8>, InferOutput<TItem9>>,
	item10: TItem10 | BaseConstraint<InferOutput<TItem9>, InferOutput<TItem10>>,
	item11: TItem11 | BaseConstraint<InferOutput<TItem10>, InferOutput<TItem11>>,
): SchemaWithPipe<
	readonly [TSchema, TItem1, TItem2, TItem3, TItem4, TItem5, TItem6, TItem7, TItem8, TItem9, TItem10, TItem11]
>;

export function pipe<
	const TSchema extends BaseSchema<unknown, unknown>,
	const TItem1 extends BaseConstraint<InferOutput<TSchema>, unknown>,
	const TItem2 extends BaseConstraint<InferOutput<TItem1>, unknown>,
	const TItem3 extends BaseConstraint<InferOutput<TItem2>, unknown>,
	const TItem4 extends BaseConstraint<InferOutput<TItem3>, unknown>,
	const TItem5 extends BaseConstraint<InferOutput<TItem4>, unknown>,
	const TItem6 extends BaseConstraint<InferOutput<TItem5>, unknown>,
	const TItem7 extends BaseConstraint<InferOutput<TItem6>, unknown>,
	const TItem8 extends BaseConstraint<InferOutput<TItem7>, unknown>,
	const TItem9 extends BaseConstraint<InferOutput<TItem8>, unknown>,
	const TItem10 extends BaseConstraint<InferOutput<TItem9>, unknown>,
	const TItem11 extends BaseConstraint<InferOutput<TItem10>, unknown>,
	const TItem12 extends BaseConstraint<InferOutput<TItem11>, unknown>,
>(
	schema: TSchema,
	item1: TItem1 | BaseConstraint<InferOutput<TSchema>, InferOutput<TItem1>>,
	item2: TItem2 | BaseConstraint<InferOutput<TItem1>, InferOutput<TItem2>>,
	item3: TItem3 | BaseConstraint<InferOutput<TItem2>, InferOutput<TItem3>>,
	item4: TItem4 | BaseConstraint<InferOutput<TItem3>, InferOutput<TItem4>>,
	item5: TItem5 | BaseConstraint<InferOutput<TItem4>, InferOutput<TItem5>>,
	item6: TItem6 | BaseConstraint<InferOutput<TItem5>, InferOutput<TItem6>>,
	item7: TItem7 | BaseConstraint<InferOutput<TItem6>, InferOutput<TItem7>>,
	item8: TItem8 | BaseConstraint<InferOutput<TItem7>, InferOutput<TItem8>>,
	item9: TItem9 | BaseConstraint<InferOutput<TItem8>, InferOutput<TItem9>>,
	item10: TItem10 | BaseConstraint<InferOutput<TItem9>, InferOutput<TItem10>>,
	item11: TItem11 | BaseConstraint<InferOutput<TItem10>, InferOutput<TItem11>>,
	item12: TItem12 | BaseConstraint<InferOutput<TItem11>, InferOutput<TItem12>>,
): SchemaWithPipe<
	readonly [
		TSchema,
		TItem1,
		TItem2,
		TItem3,
		TItem4,
		TItem5,
		TItem6,
		TItem7,
		TItem8,
		TItem9,
		TItem10,
		TItem11,
		TItem12,
	]
>;

export function pipe<
	const TSchema extends BaseSchema<unknown, unknown>,
	const TItem1 extends BaseConstraint<InferOutput<TSchema>, unknown>,
	const TItem2 extends BaseConstraint<InferOutput<TItem1>, unknown>,
	const TItem3 extends BaseConstraint<InferOutput<TItem2>, unknown>,
	const TItem4 extends BaseConstraint<InferOutput<TItem3>, unknown>,
	const TItem5 extends BaseConstraint<InferOutput<TItem4>, unknown>,
	const TItem6 extends BaseConstraint<InferOutput<TItem5>, unknown>,
	const TItem7 extends BaseConstraint<InferOutput<TItem6>, unknown>,
	const TItem8 extends BaseConstraint<InferOutput<TItem7>, unknown>,
	const TItem9 extends BaseConstraint<InferOutput<TItem8>, unknown>,
	const TItem10 extends BaseConstraint<InferOutput<TItem9>, unknown>,
	const TItem11 extends BaseConstraint<InferOutput<TItem10>, unknown>,
	const TItem12 extends BaseConstraint<InferOutput<TItem11>, unknown>,
	const TItem13 extends BaseConstraint<InferOutput<TItem12>, unknown>,
>(
	schema: TSchema,
	item1: TItem1 | BaseConstraint<InferOutput<TSchema>, InferOutput<TItem1>>,
	item2: TItem2 | BaseConstraint<InferOutput<TItem1>, InferOutput<TItem2>>,
	item3: TItem3 | BaseConstraint<InferOutput<TItem2>, InferOutput<TItem3>>,
	item4: TItem4 | BaseConstraint<InferOutput<TItem3>, InferOutput<TItem4>>,
	item5: TItem5 | BaseConstraint<InferOutput<TItem4>, InferOutput<TItem5>>,
	item6: TItem6 | BaseConstraint<InferOutput<TItem5>, InferOutput<TItem6>>,
	item7: TItem7 | BaseConstraint<InferOutput<TItem6>, InferOutput<TItem7>>,
	item8: TItem8 | BaseConstraint<InferOutput<TItem7>, InferOutput<TItem8>>,
	item9: TItem9 | BaseConstraint<InferOutput<TItem8>, InferOutput<TItem9>>,
	item10: TItem10 | BaseConstraint<InferOutput<TItem9>, InferOutput<TItem10>>,
	item11: TItem11 | BaseConstraint<InferOutput<TItem10>, InferOutput<TItem11>>,
	item12: TItem12 | BaseConstraint<InferOutput<TItem11>, InferOutput<TItem12>>,
	item13: TItem13 | BaseConstraint<InferOutput<TItem12>, InferOutput<TItem13>>,
): SchemaWithPipe<
	readonly [
		TSchema,
		TItem1,
		TItem2,
		TItem3,
		TItem4,
		TItem5,
		TItem6,
		TItem7,
		TItem8,
		TItem9,
		TItem10,
		TItem11,
		TItem12,
		TItem13,
	]
>;

export function pipe<
	const TSchema extends BaseSchema<unknown, unknown>,
	const TItem1 extends BaseConstraint<InferOutput<TSchema>, unknown>,
	const TItem2 extends BaseConstraint<InferOutput<TItem1>, unknown>,
	const TItem3 extends BaseConstraint<InferOutput<TItem2>, unknown>,
	const TItem4 extends BaseConstraint<InferOutput<TItem3>, unknown>,
	const TItem5 extends BaseConstraint<InferOutput<TItem4>, unknown>,
	const TItem6 extends BaseConstraint<InferOutput<TItem5>, unknown>,
	const TItem7 extends BaseConstraint<InferOutput<TItem6>, unknown>,
	const TItem8 extends BaseConstraint<InferOutput<TItem7>, unknown>,
	const TItem9 extends BaseConstraint<InferOutput<TItem8>, unknown>,
	const TItem10 extends BaseConstraint<InferOutput<TItem9>, unknown>,
	const TItem11 extends BaseConstraint<InferOutput<TItem10>, unknown>,
	const TItem12 extends BaseConstraint<InferOutput<TItem11>, unknown>,
	const TItem13 extends BaseConstraint<InferOutput<TItem12>, unknown>,
	const TItem14 extends BaseConstraint<InferOutput<TItem13>, unknown>,
>(
	schema: TSchema,
	item1: TItem1 | BaseConstraint<InferOutput<TSchema>, InferOutput<TItem1>>,
	item2: TItem2 | BaseConstraint<InferOutput<TItem1>, InferOutput<TItem2>>,
	item3: TItem3 | BaseConstraint<InferOutput<TItem2>, InferOutput<TItem3>>,
	item4: TItem4 | BaseConstraint<InferOutput<TItem3>, InferOutput<TItem4>>,
	item5: TItem5 | BaseConstraint<InferOutput<TItem4>, InferOutput<TItem5>>,
	item6: TItem6 | BaseConstraint<InferOutput<TItem5>, InferOutput<TItem6>>,
	item7: TItem7 | BaseConstraint<InferOutput<TItem6>, InferOutput<TItem7>>,
	item8: TItem8 | BaseConstraint<InferOutput<TItem7>, InferOutput<TItem8>>,
	item9: TItem9 | BaseConstraint<InferOutput<TItem8>, InferOutput<TItem9>>,
	item10: TItem10 | BaseConstraint<InferOutput<TItem9>, InferOutput<TItem10>>,
	item11: TItem11 | BaseConstraint<InferOutput<TItem10>, InferOutput<TItem11>>,
	item12: TItem12 | BaseConstraint<InferOutput<TItem11>, InferOutput<TItem12>>,
	item13: TItem13 | BaseConstraint<InferOutput<TItem12>, InferOutput<TItem13>>,
	item14: TItem14 | BaseConstraint<InferOutput<TItem13>, InferOutput<TItem14>>,
): SchemaWithPipe<
	readonly [
		TSchema,
		TItem1,
		TItem2,
		TItem3,
		TItem4,
		TItem5,
		TItem6,
		TItem7,
		TItem8,
		TItem9,
		TItem10,
		TItem11,
		TItem12,
		TItem13,
		TItem14,
	]
>;

export function pipe<
	const TSchema extends BaseSchema<unknown, unknown>,
	const TItem1 extends BaseConstraint<InferOutput<TSchema>, unknown>,
	const TItem2 extends BaseConstraint<InferOutput<TItem1>, unknown>,
	const TItem3 extends BaseConstraint<InferOutput<TItem2>, unknown>,
	const TItem4 extends BaseConstraint<InferOutput<TItem3>, unknown>,
	const TItem5 extends BaseConstraint<InferOutput<TItem4>, unknown>,
	const TItem6 extends BaseConstraint<InferOutput<TItem5>, unknown>,
	const TItem7 extends BaseConstraint<InferOutput<TItem6>, unknown>,
	const TItem8 extends BaseConstraint<InferOutput<TItem7>, unknown>,
	const TItem9 extends BaseConstraint<InferOutput<TItem8>, unknown>,
	const TItem10 extends BaseConstraint<InferOutput<TItem9>, unknown>,
	const TItem11 extends BaseConstraint<InferOutput<TItem10>, unknown>,
	const TItem12 extends BaseConstraint<InferOutput<TItem11>, unknown>,
	const TItem13 extends BaseConstraint<InferOutput<TItem12>, unknown>,
	const TItem14 extends BaseConstraint<InferOutput<TItem13>, unknown>,
	const TItem15 extends BaseConstraint<InferOutput<TItem14>, unknown>,
>(
	schema: TSchema,
	item1: TItem1 | BaseConstraint<InferOutput<TSchema>, InferOutput<TItem1>>,
	item2: TItem2 | BaseConstraint<InferOutput<TItem1>, InferOutput<TItem2>>,
	item3: TItem3 | BaseConstraint<InferOutput<TItem2>, InferOutput<TItem3>>,
	item4: TItem4 | BaseConstraint<InferOutput<TItem3>, InferOutput<TItem4>>,
	item5: TItem5 | BaseConstraint<InferOutput<TItem4>, InferOutput<TItem5>>,
	item6: TItem6 | BaseConstraint<InferOutput<TItem5>, InferOutput<TItem6>>,
	item7: TItem7 | BaseConstraint<InferOutput<TItem6>, InferOutput<TItem7>>,
	item8: TItem8 | BaseConstraint<InferOutput<TItem7>, InferOutput<TItem8>>,
	item9: TItem9 | BaseConstraint<InferOutput<TItem8>, InferOutput<TItem9>>,
	item10: TItem10 | BaseConstraint<InferOutput<TItem9>, InferOutput<TItem10>>,
	item11: TItem11 | BaseConstraint<InferOutput<TItem10>, InferOutput<TItem11>>,
	item12: TItem12 | BaseConstraint<InferOutput<TItem11>, InferOutput<TItem12>>,
	item13: TItem13 | BaseConstraint<InferOutput<TItem12>, InferOutput<TItem13>>,
	item14: TItem14 | BaseConstraint<InferOutput<TItem13>, InferOutput<TItem14>>,
	item15: TItem15 | BaseConstraint<InferOutput<TItem14>, InferOutput<TItem15>>,
): SchemaWithPipe<
	readonly [
		TSchema,
		TItem1,
		TItem2,
		TItem3,
		TItem4,
		TItem5,
		TItem6,
		TItem7,
		TItem8,
		TItem9,
		TItem10,
		TItem11,
		TItem12,
		TItem13,
		TItem14,
		TItem15,
	]
>;

export function pipe<
	const TSchema extends BaseSchema<unknown, unknown>,
	const TItem1 extends BaseConstraint<InferOutput<TSchema>, unknown>,
	const TItem2 extends BaseConstraint<InferOutput<TItem1>, unknown>,
	const TItem3 extends BaseConstraint<InferOutput<TItem2>, unknown>,
	const TItem4 extends BaseConstraint<InferOutput<TItem3>, unknown>,
	const TItem5 extends BaseConstraint<InferOutput<TItem4>, unknown>,
	const TItem6 extends BaseConstraint<InferOutput<TItem5>, unknown>,
	const TItem7 extends BaseConstraint<InferOutput<TItem6>, unknown>,
	const TItem8 extends BaseConstraint<InferOutput<TItem7>, unknown>,
	const TItem9 extends BaseConstraint<InferOutput<TItem8>, unknown>,
	const TItem10 extends BaseConstraint<InferOutput<TItem9>, unknown>,
	const TItem11 extends BaseConstraint<InferOutput<TItem10>, unknown>,
	const TItem12 extends BaseConstraint<InferOutput<TItem11>, unknown>,
	const TItem13 extends BaseConstraint<InferOutput<TItem12>, unknown>,
	const TItem14 extends BaseConstraint<InferOutput<TItem13>, unknown>,
	const TItem15 extends BaseConstraint<InferOutput<TItem14>, unknown>,
	const TItem16 extends BaseConstraint<InferOutput<TItem15>, unknown>,
>(
	schema: TSchema,
	item1: TItem1 | BaseConstraint<InferOutput<TSchema>, InferOutput<TItem1>>,
	item2: TItem2 | BaseConstraint<InferOutput<TItem1>, InferOutput<TItem2>>,
	item3: TItem3 | BaseConstraint<InferOutput<TItem2>, InferOutput<TItem3>>,
	item4: TItem4 | BaseConstraint<InferOutput<TItem3>, InferOutput<TItem4>>,
	item5: TItem5 | BaseConstraint<InferOutput<TItem4>, InferOutput<TItem5>>,
	item6: TItem6 | BaseConstraint<InferOutput<TItem5>, InferOutput<TItem6>>,
	item7: TItem7 | BaseConstraint<InferOutput<TItem6>, InferOutput<TItem7>>,
	item8: TItem8 | BaseConstraint<InferOutput<TItem7>, InferOutput<TItem8>>,
	item9: TItem9 | BaseConstraint<InferOutput<TItem8>, InferOutput<TItem9>>,
	item10: TItem10 | BaseConstraint<InferOutput<TItem9>, InferOutput<TItem10>>,
	item11: TItem11 | BaseConstraint<InferOutput<TItem10>, InferOutput<TItem11>>,
	item12: TItem12 | BaseConstraint<InferOutput<TItem11>, InferOutput<TItem12>>,
	item13: TItem13 | BaseConstraint<InferOutput<TItem12>, InferOutput<TItem13>>,
	item14: TItem14 | BaseConstraint<InferOutput<TItem13>, InferOutput<TItem14>>,
	item15: TItem15 | BaseConstraint<InferOutput<TItem14>, InferOutput<TItem15>>,
	item16: TItem16 | BaseConstraint<InferOutput<TItem15>, InferOutput<TItem16>>,
): SchemaWithPipe<
	readonly [
		TSchema,
		TItem1,
		TItem2,
		TItem3,
		TItem4,
		TItem5,
		TItem6,
		TItem7,
		TItem8,
		TItem9,
		TItem10,
		TItem11,
		TItem12,
		TItem13,
		TItem14,
		TItem15,
		TItem16,
	]
>;

export function pipe<
	const TSchema extends BaseSchema<unknown, unknown>,
	const TItem1 extends BaseConstraint<InferOutput<TSchema>, unknown>,
	const TItem2 extends BaseConstraint<InferOutput<TItem1>, unknown>,
	const TItem3 extends BaseConstraint<InferOutput<TItem2>, unknown>,
	const TItem4 extends BaseConstraint<InferOutput<TItem3>, unknown>,
	const TItem5 extends BaseConstraint<InferOutput<TItem4>, unknown>,
	const TItem6 extends BaseConstraint<InferOutput<TItem5>, unknown>,
	const TItem7 extends BaseConstraint<InferOutput<TItem6>, unknown>,
	const TItem8 extends BaseConstraint<InferOutput<TItem7>, unknown>,
	const TItem9 extends BaseConstraint<InferOutput<TItem8>, unknown>,
	const TItem10 extends BaseConstraint<InferOutput<TItem9>, unknown>,
	const TItem11 extends BaseConstraint<InferOutput<TItem10>, unknown>,
	const TItem12 extends BaseConstraint<InferOutput<TItem11>, unknown>,
	const TItem13 extends BaseConstraint<InferOutput<TItem12>, unknown>,
	const TItem14 extends BaseConstraint<InferOutput<TItem13>, unknown>,
	const TItem15 extends BaseConstraint<InferOutput<TItem14>, unknown>,
	const TItem16 extends BaseConstraint<InferOutput<TItem15>, unknown>,
>(
	schema: TSchema,
	item1: TItem1 | BaseConstraint<InferOutput<TSchema>, InferOutput<TItem1>>,
	item2: TItem2 | BaseConstraint<InferOutput<TItem1>, InferOutput<TItem2>>,
	item3: TItem3 | BaseConstraint<InferOutput<TItem2>, InferOutput<TItem3>>,
	item4: TItem4 | BaseConstraint<InferOutput<TItem3>, InferOutput<TItem4>>,
	item5: TItem5 | BaseConstraint<InferOutput<TItem4>, InferOutput<TItem5>>,
	item6: TItem6 | BaseConstraint<InferOutput<TItem5>, InferOutput<TItem6>>,
	item7: TItem7 | BaseConstraint<InferOutput<TItem6>, InferOutput<TItem7>>,
	item8: TItem8 | BaseConstraint<InferOutput<TItem7>, InferOutput<TItem8>>,
	item9: TItem9 | BaseConstraint<InferOutput<TItem8>, InferOutput<TItem9>>,
	item10: TItem10 | BaseConstraint<InferOutput<TItem9>, InferOutput<TItem10>>,
	item11: TItem11 | BaseConstraint<InferOutput<TItem10>, InferOutput<TItem11>>,
	item12: TItem12 | BaseConstraint<InferOutput<TItem11>, InferOutput<TItem12>>,
	item13: TItem13 | BaseConstraint<InferOutput<TItem12>, InferOutput<TItem13>>,
	item14: TItem14 | BaseConstraint<InferOutput<TItem13>, InferOutput<TItem14>>,
	item15: TItem15 | BaseConstraint<InferOutput<TItem14>, InferOutput<TItem15>>,
	item16: TItem16 | BaseConstraint<InferOutput<TItem15>, InferOutput<TItem16>>,
): SchemaWithPipe<
	readonly [
		TSchema,
		TItem1,
		TItem2,
		TItem3,
		TItem4,
		TItem5,
		TItem6,
		TItem7,
		TItem8,
		TItem9,
		TItem10,
		TItem11,
		TItem12,
		TItem13,
		TItem14,
		TItem15,
		TItem16,
	]
>;

export function pipe<
	const TSchema extends BaseSchema<unknown, unknown>,
	const TItem1 extends BaseConstraint<InferOutput<TSchema>, unknown>,
	const TItem2 extends BaseConstraint<InferOutput<TItem1>, unknown>,
	const TItem3 extends BaseConstraint<InferOutput<TItem2>, unknown>,
	const TItem4 extends BaseConstraint<InferOutput<TItem3>, unknown>,
	const TItem5 extends BaseConstraint<InferOutput<TItem4>, unknown>,
	const TItem6 extends BaseConstraint<InferOutput<TItem5>, unknown>,
	const TItem7 extends BaseConstraint<InferOutput<TItem6>, unknown>,
	const TItem8 extends BaseConstraint<InferOutput<TItem7>, unknown>,
	const TItem9 extends BaseConstraint<InferOutput<TItem8>, unknown>,
	const TItem10 extends BaseConstraint<InferOutput<TItem9>, unknown>,
	const TItem11 extends BaseConstraint<InferOutput<TItem10>, unknown>,
	const TItem12 extends BaseConstraint<InferOutput<TItem11>, unknown>,
	const TItem13 extends BaseConstraint<InferOutput<TItem12>, unknown>,
	const TItem14 extends BaseConstraint<InferOutput<TItem13>, unknown>,
	const TItem15 extends BaseConstraint<InferOutput<TItem14>, unknown>,
	const TItem16 extends BaseConstraint<InferOutput<TItem15>, unknown>,
	const TItem17 extends BaseConstraint<InferOutput<TItem16>, unknown>,
>(
	schema: TSchema,
	item1: TItem1 | BaseConstraint<InferOutput<TSchema>, InferOutput<TItem1>>,
	item2: TItem2 | BaseConstraint<InferOutput<TItem1>, InferOutput<TItem2>>,
	item3: TItem3 | BaseConstraint<InferOutput<TItem2>, InferOutput<TItem3>>,
	item4: TItem4 | BaseConstraint<InferOutput<TItem3>, InferOutput<TItem4>>,
	item5: TItem5 | BaseConstraint<InferOutput<TItem4>, InferOutput<TItem5>>,
	item6: TItem6 | BaseConstraint<InferOutput<TItem5>, InferOutput<TItem6>>,
	item7: TItem7 | BaseConstraint<InferOutput<TItem6>, InferOutput<TItem7>>,
	item8: TItem8 | BaseConstraint<InferOutput<TItem7>, InferOutput<TItem8>>,
	item9: TItem9 | BaseConstraint<InferOutput<TItem8>, InferOutput<TItem9>>,
	item10: TItem10 | BaseConstraint<InferOutput<TItem9>, InferOutput<TItem10>>,
	item11: TItem11 | BaseConstraint<InferOutput<TItem10>, InferOutput<TItem11>>,
	item12: TItem12 | BaseConstraint<InferOutput<TItem11>, InferOutput<TItem12>>,
	item13: TItem13 | BaseConstraint<InferOutput<TItem12>, InferOutput<TItem13>>,
	item14: TItem14 | BaseConstraint<InferOutput<TItem13>, InferOutput<TItem14>>,
	item15: TItem15 | BaseConstraint<InferOutput<TItem14>, InferOutput<TItem15>>,
	item16: TItem16 | BaseConstraint<InferOutput<TItem15>, InferOutput<TItem16>>,
	item17: TItem17 | BaseConstraint<InferOutput<TItem16>, InferOutput<TItem17>>,
): SchemaWithPipe<
	readonly [
		TSchema,
		TItem1,
		TItem2,
		TItem3,
		TItem4,
		TItem5,
		TItem6,
		TItem7,
		TItem8,
		TItem9,
		TItem10,
		TItem11,
		TItem12,
		TItem13,
		TItem14,
		TItem15,
		TItem16,
		TItem17,
	]
>;

export function pipe<
	const TSchema extends BaseSchema<unknown, unknown>,
	const TItem1 extends BaseConstraint<InferOutput<TSchema>, unknown>,
	const TItem2 extends BaseConstraint<InferOutput<TItem1>, unknown>,
	const TItem3 extends BaseConstraint<InferOutput<TItem2>, unknown>,
	const TItem4 extends BaseConstraint<InferOutput<TItem3>, unknown>,
	const TItem5 extends BaseConstraint<InferOutput<TItem4>, unknown>,
	const TItem6 extends BaseConstraint<InferOutput<TItem5>, unknown>,
	const TItem7 extends BaseConstraint<InferOutput<TItem6>, unknown>,
	const TItem8 extends BaseConstraint<InferOutput<TItem7>, unknown>,
	const TItem9 extends BaseConstraint<InferOutput<TItem8>, unknown>,
	const TItem10 extends BaseConstraint<InferOutput<TItem9>, unknown>,
	const TItem11 extends BaseConstraint<InferOutput<TItem10>, unknown>,
	const TItem12 extends BaseConstraint<InferOutput<TItem11>, unknown>,
	const TItem13 extends BaseConstraint<InferOutput<TItem12>, unknown>,
	const TItem14 extends BaseConstraint<InferOutput<TItem13>, unknown>,
	const TItem15 extends BaseConstraint<InferOutput<TItem14>, unknown>,
	const TItem16 extends BaseConstraint<InferOutput<TItem15>, unknown>,
	const TItem17 extends BaseConstraint<InferOutput<TItem16>, unknown>,
	const TItem18 extends BaseConstraint<InferOutput<TItem17>, unknown>,
>(
	schema: TSchema,
	item1: TItem1 | BaseConstraint<InferOutput<TSchema>, InferOutput<TItem1>>,
	item2: TItem2 | BaseConstraint<InferOutput<TItem1>, InferOutput<TItem2>>,
	item3: TItem3 | BaseConstraint<InferOutput<TItem2>, InferOutput<TItem3>>,
	item4: TItem4 | BaseConstraint<InferOutput<TItem3>, InferOutput<TItem4>>,
	item5: TItem5 | BaseConstraint<InferOutput<TItem4>, InferOutput<TItem5>>,
	item6: TItem6 | BaseConstraint<InferOutput<TItem5>, InferOutput<TItem6>>,
	item7: TItem7 | BaseConstraint<InferOutput<TItem6>, InferOutput<TItem7>>,
	item8: TItem8 | BaseConstraint<InferOutput<TItem7>, InferOutput<TItem8>>,
	item9: TItem9 | BaseConstraint<InferOutput<TItem8>, InferOutput<TItem9>>,
	item10: TItem10 | BaseConstraint<InferOutput<TItem9>, InferOutput<TItem10>>,
	item11: TItem11 | BaseConstraint<InferOutput<TItem10>, InferOutput<TItem11>>,
	item12: TItem12 | BaseConstraint<InferOutput<TItem11>, InferOutput<TItem12>>,
	item13: TItem13 | BaseConstraint<InferOutput<TItem12>, InferOutput<TItem13>>,
	item14: TItem14 | BaseConstraint<InferOutput<TItem13>, InferOutput<TItem14>>,
	item15: TItem15 | BaseConstraint<InferOutput<TItem14>, InferOutput<TItem15>>,
	item16: TItem16 | BaseConstraint<InferOutput<TItem15>, InferOutput<TItem16>>,
	item17: TItem17 | BaseConstraint<InferOutput<TItem16>, InferOutput<TItem17>>,
	item18: TItem18 | BaseConstraint<InferOutput<TItem17>, InferOutput<TItem18>>,
): SchemaWithPipe<
	readonly [
		TSchema,
		TItem1,
		TItem2,
		TItem3,
		TItem4,
		TItem5,
		TItem6,
		TItem7,
		TItem8,
		TItem9,
		TItem10,
		TItem11,
		TItem12,
		TItem13,
		TItem14,
		TItem15,
		TItem16,
		TItem17,
		TItem18,
	]
>;

export function pipe<
	const TSchema extends BaseSchema<unknown, unknown>,
	const TItem1 extends BaseConstraint<InferOutput<TSchema>, unknown>,
	const TItem2 extends BaseConstraint<InferOutput<TItem1>, unknown>,
	const TItem3 extends BaseConstraint<InferOutput<TItem2>, unknown>,
	const TItem4 extends BaseConstraint<InferOutput<TItem3>, unknown>,
	const TItem5 extends BaseConstraint<InferOutput<TItem4>, unknown>,
	const TItem6 extends BaseConstraint<InferOutput<TItem5>, unknown>,
	const TItem7 extends BaseConstraint<InferOutput<TItem6>, unknown>,
	const TItem8 extends BaseConstraint<InferOutput<TItem7>, unknown>,
	const TItem9 extends BaseConstraint<InferOutput<TItem8>, unknown>,
	const TItem10 extends BaseConstraint<InferOutput<TItem9>, unknown>,
	const TItem11 extends BaseConstraint<InferOutput<TItem10>, unknown>,
	const TItem12 extends BaseConstraint<InferOutput<TItem11>, unknown>,
	const TItem13 extends BaseConstraint<InferOutput<TItem12>, unknown>,
	const TItem14 extends BaseConstraint<InferOutput<TItem13>, unknown>,
	const TItem15 extends BaseConstraint<InferOutput<TItem14>, unknown>,
	const TItem16 extends BaseConstraint<InferOutput<TItem15>, unknown>,
	const TItem17 extends BaseConstraint<InferOutput<TItem16>, unknown>,
	const TItem18 extends BaseConstraint<InferOutput<TItem17>, unknown>,
	const TItem19 extends BaseConstraint<InferOutput<TItem18>, unknown>,
>(
	schema: TSchema,
	item1: TItem1 | BaseConstraint<InferOutput<TSchema>, InferOutput<TItem1>>,
	item2: TItem2 | BaseConstraint<InferOutput<TItem1>, InferOutput<TItem2>>,
	item3: TItem3 | BaseConstraint<InferOutput<TItem2>, InferOutput<TItem3>>,
	item4: TItem4 | BaseConstraint<InferOutput<TItem3>, InferOutput<TItem4>>,
	item5: TItem5 | BaseConstraint<InferOutput<TItem4>, InferOutput<TItem5>>,
	item6: TItem6 | BaseConstraint<InferOutput<TItem5>, InferOutput<TItem6>>,
	item7: TItem7 | BaseConstraint<InferOutput<TItem6>, InferOutput<TItem7>>,
	item8: TItem8 | BaseConstraint<InferOutput<TItem7>, InferOutput<TItem8>>,
	item9: TItem9 | BaseConstraint<InferOutput<TItem8>, InferOutput<TItem9>>,
	item10: TItem10 | BaseConstraint<InferOutput<TItem9>, InferOutput<TItem10>>,
	item11: TItem11 | BaseConstraint<InferOutput<TItem10>, InferOutput<TItem11>>,
	item12: TItem12 | BaseConstraint<InferOutput<TItem11>, InferOutput<TItem12>>,
	item13: TItem13 | BaseConstraint<InferOutput<TItem12>, InferOutput<TItem13>>,
	item14: TItem14 | BaseConstraint<InferOutput<TItem13>, InferOutput<TItem14>>,
	item15: TItem15 | BaseConstraint<InferOutput<TItem14>, InferOutput<TItem15>>,
	item16: TItem16 | BaseConstraint<InferOutput<TItem15>, InferOutput<TItem16>>,
	item17: TItem17 | BaseConstraint<InferOutput<TItem16>, InferOutput<TItem17>>,
	item18: TItem18 | BaseConstraint<InferOutput<TItem17>, InferOutput<TItem18>>,
	item19: TItem19 | BaseConstraint<InferOutput<TItem18>, InferOutput<TItem19>>,
): SchemaWithPipe<
	readonly [
		TSchema,
		TItem1,
		TItem2,
		TItem3,
		TItem4,
		TItem5,
		TItem6,
		TItem7,
		TItem8,
		TItem9,
		TItem10,
		TItem11,
		TItem12,
		TItem13,
		TItem14,
		TItem15,
		TItem16,
		TItem17,
		TItem18,
		TItem19,
	]
>;

export function pipe<
	const TSchema extends BaseSchema<unknown, unknown>,
	const TItems extends readonly BaseConstraint<InferOutput<TSchema>, InferOutput<TSchema>>[],
>(schema: TSchema, ...items: TItems): SchemaWithPipe<readonly [TSchema, ...TItems]>;

// @__NO_SIDE_EFFECTS__
export function pipe<
	const TSchema extends BaseSchema<unknown, unknown>,
	const TItems extends readonly BaseConstraint<unknown, unknown>[],
>(...pipe: [TSchema, ...TItems]): SchemaWithPipe<readonly [TSchema, ...TItems]> {
	const [base, ...chain] = pipe;

	return {
		...base,
		pipe,
		'~run'(input, flags) {
			let result = base['~run'](input, flags);
			if (result !== undefined && !result.ok) {
				return result;
			}

			let current: unknown;
			if (result !== undefined) {
				current = result.value;
			} else {
				current = input;
			}

			for (let idx = 0, len = chain.length; idx < len; idx++) {
				const r = chain[idx]['~run'](current, flags);

				if (r !== undefined) {
					if (r.ok) {
						current = r.value;

						if (result === undefined || result.ok) {
							result = r;
						}
					} else {
						if (flags & FLAG_ABORT_EARLY) {
							return r;
						} else if (result === undefined || result.ok) {
							result = r;
						} else {
							result = joinIssues(result, r);
						}
					}
				}
			}

			return result;
		},
	};
}
