export type Namespaced<T> = { mainSchema: T };

export const unwrapLxm = <T extends object>(schema: T | Namespaced<T>): T => {
	return 'mainSchema' in schema ? (schema as Namespaced<T>).mainSchema : schema;
};
