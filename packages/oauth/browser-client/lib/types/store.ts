export interface SimpleStore<K extends string | number, V extends {} | null> {
	get: (key: K) => undefined | V;
	set: (key: K, value: V) => void;
	delete: (key: K) => void;
	keys: () => K[];
}
