import { State } from '@voiceflow/runtime';

import { S, T } from '@/lib/constants';

import { AbstractManager } from '../../../types';

class ContextManager extends AbstractManager {
  async build(versionID: string, userID: string) {
    const { state, voiceflow } = this.services;

    const rawState = (await state.getFromDb(userID)) as State;

    const context = voiceflow.client.createContext(versionID, rawState);

    context.turn.set(T.PREVIOUS_OUTPUT, context.storage.get(S.OUTPUT));
    context.storage.set(S.OUTPUT, '');

    return context;
  }
}

export default ContextManager;
