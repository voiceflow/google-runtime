import { Command, Context, extractFrameCommand, Frame, Store } from '@voiceflow/client';

import { F, T } from '@/lib/constants';

import { IntentName, IntentRequest, Mapping, RequestType } from '../types';
import { mapSlots } from '../utils';

export const getCommand = (context: Context, extractFrame: typeof extractFrameCommand) => {
  const request = context.turn.get(T.REQUEST) as IntentRequest;

  if (request?.type !== RequestType.INTENT) return null;

  const { intent, slots } = request.payload;

  // don't act on a catchall intent
  if (intent === IntentName.VOICEFLOW) return null;

  const matcher = (command: Command | null) => command?.intent === intent;

  const res = extractFrame(context.stack, matcher);
  if (!res) return null;

  return {
    ...res,
    intent,
    slots,
  };
};

const utilsObj = {
  getCommand: (context: Context) => getCommand(context, extractFrameCommand),
  mapSlots,
  Frame,
};

/**
 * The Command Handler is meant to be used inside other handlers, and should never handle blocks directly
 */
export const CommandHandler = (utils: typeof utilsObj) => ({
  canHandle: (context: Context): boolean => {
    return !!utils.getCommand(context);
  },
  handle: (context: Context, variables: Store): string | null => {
    const res = utils.getCommand(context);
    if (!res) return null;

    let nextId: string | null = null;
    let variableMap: Mapping[] | undefined;

    if (res.command) {
      const { index, command } = res;

      variableMap = command.mappings;

      if (command.diagram_id) {
        context.stack.top().storage.set(F.CALLED_COMMAND, true);

        // Reset state to beginning of new diagram and store current line to the stack
        const newFrame = new utils.Frame({ diagramID: command.diagram_id });
        context.stack.push(newFrame);
      } else if (command.next) {
        if (index < context.stack.getSize() - 1) {
          // otherwise destructive and pop off everything before the command
          context.stack.popTo(index + 1);
          context.stack.top().setBlockID(command.next);
        } else if (index === context.stack.getSize() - 1) {
          // jumping to an intent within the same flow
          nextId = command.next;
        }
      }
    }

    context.turn.delete(T.REQUEST);

    if (variableMap && res.slots) {
      // map request mappings to variables
      variables.merge(utils.mapSlots(variableMap, res.slots));
    }

    return nextId;
  },
});

export default () => CommandHandler(utilsObj);
