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
export const oauthPromptSchema = v.picklist(['none', 'login', 'consent', 'select_account', 'create']);

export type OAuthPrompt = v.InferOutput<typeof oauthPromptSchema>;
