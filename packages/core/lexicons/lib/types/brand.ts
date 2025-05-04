export declare namespace $type {
	type get<TObject extends { $type?: string }> = NonNullable<TObject['$type']>;

	type enforce<TObject extends { $type?: string }> = TObject extends any
		? undefined extends TObject['$type']
			? TObject & { $type: NonNullable<TObject['$type']> }
			: TObject
		: never;

	type omit<TObject extends { $type?: string }> = Omit<TObject, '$type'>;
}
