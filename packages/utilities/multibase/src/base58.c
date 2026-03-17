#include <node_api.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>

static const char BASE58BTC_CHARSET[] = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

// inverse lookup: ASCII code -> base58 value, 0xff = invalid
static const uint8_t BASE58BTC_MAP[128] = {
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f, 0x10, 0xff, 0x11, 0x12, 0x13, 0x14, 0x15, 0xff,
	0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f, 0x20, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x2b, 0xff, 0x2c, 0x2d, 0x2e,
	0x2f, 0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0xff, 0xff, 0xff, 0xff, 0xff,
};

#define BASE 58
#define BASE2 (58 * 58)
#define BASE3 (58 * 58 * 58)

// stack buffer threshold — covers multikey strings (~48 chars) and
// typical base58 inputs without hitting the allocator
#define STACK_STR_MAX 128
#define STACK_BUF_MAX 96

static void finalize_external_bytes(napi_env env, void *data, void *hint) {
	(void)env;
	(void)hint;
	free(data);
}

// encode: Uint8Array -> string
static napi_value base58_encode(napi_env env, napi_callback_info info) {
	size_t argc = 1;
	napi_value argv[1];
	napi_get_cb_info(env, info, &argc, argv, NULL, NULL);

	uint8_t *source;
	size_t source_len;
	napi_get_typedarray_info(env, argv[0], NULL, &source_len, (void **)&source, NULL, NULL);

	if (source_len == 0) {
		napi_value result;
		napi_create_string_utf8(env, "", 0, &result);
		return result;
	}

	// count leading zeroes
	size_t zeroes = 0;
	size_t pbegin = 0;
	while (pbegin < source_len && source[pbegin] == 0) {
		pbegin++;
		zeroes++;
	}

	// allocate output in base-N representation
	size_t data_len = source_len - pbegin;
	size_t size = (size_t)(data_len * 138 / 100) + 1;

	uint8_t stack_bN[STACK_BUF_MAX];
	uint8_t *bN;
	int bN_heap = 0;

	if (size <= STACK_BUF_MAX) {
		bN = stack_bN;
		memset(bN, 0, size);
	} else {
		bN = (uint8_t *)calloc(size, 1);
		if (!bN) {
			napi_throw_error(env, NULL, "allocation failed");
			return NULL;
		}
		bN_heap = 1;
	}

	size_t length = 0;

	// process 3 bytes at a time where possible
	{
		size_t rem = data_len % 3;
		size_t triple_end = source_len - rem;

		while (pbegin < triple_end) {
			uint32_t carry = ((uint32_t)source[pbegin] << 16) |
			                 ((uint32_t)source[pbegin + 1] << 8) |
			                 (uint32_t)source[pbegin + 2];

			size_t i = 0;
			for (size_t it = size; (carry != 0 || i < length) && it > 0; it--, i++) {
				carry += (uint32_t)16777216 * bN[it - 1];
				bN[it - 1] = carry % BASE;
				carry /= BASE;
			}

			length = i;
			pbegin += 3;
		}
	}

	// remaining 0-2 bytes
	while (pbegin < source_len) {
		uint32_t carry = source[pbegin];

		size_t i = 0;
		for (size_t it = size; (carry != 0 || i < length) && it > 0; it--, i++) {
			carry += 256u * bN[it - 1];
			bN[it - 1] = carry % BASE;
			carry /= BASE;
		}

		length = i;
		pbegin++;
	}

	// skip leading zeroes in bN
	size_t it = size - length;
	while (it < size && bN[it] == 0) {
		it++;
	}

	// build output string
	size_t out_len = zeroes + (size - it);

	char stack_out[STACK_STR_MAX];
	char *out;
	int out_heap = 0;

	if (out_len < STACK_STR_MAX) {
		out = stack_out;
	} else {
		out = (char *)malloc(out_len + 1);
		if (!out) {
			if (bN_heap) free(bN);
			napi_throw_error(env, NULL, "allocation failed");
			return NULL;
		}
		out_heap = 1;
	}

	memset(out, BASE58BTC_CHARSET[0], zeroes);
	for (size_t j = zeroes; it < size; it++, j++) {
		out[j] = BASE58BTC_CHARSET[bN[it]];
	}

	if (bN_heap) free(bN);

	napi_value result;
	napi_create_string_utf8(env, out, out_len, &result);

	if (out_heap) free(out);
	return result;
}

// decode: string -> Uint8Array
static napi_value base58_decode(napi_env env, napi_callback_info info) {
	size_t argc = 1;
	napi_value argv[1];
	napi_get_cb_info(env, info, &argc, argv, NULL, NULL);

	// single call: read string directly into a stack buffer if it fits
	char stack_str[STACK_STR_MAX];
	char *str;
	int str_heap = 0;
	size_t str_len;

	napi_get_value_string_latin1(env, argv[0], NULL, 0, &str_len);

	if (str_len == 0) {
		napi_value ab, result;
		napi_create_arraybuffer(env, 0, NULL, &ab);
		napi_create_typedarray(env, napi_uint8_array, 0, ab, 0, &result);
		return result;
	}

	if (str_len < STACK_STR_MAX) {
		str = stack_str;
	} else {
		str = (char *)malloc(str_len + 1);
		if (!str) {
			napi_throw_error(env, NULL, "allocation failed");
			return NULL;
		}
		str_heap = 1;
	}
	napi_get_value_string_latin1(env, argv[0], str, str_len + 1, &str_len);

	// count and skip leading '1's (leader character)
	size_t psz = 0;
	size_t zeroes = 0;
	while (psz < str_len && str[psz] == '1') {
		zeroes++;
		psz++;
	}

	// allocate output in base256 representation
	size_t remaining = str_len - psz;
	size_t size = (size_t)(remaining * 733 / 1000) + 1;

	uint8_t stack_b256[STACK_BUF_MAX];
	uint8_t *b256;
	int b256_heap = 0;

	if (size <= STACK_BUF_MAX) {
		b256 = stack_b256;
		memset(b256, 0, size);
	} else {
		b256 = (uint8_t *)calloc(size, 1);
		if (!b256) {
			if (str_heap) free(str);
			napi_throw_error(env, NULL, "allocation failed");
			return NULL;
		}
		b256_heap = 1;
	}

	size_t length = 0;

	// process 3 chars at a time where possible
	// BASE^3 = 195112, max carry = 195112 * 255 + 195111 = 49948771, fits uint32
	{
		size_t rem = remaining % 3;
		size_t triple_end = str_len - rem;

		while (psz < triple_end) {
			uint8_t r0 = (uint8_t)str[psz];
			uint8_t r1 = (uint8_t)str[psz + 1];
			uint8_t r2 = (uint8_t)str[psz + 2];

			if ((r0 | r1 | r2) & 0x80) {
				goto invalid;
			}

			uint8_t c0 = BASE58BTC_MAP[r0];
			uint8_t c1 = BASE58BTC_MAP[r1];
			uint8_t c2 = BASE58BTC_MAP[r2];

			if (c0 == 0xff || c1 == 0xff || c2 == 0xff) {
				goto invalid;
			}

			uint32_t carry = ((uint32_t)c0 * BASE + c1) * BASE + c2;

			size_t i = 0;
			for (size_t it = size; (carry != 0 || i < length) && it > 0; it--, i++) {
				carry += (uint32_t)BASE3 * b256[it - 1];
				b256[it - 1] = carry & 0xff;
				carry >>= 8;
			}

			length = i;
			psz += 3;
		}
	}

	// remaining 1-2 characters
	if (remaining % 3 >= 2) {
		uint8_t r0 = (uint8_t)str[psz];
		uint8_t r1 = (uint8_t)str[psz + 1];

		if ((r0 | r1) & 0x80) {
			goto invalid;
		}

		uint8_t c0 = BASE58BTC_MAP[r0];
		uint8_t c1 = BASE58BTC_MAP[r1];

		if (c0 == 0xff || c1 == 0xff) {
			goto invalid;
		}

		uint32_t carry = (uint32_t)c0 * BASE + c1;

		size_t i = 0;
		for (size_t it = size; (carry != 0 || i < length) && it > 0; it--, i++) {
			carry += (uint32_t)BASE2 * b256[it - 1];
			b256[it - 1] = carry & 0xff;
			carry >>= 8;
		}

		length = i;
		psz += 2;
	}

	if (psz < str_len) {
		uint8_t r = (uint8_t)str[psz];

		if (r & 0x80) {
			goto invalid;
		}

		uint8_t c = BASE58BTC_MAP[r];
		if (c == 0xff) {
			goto invalid;
		}

		uint32_t carry = c;
		size_t i = 0;
		for (size_t it = size; (carry != 0 || i < length) && it > 0; it--, i++) {
			carry += (uint32_t)BASE * b256[it - 1];
			b256[it - 1] = carry & 0xff;
			carry >>= 8;
		}

		length = i;
	}

	if (str_heap) free(str);

	{
		// skip leading zeroes in b256
		size_t it = size - length;
		while (it < size && b256[it] == 0) {
			it++;
		}

		// build output
		size_t out_len = zeroes + (size - it);
		uint8_t *out = (uint8_t *)malloc(out_len);
		if (!out) {
			if (b256_heap) free(b256);
			napi_throw_error(env, NULL, "allocation failed");
			return NULL;
		}

		memset(out, 0, zeroes);
		memcpy(out + zeroes, b256 + it, size - it);

		if (b256_heap) free(b256);

		napi_value result;
		napi_create_external_buffer(env, out_len, (char *)out, finalize_external_bytes, NULL, &result);
		return result;
	}

invalid:
	if (str_heap) free(str);
	if (b256_heap) free(b256);
	napi_throw_error(env, NULL, "invalid string");
	return NULL;
}

static napi_value init(napi_env env, napi_value exports) {
	napi_property_descriptor descs[] = {
		{ "encode", NULL, base58_encode, NULL, NULL, NULL, napi_default, NULL },
		{ "decode", NULL, base58_decode, NULL, NULL, NULL, napi_default, NULL },
	};
	napi_define_properties(env, exports, 2, descs);
	return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, init)
