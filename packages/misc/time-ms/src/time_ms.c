#include <node_api.h>
#include <stdint.h>

#ifdef _WIN32
#include <windows.h>
#else
#include <time.h>
#endif

static napi_value now(napi_env env, napi_callback_info info) {
	int64_t microseconds;

#ifdef _WIN32
	FILETIME ft;
	ULARGE_INTEGER ul;
	GetSystemTimePreciseAsFileTime(&ft);
	ul.LowPart = ft.dwLowDateTime;
	ul.HighPart = ft.dwHighDateTime;
	// convert from 100-nanosecond intervals since 1601 to microseconds since 1970
	microseconds = (int64_t)((ul.QuadPart - 116444736000000000ULL) / 10);
#else
	struct timespec ts;
	clock_gettime(CLOCK_REALTIME, &ts);
	microseconds = (int64_t)ts.tv_sec * 1000000 + ts.tv_nsec / 1000;
#endif

	napi_value result;
	napi_create_int64(env, microseconds, &result);
	return result;
}

static napi_value init(napi_env env, napi_value exports) {
	napi_property_descriptor desc = { "now", NULL, now, NULL, NULL, NULL, napi_default, NULL };
	napi_define_properties(env, exports, 1, &desc);
	return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, init)
