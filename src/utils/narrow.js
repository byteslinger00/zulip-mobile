/* @flow */
import isEqual from 'lodash.isequal';
import unescape from 'lodash.unescape';

import type { Narrow, Message } from '../types';
import { normalizeRecipients } from './recipient';

export const isSameNarrow = (narrow1: Narrow, narrow2: Narrow): boolean =>
  Array.isArray(narrow1) && Array.isArray(narrow2) && isEqual(narrow1, narrow2);

export const parseNarrowString = (narrowStr: string): Narrow => JSON.parse(unescape(narrowStr));

export const HOME_NARROW: Narrow = [];

export const HOME_NARROW_STR: string = '[]';

export const isHomeNarrow = (narrow: Narrow): boolean =>
  Array.isArray(narrow) && narrow.length === 0;

export const privateNarrow = (email: string): Narrow => [
  {
    operator: 'pm-with',
    operand: email,
  },
];

export const isPrivateNarrow = (narrow: Narrow): boolean =>
  Array.isArray(narrow)
  && narrow.length === 1
  && narrow[0].operator === 'pm-with'
  && narrow[0].operand.indexOf(',') === -1;

export const groupNarrow = (emails: string[]): Narrow => [
  {
    operator: 'pm-with',
    operand: emails.join(),
  },
];

export const isGroupNarrow = (narrow: Narrow): boolean =>
  Array.isArray(narrow)
  && narrow.length === 1
  && narrow[0].operator === 'pm-with'
  && narrow[0].operand.indexOf(',') >= 0;

export const isPrivateOrGroupNarrow = (narrow: Narrow): boolean =>
  Array.isArray(narrow) && narrow.length === 1 && narrow[0].operator === 'pm-with';

export const specialNarrow = (operand: string): Narrow => [
  {
    operator: 'is',
    operand,
  },
];

export const isSpecialNarrow = (narrow: Narrow): boolean =>
  Array.isArray(narrow) && narrow.length === 1 && narrow[0].operator === 'is';

export const STARRED_NARROW = specialNarrow('starred');

export const STARRED_NARROW_STR = JSON.stringify(STARRED_NARROW);

export const MENTIONED_NARROW = specialNarrow('mentioned');

export const ALL_PRIVATE_NARROW = specialNarrow('private');

export const ALL_PRIVATE_NARROW_STR = JSON.stringify(ALL_PRIVATE_NARROW);

export const isAllPrivateNarrow = (narrow: Narrow): boolean =>
  isSameNarrow(narrow, ALL_PRIVATE_NARROW);

export const streamNarrow = (stream: string): Narrow => [
  {
    operator: 'stream',
    operand: stream,
  },
];

export const isStreamNarrow = (narrow?: Narrow): boolean =>
  Array.isArray(narrow) && narrow.length === 1 && narrow[0].operator === 'stream';

export const topicNarrow = (stream: string, topic: string): Narrow => [
  {
    operator: 'stream',
    operand: stream,
  },
  {
    operator: 'topic',
    operand: topic,
  },
];

export const isTopicNarrow = (narrow?: Narrow): boolean =>
  Array.isArray(narrow) && narrow.length === 2 && narrow[1].operator === 'topic';

export const isStreamOrTopicNarrow = (narrow?: Narrow): boolean =>
  Array.isArray(narrow) && narrow.length >= 1 && narrow[0].operator === 'stream';

export const SEARCH_NARROW = (query: string): Narrow => [
  {
    operator: 'search',
    operand: query,
  },
];

export const isSearchNarrow = (narrow: Narrow): boolean =>
  Array.isArray(narrow) && narrow.length === 1 && narrow[0].operator === 'search';

type NarrowCases<T> = {
  home: () => T,
  pm: (email: string) => T,
  groupPm: (emails: string[]) => T,
  starred: () => T,
  mentioned: () => T,
  allPrivate: () => T,
  stream: (name: string) => T,
  topic: (streamName: string, topic: string) => T,
  search: (query: string) => T,
};

/* prettier-ignore */
export function caseNarrow<T>(narrow: Narrow, cases: NarrowCases<T>): T {
  const err = (): empty => {
    throw new Error(`bad narrow: ${JSON.stringify(narrow)}`);
  };

  switch (narrow.length) {
    case 0: return cases.home();
    case 1:
      switch (narrow[0].operator) {
        case 'pm-with':
          if (narrow[0].operand.indexOf(',') < 0) {
            return cases.pm(narrow[0].operand);
          } else { /* eslint-disable-line */
            const emails = narrow[0].operand.split(',');
            return cases.groupPm(emails);
          }
        case 'is':
          switch (narrow[0].operand) {
            case 'starred': return cases.starred();
            case 'mentioned': return cases.mentioned();
            case 'private': return cases.allPrivate();
            default: return err();
          }
        case 'stream': return cases.stream(narrow[0].operand);
        case 'search': return cases.search(narrow[0].operand);
        default: return err();
      }
    case 2: return cases.topic(narrow[0].operand, narrow[1].operand);
    default: return err();
  }
}

/** (For search narrows, just returns false.) */
export const isMessageInNarrow = (message: Message, narrow: Narrow, ownEmail: string): boolean => {
  const matchRecipients = (emails: string[]) => {
    const normalizedRecipients = normalizeRecipients(message.display_recipient);
    const normalizedNarrow = [...emails, ownEmail].sort().join(',');
    return normalizedRecipients === ownEmail || normalizedRecipients === normalizedNarrow;
  };

  return caseNarrow(narrow, {
    home: () => true,
    stream: name => name === message.display_recipient,
    topic: (streamName, topic) =>
      streamName === message.display_recipient && topic === message.subject,
    pm: email => matchRecipients([email]),
    groupPm: matchRecipients,
    starred: () => message.type === 'starred',
    mentioned: () => message.type === 'mentioned',
    allPrivate: () => message.type === 'private',
    search: () => false,
  });
};

export const canSendToNarrow = (narrow: Narrow): boolean =>
  caseNarrow(narrow, {
    pm: () => true,
    groupPm: () => true,
    stream: () => true,
    topic: () => true,
    home: () => false,
    starred: () => false,
    mentioned: () => false,
    allPrivate: () => false,
    search: () => false,
  });

export const getNarrowFromMessage = (message: Message, email: string) => {
  if (Array.isArray(message.display_recipient)) {
    const recipient =
      message.display_recipient.length > 1
        ? message.display_recipient.filter(x => x.email !== email)
        : message.display_recipient;
    return groupNarrow(recipient.map(x => x.email));
  }

  if (message.subject && message.subject.length) {
    return topicNarrow(message.display_recipient, message.subject);
  }

  return streamNarrow(message.display_recipient);
};
