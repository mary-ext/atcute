import { isLanguageCode } from '../../syntax/language.js';

import { _createStringFormat } from '../schemas/string.js';

// #__NO_SIDE_EFFECTS__
export const languageCodeString = /*#__PURE__*/ _createStringFormat('language', isLanguageCode);
