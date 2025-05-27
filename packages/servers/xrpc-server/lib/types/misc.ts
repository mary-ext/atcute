export type Promisable<T> = T | Promise<T>;
export type Literal = string | number | boolean;

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
