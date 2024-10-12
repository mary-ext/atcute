export interface ProtectedResourceMetadata {
	resource: string;
	jwks_uri?: string;
	authorization_servers?: string[];
	scopes_supported?: string[];
	bearer_methods_supported?: ('header' | 'body' | 'query')[];
	resource_signing_alg_values_supported?: string[];
	resource_documentation?: string;
	resource_policy_uri?: string;
	resource_tos_uri?: string;
}

export interface AuthorizationServerMetadata {
	issuer: string;
	authorization_endpoint: string;
	token_endpoint: string;
	jwks_uri?: string;
	scopes_supported?: string[];
	claims_supported?: string[];
	claims_locales_supported?: string[];
	claims_parameter_supported?: boolean;
	request_parameter_supported?: boolean;
	request_uri_parameter_supported?: boolean;
	require_request_uri_registration?: boolean;
	subject_types_supported?: string[];
	response_types_supported?: string[];
	response_modes_supported?: string[];
	grant_types_supported?: string[];
	code_challenge_methods_supported?: string[];
	ui_locales_supported?: string[];
	id_token_signing_alg_values_supported?: string[];
	display_values_supported?: string[];
	request_object_signing_alg_values_supported?: string[];
	authorization_response_iss_parameter_supported?: boolean;
	authorization_details_types_supported?: string[];
	request_object_encryption_alg_values_supported?: string[];
	request_object_encryption_enc_values_supported?: string[];
	token_endpoint_auth_methods_supported?: string[];
	token_endpoint_auth_signing_alg_values_supported?: string[];
	revocation_endpoint?: string;
	revocation_endpoint_auth_methods_supported?: string[];
	revocation_endpoint_auth_signing_alg_values_supported?: string[];
	introspection_endpoint?: string;
	introspection_endpoint_auth_methods_supported?: string[];
	introspection_endpoint_auth_signing_alg_values_supported?: string[];
	pushed_authorization_request_endpoint?: string;
	pushed_authorization_request_endpoint_auth_methods_supported?: string[];
	pushed_authorization_request_endpoint_auth_signing_alg_values_supported?: string[];
	require_pushed_authorization_requests?: boolean;
	userinfo_endpoint?: string;
	end_session_endpoint?: string;
	registration_endpoint?: string;
	dpop_signing_alg_values_supported?: string[];
	protected_resources?: string[];
	client_id_metadata_document_supported?: boolean;
}

export interface PersistedAuthorizationServerMetadata
	extends Pick<
		AuthorizationServerMetadata,
		| 'issuer'
		| 'authorization_endpoint'
		| 'introspection_endpoint'
		| 'pushed_authorization_request_endpoint'
		| 'revocation_endpoint'
		| 'token_endpoint'
	> {}
