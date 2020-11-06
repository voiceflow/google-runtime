import { SlotMapping } from '@voiceflow/general-types';
import { Context, formatIntentName, replaceVariables, Store, transformStringVariableToNumber } from '@voiceflow/runtime';
import _ from 'lodash';

import { S, T } from '@/lib/constants';

type GoogleDateTimeSlot = {
  seconds: number;
  day: number;
  hours: number;
  nanos: number;
  year: number;
  minutes: number;
  month: number;
};

export const transformDateTimeVariableToString = (date: GoogleDateTimeSlot) => {
  if (!date.year && !date.hours) return ''; // not GoogleDateTime type

  // time type
  if (!date.year) return `${date.hours}:${date.minutes}`;

  // date type
  if (!date.hours) return `${date.day}/${date.month}/${date.year}`;

  // datetime type
  return `${date.day}/${date.month}/${date.year} ${date.hours}:${date.minutes}`;
};

export const mapSlots = (mappings: SlotMapping[], slots: { [key: string]: string }, overwrite = false): object => {
  const variables: Record<string, any> = {};

  if (mappings && slots) {
    mappings.forEach((map: SlotMapping) => {
      if (!map.slot) return;

      const toVariable = map.variable;
      const fromSlot = formatIntentName(map.slot);

      // extract slot value from request
      const fromSlotValue = slots[fromSlot] || null;

      if (toVariable && (fromSlotValue || overwrite)) {
        variables[toVariable] = _.isObject(fromSlotValue)
          ? transformDateTimeVariableToString(fromSlotValue)
          : transformStringVariableToNumber(fromSlotValue);
      }
    });
  }

  return variables;
};

export const addRepromptIfExists = <B extends { reprompt?: string }>(block: B, context: Context, variables: Store): void => {
  if (block.reprompt) {
    context.storage.set(S.REPROMPT, replaceVariables(block.reprompt, variables.getState()));
  }
};

export const addChipsIfExists = <B extends { chips?: string[] }>(block: B, context: Context, variables: Store): void => {
  if (block.chips) {
    context.turn.set(
      T.CHIPS,
      block.chips.map((chip) => replaceVariables(chip, variables.getState()))
    );
  }
};
