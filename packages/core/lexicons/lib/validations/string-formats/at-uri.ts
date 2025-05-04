import { isResourceUri } from '../../syntax/at-uri.js';

import { _createStringFormat } from '../schemas/string.js';

// #__NO_SIDE_EFFECTS__
export const resourceUriString = /*#__PURE__*/ _createStringFormat('at-uri', isResourceUri);
