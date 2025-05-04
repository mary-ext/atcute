import { isRecordKey } from '../../syntax/record-key.js';

import { _createStringFormat } from '../schemas/string.js';

// #__NO_SIDE_EFFECTS__
export const recordKeyString = /*#__PURE__*/ _createStringFormat('record-key', isRecordKey);
