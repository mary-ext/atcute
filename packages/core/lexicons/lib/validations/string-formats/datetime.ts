import { isDatetime } from '../../syntax/datetime.js';

import { _createStringFormat } from '../schemas/string.js';

// #__NO_SIDE_EFFECTS__
export const datetimeString = /*#__PURE__*/ _createStringFormat('datetime', isDatetime);
