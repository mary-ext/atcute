export interface SimpleStore<K extends string | number, V extends {} | null> {
	get: (key: K) => undefined | V;
	getWithLapsed: (key: K) => [undefined | V, number];
	set: (key: K, value: V) => void;
	delete: (key: K) => void;
	keys: () => K[];
}
