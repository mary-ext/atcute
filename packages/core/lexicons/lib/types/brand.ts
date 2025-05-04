export declare namespace $type {
	type get<TObject extends { $type?: string }> = NonNullable<TObject['$type']>;

	type enforce<TObject extends { $type?: string }> = TObject extends any
		? TObject & { $type: get<TObject> }
		: never;

	type omit<TObject extends { $type?: string }> = Omit<TObject, '$type'>;
}
