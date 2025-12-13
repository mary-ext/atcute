/** regex for matching JSON content-type */
export const JSON_MIME = /^application\/json(;|$)/;

/** max size for AS metadata responses (~1.6KB avg, 3x buffer) */
export const AS_METADATA_MAX_SIZE = 8 * 1024; // 8KB

/** max size for protected resource metadata responses (~200B avg, 3x buffer) */
export const PR_METADATA_MAX_SIZE = 1024; // 1KB

/** max size for token endpoint responses */
export const TOKEN_RESPONSE_MAX_SIZE = 8 * 1024; // 8KB

/** max size for PAR responses */
export const PAR_RESPONSE_MAX_SIZE = 1024; // 1KB

/** default algorithm per atproto spec */
export const FALLBACK_ALG = 'ES256';

/** JWT bearer assertion type for `private_key_jwt` authentication */
export const CLIENT_ASSERTION_TYPE_JWT_BEARER = 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer';
