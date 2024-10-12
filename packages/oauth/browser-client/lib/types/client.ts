export interface ClientMetadata {
	redirect_uris: string[];
	response_types: (
		| 'code'
		| 'token'
		| 'none'
		| 'code id_token token'
		| 'code id_token'
		| 'code token'
		| 'id_token token'
		| 'id_token'
	)[];
	grant_types: (
		| 'authorization_code'
		| 'implicit'
		| 'refresh_token'
		| 'password'
		| 'client_credentials'
		| 'urn:ietf:params:oauth:grant-type:jwt-bearer'
		| 'urn:ietf:params:oauth:grant-type:saml2-bearer'
	)[];
	scope?: string;
	token_endpoint_auth_method?:
		| 'none'
		| 'client_secret_basic'
		| 'client_secret_jwt'
		| 'client_secret_post'
		| 'private_key_jwt'
		| 'self_signed_tls_client_auth'
		| 'tls_client_auth';
	token_endpoint_auth_signing_alg?: string;
	introspection_endpoint_auth_method?:
		| 'none'
		| 'client_secret_basic'
		| 'client_secret_jwt'
		| 'client_secret_post'
		| 'private_key_jwt'
		| 'self_signed_tls_client_auth'
		| 'tls_client_auth';
	introspection_endpoint_auth_signing_alg?: string;
	revocation_endpoint_auth_method?:
		| 'none'
		| 'client_secret_basic'
		| 'client_secret_jwt'
		| 'client_secret_post'
		| 'private_key_jwt'
		| 'self_signed_tls_client_auth'
		| 'tls_client_auth';
	revocation_endpoint_auth_signing_alg?: string;
	pushed_authorization_request_endpoint_auth_method?:
		| 'none'
		| 'client_secret_basic'
		| 'client_secret_jwt'
		| 'client_secret_post'
		| 'private_key_jwt'
		| 'self_signed_tls_client_auth'
		| 'tls_client_auth';
	pushed_authorization_request_endpoint_auth_signing_alg?: string;
	userinfo_signed_response_alg?: string;
	userinfo_encrypted_response_alg?: string;
	jwks_uri?: string;
	jwks?: unknown;
	application_type?: 'web' | 'native';
	subject_type?: 'public' | 'pairwise';
	request_object_signing_alg?: string;
	id_token_signed_response_alg?: string;
	authorization_signed_response_alg?: string;
	authorization_encrypted_response_enc?: 'A128CBC-HS256';
	authorization_encrypted_response_alg?: string;
	client_id?: string;
	client_name?: string;
	client_uri?: string;
	policy_uri?: string;
	tos_uri?: string;
	logo_uri?: string;
	default_max_age?: number;
	require_auth_time?: boolean;
	contacts?: string[];
	tls_client_certificate_bound_access_tokens?: boolean;
	dpop_bound_access_tokens?: boolean;
	authorization_details_types?: string[];
}
