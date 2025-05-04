import { isGenericUri } from '../../syntax/uri.js';

import { _createStringFormat } from '../schemas/string.js';

// #__NO_SIDE_EFFECTS__
export const genericUriString = /*#__PURE__*/ _createStringFormat('uri', isGenericUri);
