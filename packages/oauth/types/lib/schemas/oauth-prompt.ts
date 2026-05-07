import * as v from 'valibot';

/**
 * OAuth prompt mode values.
 *
 * - `none`: only succeed if user already authorized this client on this device
 * - `login`: force re-authentication
 * - `consent`: force re-consent
 * - `select_account`: force account selection
 * - `create`: force user registration screen
 */
export const oauthPromptSchema = v.union([
	v.literal('none'),
	v.literal('login'),
	v.literal('consent'),
	v.literal('select_account'),
	v.literal('create'),
]);

export type OAuthPrompt = v.InferOutput<typeof oauthPromptSchema>;
