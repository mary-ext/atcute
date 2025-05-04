import { isNsid } from '../../syntax/nsid.js';

import { _createStringFormat } from '../schemas/string.js';

// #__NO_SIDE_EFFECTS__
export const nsidString = /*#__PURE__*/ _createStringFormat('nsid', isNsid);
