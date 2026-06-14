/**
 * self-contained grapheme cluster counter for NAPI.
 * break tables derived from libgrapheme (ISC license), Unicode 17.0.0.
 * includes ASCII fast path and inlined UTF-8 decoder.
 */

#include "napi_utils.h"
#include <node_api.h>
#include <stdint.h>
#include <stdlib.h>

#define STACK_BUF_MAX 4096

// #region helpers

#ifdef __has_builtin
#if __has_builtin(__builtin_expect)
#define likely(expr)   __builtin_expect(!!(expr), 1)
#define unlikely(expr) __builtin_expect(!!(expr), 0)
#else
#define likely(expr)   (expr)
#define unlikely(expr) (expr)
#endif
#else
#define likely(expr)   (expr)
#define unlikely(expr) (expr)
#endif

// #endregion

// #region generated grapheme break property tables (Unicode 17.0.0)
#include "unicode/grapheme-table.h"
_Static_assert(NUM_CHAR_BREAK_PROPS <= 32, "bitmask tables require NUM_CHAR_BREAK_PROPS <= 32");

/** looks up the grapheme break property of a codepoint through the two-stage table */
static inline uint32_t char_break_prop(uint32_t cp) {
	return char_break_minor[char_break_major[cp >> 8] + (cp & 0xFF)];
}
// #endregion

// #region break rules (UAX #29)

static const uint32_t dont_break_tbl[NUM_CHAR_BREAK_PROPS] = {
	[CHAR_BREAK_PROP_OTHER] =
		(1u << CHAR_BREAK_PROP_EXTEND) | (1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_EXTEND) |
		(1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_LINKER) | (1u << CHAR_BREAK_PROP_ZWJ) |
		(1u << CHAR_BREAK_PROP_BOTH_ZWJ_ICB_EXTEND) | (1u << CHAR_BREAK_PROP_SPACINGMARK),
	[CHAR_BREAK_PROP_ICB_CONSONANT] =
		(1u << CHAR_BREAK_PROP_EXTEND) | (1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_EXTEND) |
		(1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_LINKER) | (1u << CHAR_BREAK_PROP_ZWJ) |
		(1u << CHAR_BREAK_PROP_BOTH_ZWJ_ICB_EXTEND) | (1u << CHAR_BREAK_PROP_SPACINGMARK),
	[CHAR_BREAK_PROP_ICB_EXTEND] =
		(1u << CHAR_BREAK_PROP_EXTEND) | (1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_EXTEND) |
		(1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_LINKER) | (1u << CHAR_BREAK_PROP_ZWJ) |
		(1u << CHAR_BREAK_PROP_BOTH_ZWJ_ICB_EXTEND) | (1u << CHAR_BREAK_PROP_SPACINGMARK),
	[CHAR_BREAK_PROP_ICB_LINKER] =
		(1u << CHAR_BREAK_PROP_EXTEND) | (1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_EXTEND) |
		(1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_LINKER) | (1u << CHAR_BREAK_PROP_ZWJ) |
		(1u << CHAR_BREAK_PROP_BOTH_ZWJ_ICB_EXTEND) | (1u << CHAR_BREAK_PROP_SPACINGMARK),
	[CHAR_BREAK_PROP_CR] = (1u << CHAR_BREAK_PROP_LF),
	[CHAR_BREAK_PROP_EXTEND] =
		(1u << CHAR_BREAK_PROP_EXTEND) | (1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_EXTEND) |
		(1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_LINKER) | (1u << CHAR_BREAK_PROP_ZWJ) |
		(1u << CHAR_BREAK_PROP_BOTH_ZWJ_ICB_EXTEND) | (1u << CHAR_BREAK_PROP_SPACINGMARK),
	[CHAR_BREAK_PROP_BOTH_EXTEND_ICB_EXTEND] =
		(1u << CHAR_BREAK_PROP_EXTEND) | (1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_EXTEND) |
		(1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_LINKER) | (1u << CHAR_BREAK_PROP_ZWJ) |
		(1u << CHAR_BREAK_PROP_BOTH_ZWJ_ICB_EXTEND) | (1u << CHAR_BREAK_PROP_SPACINGMARK),
	[CHAR_BREAK_PROP_BOTH_EXTEND_ICB_LINKER] =
		(1u << CHAR_BREAK_PROP_EXTEND) | (1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_EXTEND) |
		(1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_LINKER) | (1u << CHAR_BREAK_PROP_ZWJ) |
		(1u << CHAR_BREAK_PROP_BOTH_ZWJ_ICB_EXTEND) | (1u << CHAR_BREAK_PROP_SPACINGMARK),
	[CHAR_BREAK_PROP_EXTENDED_PICTOGRAPHIC] =
		(1u << CHAR_BREAK_PROP_EXTEND) | (1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_EXTEND) |
		(1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_LINKER) | (1u << CHAR_BREAK_PROP_ZWJ) |
		(1u << CHAR_BREAK_PROP_BOTH_ZWJ_ICB_EXTEND) | (1u << CHAR_BREAK_PROP_SPACINGMARK),
	[CHAR_BREAK_PROP_HANGUL_L] =
		(1u << CHAR_BREAK_PROP_HANGUL_L) | (1u << CHAR_BREAK_PROP_HANGUL_V) |
		(1u << CHAR_BREAK_PROP_HANGUL_LV) | (1u << CHAR_BREAK_PROP_HANGUL_LVT) |
		(1u << CHAR_BREAK_PROP_EXTEND) | (1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_EXTEND) |
		(1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_LINKER) | (1u << CHAR_BREAK_PROP_ZWJ) |
		(1u << CHAR_BREAK_PROP_BOTH_ZWJ_ICB_EXTEND) | (1u << CHAR_BREAK_PROP_SPACINGMARK),
	[CHAR_BREAK_PROP_HANGUL_V] =
		(1u << CHAR_BREAK_PROP_HANGUL_V) | (1u << CHAR_BREAK_PROP_HANGUL_T) |
		(1u << CHAR_BREAK_PROP_EXTEND) | (1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_EXTEND) |
		(1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_LINKER) | (1u << CHAR_BREAK_PROP_ZWJ) |
		(1u << CHAR_BREAK_PROP_BOTH_ZWJ_ICB_EXTEND) | (1u << CHAR_BREAK_PROP_SPACINGMARK),
	[CHAR_BREAK_PROP_HANGUL_T] =
		(1u << CHAR_BREAK_PROP_HANGUL_T) |
		(1u << CHAR_BREAK_PROP_EXTEND) | (1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_EXTEND) |
		(1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_LINKER) | (1u << CHAR_BREAK_PROP_ZWJ) |
		(1u << CHAR_BREAK_PROP_BOTH_ZWJ_ICB_EXTEND) | (1u << CHAR_BREAK_PROP_SPACINGMARK),
	[CHAR_BREAK_PROP_HANGUL_LV] =
		(1u << CHAR_BREAK_PROP_HANGUL_V) | (1u << CHAR_BREAK_PROP_HANGUL_T) |
		(1u << CHAR_BREAK_PROP_EXTEND) | (1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_EXTEND) |
		(1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_LINKER) | (1u << CHAR_BREAK_PROP_ZWJ) |
		(1u << CHAR_BREAK_PROP_BOTH_ZWJ_ICB_EXTEND) | (1u << CHAR_BREAK_PROP_SPACINGMARK),
	[CHAR_BREAK_PROP_HANGUL_LVT] =
		(1u << CHAR_BREAK_PROP_HANGUL_T) |
		(1u << CHAR_BREAK_PROP_EXTEND) | (1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_EXTEND) |
		(1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_LINKER) | (1u << CHAR_BREAK_PROP_ZWJ) |
		(1u << CHAR_BREAK_PROP_BOTH_ZWJ_ICB_EXTEND) | (1u << CHAR_BREAK_PROP_SPACINGMARK),
	[CHAR_BREAK_PROP_PREPEND] =
		(1u << CHAR_BREAK_PROP_EXTEND) | (1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_EXTEND) |
		(1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_LINKER) | (1u << CHAR_BREAK_PROP_ZWJ) |
		(1u << CHAR_BREAK_PROP_BOTH_ZWJ_ICB_EXTEND) | (1u << CHAR_BREAK_PROP_SPACINGMARK) |
		(0xFFFFFFFFu & ~((1u << CHAR_BREAK_PROP_CR) | (1u << CHAR_BREAK_PROP_LF) | (1u << CHAR_BREAK_PROP_CONTROL))),
	[CHAR_BREAK_PROP_REGIONAL_INDICATOR] =
		(1u << CHAR_BREAK_PROP_EXTEND) | (1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_EXTEND) |
		(1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_LINKER) | (1u << CHAR_BREAK_PROP_ZWJ) |
		(1u << CHAR_BREAK_PROP_BOTH_ZWJ_ICB_EXTEND) | (1u << CHAR_BREAK_PROP_SPACINGMARK),
	[CHAR_BREAK_PROP_SPACINGMARK] =
		(1u << CHAR_BREAK_PROP_EXTEND) | (1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_EXTEND) |
		(1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_LINKER) | (1u << CHAR_BREAK_PROP_ZWJ) |
		(1u << CHAR_BREAK_PROP_BOTH_ZWJ_ICB_EXTEND) | (1u << CHAR_BREAK_PROP_SPACINGMARK),
	[CHAR_BREAK_PROP_ZWJ] =
		(1u << CHAR_BREAK_PROP_EXTEND) | (1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_EXTEND) |
		(1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_LINKER) | (1u << CHAR_BREAK_PROP_ZWJ) |
		(1u << CHAR_BREAK_PROP_BOTH_ZWJ_ICB_EXTEND) | (1u << CHAR_BREAK_PROP_SPACINGMARK),
	[CHAR_BREAK_PROP_BOTH_ZWJ_ICB_EXTEND] =
		(1u << CHAR_BREAK_PROP_EXTEND) | (1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_EXTEND) |
		(1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_LINKER) | (1u << CHAR_BREAK_PROP_ZWJ) |
		(1u << CHAR_BREAK_PROP_BOTH_ZWJ_ICB_EXTEND) | (1u << CHAR_BREAK_PROP_SPACINGMARK),
};

static const uint32_t gb11_update[2 * NUM_CHAR_BREAK_PROPS] = {
	[CHAR_BREAK_PROP_EXTENDED_PICTOGRAPHIC] =
		(1u << CHAR_BREAK_PROP_ZWJ) | (1u << CHAR_BREAK_PROP_BOTH_ZWJ_ICB_EXTEND) |
		(1u << CHAR_BREAK_PROP_EXTEND) | (1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_EXTEND) |
		(1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_LINKER),
	[CHAR_BREAK_PROP_ZWJ + NUM_CHAR_BREAK_PROPS] = (1u << CHAR_BREAK_PROP_EXTENDED_PICTOGRAPHIC),
	[CHAR_BREAK_PROP_BOTH_ZWJ_ICB_EXTEND + NUM_CHAR_BREAK_PROPS] = (1u << CHAR_BREAK_PROP_EXTENDED_PICTOGRAPHIC),
	[CHAR_BREAK_PROP_EXTEND + NUM_CHAR_BREAK_PROPS] =
		(1u << CHAR_BREAK_PROP_EXTEND) | (1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_EXTEND) |
		(1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_LINKER) | (1u << CHAR_BREAK_PROP_ZWJ) |
		(1u << CHAR_BREAK_PROP_BOTH_ZWJ_ICB_EXTEND),
	[CHAR_BREAK_PROP_BOTH_EXTEND_ICB_EXTEND + NUM_CHAR_BREAK_PROPS] =
		(1u << CHAR_BREAK_PROP_EXTEND) | (1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_EXTEND) |
		(1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_LINKER) | (1u << CHAR_BREAK_PROP_ZWJ) |
		(1u << CHAR_BREAK_PROP_BOTH_ZWJ_ICB_EXTEND),
	[CHAR_BREAK_PROP_BOTH_EXTEND_ICB_LINKER + NUM_CHAR_BREAK_PROPS] =
		(1u << CHAR_BREAK_PROP_EXTEND) | (1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_EXTEND) |
		(1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_LINKER) | (1u << CHAR_BREAK_PROP_ZWJ) |
		(1u << CHAR_BREAK_PROP_BOTH_ZWJ_ICB_EXTEND),
	[CHAR_BREAK_PROP_EXTENDED_PICTOGRAPHIC + NUM_CHAR_BREAK_PROPS] =
		(1u << CHAR_BREAK_PROP_ZWJ) | (1u << CHAR_BREAK_PROP_BOTH_ZWJ_ICB_EXTEND) |
		(1u << CHAR_BREAK_PROP_EXTEND) | (1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_EXTEND) |
		(1u << CHAR_BREAK_PROP_BOTH_EXTEND_ICB_LINKER),
};
static const uint32_t gb11_dont_break[2 * NUM_CHAR_BREAK_PROPS] = {
	[CHAR_BREAK_PROP_ZWJ + NUM_CHAR_BREAK_PROPS] = (1u << CHAR_BREAK_PROP_EXTENDED_PICTOGRAPHIC),
	[CHAR_BREAK_PROP_BOTH_ZWJ_ICB_EXTEND + NUM_CHAR_BREAK_PROPS] = (1u << CHAR_BREAK_PROP_EXTENDED_PICTOGRAPHIC),
};
// #endregion

// #region grapheme counter

static inline bool is_gb9c_extend(uint32_t p) {
	return p == CHAR_BREAK_PROP_ICB_EXTEND ||
	       p == CHAR_BREAK_PROP_BOTH_ZWJ_ICB_EXTEND ||
	       p == CHAR_BREAK_PROP_BOTH_EXTEND_ICB_EXTEND;
}

static inline bool is_gb9c_linker(uint32_t p) {
	return p == CHAR_BREAK_PROP_ICB_LINKER ||
	       p == CHAR_BREAK_PROP_BOTH_EXTEND_ICB_LINKER;
}

/** whether cp is a precomposed Hangul syllable (U+AC00..U+D7A3); each forms its own grapheme */
static inline bool is_hangul_syllable(uint32_t cp) {
	return cp - 0xAC00u <= 0xD7A3u - 0xAC00u;
}

static inline int ascii_grapheme_count(const char16_t *str, int len) {
	int count = len;

	for (int i = 0; i + 1 < len; i++) {
		if (str[i] == 0x0D && str[i+1] == 0x0A) {
			count--;
		}
	}

	return count;
}

static inline uint8_t advance_gb9c(uint8_t state, uint32_t prop) {
	if (state == 0) {
		return prop == CHAR_BREAK_PROP_ICB_CONSONANT ? 1 : 0;
	}

	if (is_gb9c_extend(prop)) {
		return state == 3 ? 3 : 2;
	}

	if (is_gb9c_linker(prop)) {
		return 3;
	}

	return prop == CHAR_BREAK_PROP_ICB_CONSONANT ? 1 : 0;
}

static inline bool advance_gb12_13(bool state, uint32_t p0, uint32_t p1) {
	return !state &&
		p0 == CHAR_BREAK_PROP_REGIONAL_INDICATOR &&
		p1 == CHAR_BREAK_PROP_REGIONAL_INDICATOR;
}

typedef struct {
	bool gb11;
	bool gb12_13;
	uint8_t gb9c;
} grapheme_break_state;

/** returns true if there is a grapheme cluster boundary between p0 and p1 */
static inline bool is_grapheme_break(grapheme_break_state *st, uint32_t p0, uint32_t p1) {
	uint32_t p1_mask = 1u << p1;
	const uint32_t *gb11_update_row = gb11_update + (NUM_CHAR_BREAK_PROPS * st->gb11);

	st->gb11 = (gb11_update_row[p0] & p1_mask) != 0;
	st->gb12_13 = advance_gb12_13(st->gb12_13, p0, p1);
	st->gb9c = advance_gb9c(st->gb9c, p0);
	const uint32_t *gb11_dont_break_row = gb11_dont_break + (NUM_CHAR_BREAK_PROPS * st->gb11);

	bool no_break =
		(dont_break_tbl[p0] & p1_mask) ||
		(st->gb9c == 3 && p1 == CHAR_BREAK_PROP_ICB_CONSONANT) ||
		(gb11_dont_break_row[p0] & p1_mask) ||
		st->gb12_13;

	if (!no_break) {
		st->gb11 = false;
		st->gb12_13 = false;
	}

	return !no_break;
}

static int grapheme_count_impl(const char16_t *str, int len, int max_len) {
	if (len == 0) return 0;

	int i = 0;

	// fast ASCII prefix: skip in chunks of 8
	{
		int ascii_end = len - 7;
		while (i < ascii_end) {
			uint16_t m = str[i] | str[i+1] | str[i+2] | str[i+3] |
			             str[i+4] | str[i+5] | str[i+6] | str[i+7];
			if (m > 0x7F) break;
			i += 8;
		}
		while (i < len && str[i] <= 0x7F) {
			i++;
		}
		if (i == len) {
			return ascii_grapheme_count(str, len);
		}
	}

	// count graphemes in the ASCII prefix (adjusting for CRLF)
	int count = i;
	for (int j = 0; j + 1 < i; j++) {
		if (str[j] == 0x0D && str[j+1] == 0x0A) {
			count--;
		}
	}

	// set up state machine from the last ASCII character (if any)
	grapheme_break_state st = {0};
	uint32_t p0;

	if (i > 0) {
		p0 = char_break_prop(str[i - 1]);
	} else {
		// string starts with non-ASCII; decode first char properly
		uint32_t first = str[0];
		if (first >= 0xD800 && first <= 0xDBFF && len >= 2) {
			uint32_t second = str[1];
			if (second >= 0xDC00 && second <= 0xDFFF) {
				uint32_t cp = 0x10000 + ((first - 0xD800) << 10) + (second - 0xDC00);
				if (cp >= 0x1F1E6 && cp <= 0x1F1FF) {
					p0 = CHAR_BREAK_PROP_REGIONAL_INDICATOR;
				} else {
					p0 = char_break_prop(cp);
				}
				i = 2;
			} else {
				p0 = char_break_prop(0xFFFD);
				i = 1;
			}
		} else if (first >= 0xDC00 && first <= 0xDFFF) {
			p0 = char_break_prop(0xFFFD);
			i = 1;
		} else {
			p0 = char_break_prop(first);
			i = 1;
		}
		count = 1;
	}

	// single pass with inline surrogate handling
	while (i < len) {
		uint32_t first = str[i];

		if (likely(first < 0xD800 || first > 0xDFFF)) {
			uint32_t p1 = char_break_prop(first);

			if (p0 == CHAR_BREAK_PROP_OTHER && p1 == CHAR_BREAK_PROP_OTHER) {
				// GB999: OTHER↔OTHER always breaks, and the break-state is already cleared.
				// p0 stays OTHER, so opportunistically devour a printable-ASCII run (all OTHER)
				// without further table lookups.
				count++;
				i++;
				while (i < len && str[i] >= 0x20 && str[i] <= 0x7E) {
					count++;
					i++;
				}
				if (max_len >= 0 && count > max_len) {
					return count;
				}
				continue;
			}

			if ((p0 == CHAR_BREAK_PROP_HANGUL_LV || p0 == CHAR_BREAK_PROP_HANGUL_LVT) &&
			    is_hangul_syllable(first)) {
				// GB6/GB7/GB8: precomposed Hangul syllables always break from one another, and a
				// preceding syllable guarantees the break-state is already cleared. devour the run
				// without the state machine, stopping before any trailing jamo or combining mark so
				// the transition out of the run is resolved normally.
				count++;
				i++;
				while (i < len && is_hangul_syllable(str[i])) {
					count++;
					i++;
				}
				if (max_len >= 0 && count > max_len) {
					return count;
				}
				p0 = char_break_prop(str[i - 1]);
				continue;
			}

			if (is_grapheme_break(&st, p0, p1)) {
				count++;
				if (max_len >= 0 && count > max_len) {
					return count;
				}
			}

			p0 = p1;
			i++;
		} else if (first <= 0xDBFF && i + 1 < len) {
			uint32_t second = str[i + 1];
			if (second >= 0xDC00 && second <= 0xDFFF) {
				uint32_t cp = 0x10000 + ((first - 0xD800) << 10) + (second - 0xDC00);
				uint32_t p1;

				if (cp >= 0x1F1E6 && cp <= 0x1F1FF) {
					p1 = CHAR_BREAK_PROP_REGIONAL_INDICATOR;
				} else {
					p1 = char_break_prop(cp);
				}

				if (is_grapheme_break(&st, p0, p1)) {
					count++;
					if (max_len >= 0 && count > max_len) {
						return count;
					}
				}

				p0 = p1;
				i += 2;
			} else {
				uint32_t p1 = char_break_prop(0xFFFD);
				if (is_grapheme_break(&st, p0, p1)) count++;
				p0 = p1;
				i++;
			}
		} else {
			uint32_t p1 = char_break_prop(0xFFFD);
			if (is_grapheme_break(&st, p0, p1)) count++;
			p0 = p1;
			i++;
		}
	}

	return count;
}

static int grapheme_count(const char16_t *str, int len) {
	return grapheme_count_impl(str, len, -1);
}

static bool grapheme_count_in_range(const char16_t *str, int len, int min_len, int max_len) {
	if (len == 0) return min_len == 0;
	int count = grapheme_count_impl(str, len, max_len);
	if (count > max_len) {
		return false;
	}
	return count >= min_len;
}

// #endregion

// #region NAPI exports

/**
 * loads a JS string as UTF-16 into the caller's stack buffer, falling back to a heap allocation only
 * when the string overflows it. this copies in a single NAPI call for the common (short) case rather
 * than the usual query-length-then-copy pair. on return *out_buf points at the data and must be freed
 * iff it differs from stack_buf.
 */
static napi_status load_string_utf16(napi_env env, napi_value value, char16_t *stack_buf, char16_t **out_buf, size_t *out_len) {
	size_t len;
	NAPI_CHECKED(napi_get_value_string_utf16(env, value, stack_buf, STACK_BUF_MAX, &len));

	// a full buffer means the string may have been truncated; re-query its exact length to be sure
	if (len == STACK_BUF_MAX - 1) {
		size_t full_len;
		NAPI_CHECKED(napi_get_value_string_utf16(env, value, NULL, 0, &full_len));
		if (full_len >= STACK_BUF_MAX) {
			char16_t *heap = (char16_t *)malloc((full_len + 1) * sizeof(char16_t));
			NAPI_CHECK_ALLOC(env, heap);

			NAPI_CHECKED_CLEANUP(napi_get_value_string_utf16(env, value, heap, full_len + 1, &full_len), {
				free(heap);
			});

			*out_buf = heap;
			*out_len = full_len;
			return napi_ok;
		}
	}

	*out_buf = stack_buf;
	*out_len = len;
	return napi_ok;
}

static napi_value napi_get_grapheme_length(napi_env env, napi_callback_info info) {
	NAPI_GET_ARGS(env, info, 1);

	char16_t stack_buf[STACK_BUF_MAX];
	char16_t *buf;
	size_t utf16_len;
	NAPI_CALL_TYPE_ERROR_ON_STATUS(
		env,
		load_string_utf16(env, argv[0], stack_buf, &buf, &utf16_len),
		napi_string_expected,
		ERR_INVALID_ARG,
		"invalid argument: expected string"
	);

	int result_count = grapheme_count(buf, (int)utf16_len);

	if (buf != stack_buf) free(buf);

	napi_value result;
	NAPI_CALL(env, napi_create_int32(env, result_count, &result));
	return result;
}

static napi_value napi_is_grapheme_length_in_range(napi_env env, napi_callback_info info) {
	NAPI_GET_ARGS(env, info, 3);

	int32_t min_len, max_len;
	char16_t stack_buf[STACK_BUF_MAX];
	char16_t *buf = stack_buf;
	size_t utf16_len;

	NAPI_CALL_TYPE_ERROR_ON_STATUS(
		env,
		napi_get_value_string_utf16(env, argv[0], stack_buf, STACK_BUF_MAX, &utf16_len),
		napi_string_expected,
		ERR_INVALID_ARG,
		"invalid 1st argument: expected string"
	);

	NAPI_CALL_TYPE_ERROR_ON_STATUS(
		env,
		napi_get_value_int32(env, argv[1], &min_len),
		napi_number_expected,
		ERR_INVALID_ARG,
		"invalid 2nd argument: expected number"
	);

	NAPI_CALL_TYPE_ERROR_ON_STATUS(
		env,
		napi_get_value_int32(env, argv[2], &max_len),
		napi_number_expected,
		ERR_INVALID_ARG,
		"invalid 3rd argument: expected number"
	);

	// a full buffer means the string may have been truncated; re-query its exact length to be sure
	if (utf16_len == STACK_BUF_MAX - 1) {
		size_t full_len;
		NAPI_CALL(env, napi_get_value_string_utf16(env, argv[0], NULL, 0, &full_len));
		if (full_len >= STACK_BUF_MAX) {
			// the string overflows the buffer. grapheme count only grows with length, so if the prefix
			// already loaded exceeds max the whole string does too — reject without copying the rest.
			// drop a trailing high surrogate first so a pair split at the boundary can't over-count.
			int prefix_len = STACK_BUF_MAX - 1;
			if (stack_buf[prefix_len - 1] >= 0xD800 && stack_buf[prefix_len - 1] <= 0xDBFF) {
				prefix_len--;
			}
			if (grapheme_count_impl(stack_buf, prefix_len, max_len) > max_len) {
				napi_value r;
				NAPI_CALL(env, napi_get_boolean(env, false, &r));
				return r;
			}

			buf = (char16_t *)malloc((full_len + 1) * sizeof(char16_t));
			NAPI_CHECK_ALLOC(env, buf);

			NAPI_CALL_CLEANUP(env, napi_get_value_string_utf16(env, argv[0], buf, full_len + 1, &full_len), {
				free(buf);
			});
			utf16_len = full_len;
		}
	}

	bool in_range;
	if ((int32_t)utf16_len < min_len) {
		in_range = false;
	} else if (min_len == 0 && (int32_t)utf16_len <= max_len) {
		in_range = true;
	} else {
		in_range = grapheme_count_in_range(buf, (int)utf16_len, min_len, max_len);
	}

	if (buf != stack_buf) free(buf);

	napi_value r;
	NAPI_CALL(env, napi_get_boolean(env, in_range, &r));
	return r;
}

static napi_value init(napi_env env, napi_value exports) {
	napi_property_descriptor descs[] = {
		{ "getGraphemeLength", NULL, napi_get_grapheme_length, NULL, NULL, NULL, napi_default, NULL },
		{ "isGraphemeLengthInRange", NULL, napi_is_grapheme_length_in_range, NULL, NULL, NULL, napi_default, NULL },
	};
	napi_define_properties(env, exports, 2, descs);
	return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, init)

// #endregion
