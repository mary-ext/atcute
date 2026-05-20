declare const kJson: unique symbol;

export type JSONResponse<TData> = Response & { [kJson]: TData };

export const json: {
	<TData>(data: NoInfer<TData>, init?: ResponseInit): JSONResponse<TData>;
	// oxlint-disable-next-line typescript/no-explicit-any
} = (data: any, init?: ResponseInit): any => {
	return Response.json(data, init);
};
