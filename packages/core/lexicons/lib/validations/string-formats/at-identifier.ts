import { isActorIdentifier } from '../../syntax/at-identifier.js';

import { _createStringFormat } from '../schemas/string.js';

// #__NO_SIDE_EFFECTS__
export const actorIdentifierString = /*#__PURE__*/ _createStringFormat('at-identifier', isActorIdentifier);
