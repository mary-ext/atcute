export const extractContentType = (headers: Headers): string | undefined => {
	return headers.get('content-type')?.split(';')[0];
};
