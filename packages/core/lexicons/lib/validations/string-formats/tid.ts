import { isTid } from '../../syntax/tid.js';

import { _createStringFormat } from '../schemas/string.js';

// #__NO_SIDE_EFFECTS__
export const tidString = /*#__PURE__*/ _createStringFormat('tid', isTid);
