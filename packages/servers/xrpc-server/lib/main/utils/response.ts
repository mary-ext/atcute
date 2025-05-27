import type { Err } from '@atcute/lexicons/validations';

export const invalidRequest = (message: string) => {
	return Response.json({ error: 'InvalidRequest', message }, { status: 400 });
};

export const validationError = (kind: 'params' | 'input', err: Err): Response => {
	const message = `invalid ${kind}: ${err.message}`;

	return Response.json(
		{ error: 'InvalidRequest', message: message, 'net.kelinci.atcute.issues': err.issues },
		{ status: 400 },
	);
};
