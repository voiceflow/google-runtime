import CaptureHandler from './capture';
import CardHandler, { CardResponseBuilder } from './card';
import ChoiceHandler from './choice';
import InteractionHandler from './interaction';
import ResetHandler from './reset';
import SpeakHandler from './speak';
import StreamHandler, { StreamResponseBuilder } from './stream';

export const responseHandlers = [CardResponseBuilder, StreamResponseBuilder];

export default [SpeakHandler, CaptureHandler, InteractionHandler, ResetHandler, CardHandler, ChoiceHandler, StreamHandler];
