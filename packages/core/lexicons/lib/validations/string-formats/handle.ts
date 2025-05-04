import { isHandle } from '../../syntax/handle.js';

import { _createStringFormat } from '../schemas/string.js';

// #__NO_SIDE_EFFECTS__
export const handleString = /*#__PURE__*/ _createStringFormat('handle', isHandle);
