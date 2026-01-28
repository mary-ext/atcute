/**
 * MIME type validation and matching for blob permissions
 */

// valid mime type pattern: type/subtype (no wildcards)
const MIME_RE = /^[a-z0-9][a-z0-9!#$&\-^_.+]*\/[a-z0-9][a-z0-9!#$&\-^_.+]*$/i;

// valid accept pattern: type/subtype or type/* or */*
const ACCEPT_RE = /^(\*|[a-z0-9][a-z0-9!#$&\-^_.+]*)\/(\*|[a-z0-9][a-z0-9!#$&\-^_.+]*)$/i;

/**
 * checks if value is a valid MIME type (no wildcards)
 * @param value the value to check
 * @returns true if valid MIME type
 */
export const isMime = (value: unknown): value is string => {
	return typeof value === 'string' && MIME_RE.test(value);
};

/**
 * checks if value is a valid accept pattern (allows wildcards)
 * @param value the value to check
 * @returns true if valid accept pattern
 */
export const isAccept = (value: unknown): value is string => {
	if (typeof value !== 'string') {
		return false;
	}

	const match = ACCEPT_RE.exec(value);
	if (!match) {
		return false;
	}

	// can't have wildcard type with specific subtype (e.g., */png is invalid)
	const [, type, subtype] = match;
	if (type === '*' && subtype !== '*') {
		return false;
	}

	return true;
};

/**
 * checks if an accept pattern matches a specific MIME type
 * @param accept the accept pattern (e.g., 'image/*', '*\/*')
 * @param mime the MIME type to match against
 * @returns true if the accept pattern covers the MIME type
 */
export const matchesAccept = (accept: string, mime: string): boolean => {
	// validate the mime type first
	if (!isMime(mime)) {
		return false;
	}

	// full wildcard matches everything
	if (accept === '*/*') {
		return true;
	}

	const slashIdx = accept.indexOf('/');
	if (slashIdx === -1) {
		return false;
	}

	const acceptType = accept.slice(0, slashIdx);
	const acceptSubtype = accept.slice(slashIdx + 1);

	const mimeSlashIdx = mime.indexOf('/');
	const mimeType = mime.slice(0, mimeSlashIdx);
	const mimeSubtype = mime.slice(mimeSlashIdx + 1);

	// type must match
	if (acceptType !== mimeType) {
		return false;
	}

	// subtype wildcard or exact match
	return acceptSubtype === '*' || acceptSubtype.toLowerCase() === mimeSubtype.toLowerCase();
};

/**
 * checks if any accept pattern in the array matches the MIME type
 * @param accepts array of accept patterns
 * @param mime the MIME type to match against
 * @returns true if any pattern matches
 */
export const matchesAnyAccept = (accepts: readonly string[], mime: string): boolean => {
	for (const accept of accepts) {
		if (matchesAccept(accept, mime)) {
			return true;
		}
	}
	return false;
};

/**
 * checks if an accept pattern is redundant given another pattern
 * e.g., 'image/png' is redundant if 'image/*' is present
 */
export const isRedundantAccept = (accept: string, other: string): boolean => {
	if (other === '*/*') {
		return true;
	}

	if (accept === other) {
		return true;
	}

	const slashIdx = other.indexOf('/');
	if (slashIdx === -1) {
		return false;
	}

	const otherSubtype = other.slice(slashIdx + 1);
	if (otherSubtype !== '*') {
		return false;
	}

	// other is type/*, check if accept has same type
	const otherType = other.slice(0, slashIdx);
	const acceptSlashIdx = accept.indexOf('/');
	const acceptType = accept.slice(0, acceptSlashIdx);

	return acceptType.toLowerCase() === otherType.toLowerCase();
};
