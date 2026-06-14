// SPDX-FileCopyrightText: 2025 Mary
// SPDX-License-Identifier: 0BSD
#pragma once

#include <node_api.h>

static inline napi_value napi_bugcheck(napi_env env, const char* fallback_err) {
	// Init them in case napi_ calls below fail. We're already in the "uh oh" codepath, so we don't check them.
	const napi_extended_error_info* error_info = NULL;
	bool is_pending = false;

	napi_get_last_error_info((env), &error_info);
	napi_is_exception_pending((env), &is_pending);
	if (!is_pending) { // Don't overwrite an existing exception
		const char* err_message = (error_info != NULL) ? error_info->error_message : NULL;
		const char* message = (err_message == NULL) ? fallback_err : err_message;
		napi_throw_error((env), NULL, message);
	}

	return NULL;
}

// Preprocessor trickery to get __LINE__ as a string.
#define __NAPI_BUGCHECK(env, filename, line) napi_bugcheck(env, filename ":" #line ": unknown napi error")
#define _NAPI_BUGCHECK(env, filename, line) __NAPI_BUGCHECK(env, filename, line)
#define NAPI_BUGCHECK(env) _NAPI_BUGCHECK(env, __FILE_NAME__, __LINE__)

#define ERR_INVALID_ARG "ERR_INVALID_ARG"

#define NAPI_CALL(env, call) NAPI_CALL_CLEANUP(env, call, ;)

#define NAPI_CALL_CLEANUP(env, call, cleanup) \
	do {								\
		napi_status status = (call);	\
		if (status != napi_ok) {		\
			do { cleanup } while (0);	\
			return NAPI_BUGCHECK(env);	\
		}								\
	} while(0)

// NAPI_CALL_TYPE_ERROR_ON_STATUS(napi_env, [expr], napi_status, const char*, const char*);
// Example: NAPI_CALL_TYPE_ERROR_ON_STATUS(env, napi_get_typedarray_info(...), napi_invalid_arg, "ERR_***", "error message");
#define NAPI_CALL_TYPE_ERROR_ON_STATUS(env, call, expected_type_error_status, type_error_code, type_error_msg) \
	do {									\
		napi_status status = (call);		\
		if (status == expected_type_error_status) { \
			napi_throw_type_error(env, type_error_code, type_error_msg); \
			return NULL;					\
		} else if (status != napi_ok) {		\
			return NAPI_BUGCHECK(env);		\
		}									\
	} while(0)

#define NAPI_CHECKED(call) NAPI_CHECKED_CLEANUP(call, ;)

#define NAPI_CHECKED_CLEANUP(call, cleanup) \
	do {								\
		napi_status status = (call);	\
		if (status != napi_ok) {		\
			do { cleanup } while (0);	\
			return status;				\
		}								\
	} while(0)

// Defines: size_t argc, napi_value argv[]
#define NAPI_GET_ARGS(env, info, expected_argc)		\
	size_t argc = expected_argc;					\
	napi_value argv[expected_argc];					\
	NAPI_CALL(env, napi_get_cb_info(env, info, &argc, argv, NULL, NULL)); \
	if (argc < expected_argc) {						\
		napi_throw_type_error(env, "ERR_ARG_COUNT", "expected " #expected_argc " arguments");\
		return NULL;								\
	}

// Example: NAPI_TYPE_ASSERT(env, napi_is_*, argv[0], "ERR_***", "error message");
#define NAPI_TYPE_ASSERT(env, check, var, err_code, err_message) \
	NAPI_TYPE_ASSERT_CLEANUP(env, check, var, err_code, err_message, ;)

#define NAPI_TYPE_ASSERT_CLEANUP(env, check, var, err_code, err_message, cleanup) \
	do {								\
		bool is_ok;						\
		NAPI_CALL(env, check(env, var, &is_ok));	\
		if (!is_ok) {					\
			do { cleanup } while (0);	\
			napi_throw_type_error(env, err_code, err_message); \
			return NULL;				\
		}								\
	} while (0)

// Example: buf = malloc(...)
//          NAPI_CHECK_ALLOC(env, buf);
#define NAPI_CHECK_ALLOC(env, buf) NAPI_CHECK_ALLOC_CLEANUP(env, buf, ;)
#define NAPI_CHECK_ALLOC_CLEANUP(env, buf, cleanup) \
	do {								\
		if (buf == NULL) {				\
			do { cleanup } while (0);	\
			napi_throw_error(env, NULL, "allocation failed"); \
			return NULL;				\
		}								\
	} while (0)
