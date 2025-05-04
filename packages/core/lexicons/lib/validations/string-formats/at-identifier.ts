import { isIdentifier } from '../../syntax/at-identifier.js';

import { _createStringFormat } from '../schemas/string.js';

// #__NO_SIDE_EFFECTS__
export const identifierString = /*#__PURE__*/ _createStringFormat('at-identifier', isIdentifier);
