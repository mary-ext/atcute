import { isDid } from '../../syntax/did.js';

import { _createStringFormat } from '../schemas/string.js';

// #__NO_SIDE_EFFECTS__
export const didString = /*#__PURE__*/ _createStringFormat('did', isDid);
