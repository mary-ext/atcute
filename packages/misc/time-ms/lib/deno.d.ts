declare namespace Deno {
	export const build: {
		os: 'darwin' | 'linux' | 'windows' | 'freebsd' | 'netbsd' | 'aix' | 'solaris' | 'illumos';
	};

	export type PointerValue = null | NonNullable<unknown>;

	export const UnsafePointer: {
		of(value: Deno.BufferSource): PointerValue;
	};

	type NativeNumberType = 'u8' | 'i8' | 'u16' | 'i16' | 'u32' | 'i32' | 'f32' | 'f64';
	type NativeBigIntType = 'u64' | 'i64' | 'usize' | 'isize';
	type NativePointerType = 'pointer' | 'buffer';
	type NativeVoidType = 'void';
	type NativeType = NativeNumberType | NativeBigIntType | NativePointerType | NativeVoidType;

	interface ForeignFunction {
		parameters: readonly NativeType[];
		result: NativeType;
	}

	type ForeignFunctionRecord = Record<string, ForeignFunction>;

	type StaticForeignSymbol<T extends ForeignFunction> = {
		(...args: unknown[]): T['result'] extends NativeVoidType ? void : unknown;
	};

	type DynamicLibrary<S extends ForeignFunctionRecord> = {
		symbols: { [K in keyof S]: StaticForeignSymbol<S[K]> };
		close(): void;
	};

	export function dlopen<S extends ForeignFunctionRecord>(path: string, symbols: S): DynamicLibrary<S>;
}
