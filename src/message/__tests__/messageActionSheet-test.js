// @flow strict-local
import deepFreeze from 'deep-freeze';
import { HOME_NARROW } from '../../utils/narrow';
import { streamNameOfStreamMessage } from '../../utils/recipient';

import * as eg from '../../__tests__/lib/exampleData';
import { constructMessageActionButtons, constructTopicActionButtons } from '../messageActionSheet';

const buttonTitles = buttons => buttons.map(button => button.title);

describe('constructActionButtons', () => {
  const narrow = deepFreeze(HOME_NARROW);

  test('show star message option if message is not starred', () => {
    const message = eg.streamMessage();
    const flags = { ...eg.backgroundData.flags, starred: {} };
    const buttons = constructMessageActionButtons({
      backgroundData: { ...eg.backgroundData, flags },
      message,
      narrow,
    });
    expect(buttonTitles(buttons)).toContain('Star message');
  });

  test('show unstar message option if message is starred', () => {
    const message = eg.streamMessage();
    const flags = { ...eg.backgroundData.flags, starred: { [message.id]: true } };
    const buttons = constructMessageActionButtons({
      backgroundData: { ...eg.backgroundData, flags },
      message,
      narrow,
    });
    expect(buttonTitles(buttons)).toContain('Unstar message');
  });

  test('show reactions option if message is has at least one reaction', () => {
    const buttons = constructMessageActionButtons({
      backgroundData: eg.backgroundData,
      message: eg.streamMessage({ reactions: [eg.unicodeEmojiReaction] }),
      narrow,
    });
    expect(buttonTitles(buttons)).toContain('See who reacted');
  });
});

describe('constructTopicActionButtons', () => {
  const streamMessage = eg.streamMessage();
  const streamName = streamNameOfStreamMessage(streamMessage);
  const topic = streamMessage.subject;
  const streamId = streamMessage.stream_id;

  test('show Unmute topic option if topic is muted', () => {
    const mute = deepFreeze([[streamName, topic]]);
    const buttons = constructTopicActionButtons({
      backgroundData: { ...eg.backgroundData, mute },
      streamName,
      streamId,
      topic,
    });
    expect(buttonTitles(buttons)).toContain('Unmute topic');
  });

  test('show mute topic option if topic is not muted', () => {
    const buttons = constructTopicActionButtons({
      backgroundData: { ...eg.backgroundData, mute: [] },
      streamName,
      streamId,
      topic,
    });
    expect(buttonTitles(buttons)).toContain('Mute topic');
  });

  test('show Unmute stream option if stream is not in home view', () => {
    const subscriptions = [{ ...eg.subscription, in_home_view: false }];
    const buttons = constructTopicActionButtons({
      backgroundData: { ...eg.backgroundData, subscriptions },
      streamName,
      streamId,
      topic,
    });
    expect(buttonTitles(buttons)).toContain('Unmute stream');
  });

  test('show mute stream option if stream is in home view', () => {
    const subscriptions = [{ ...eg.subscription, in_home_view: true }];
    const buttons = constructTopicActionButtons({
      backgroundData: { ...eg.backgroundData, subscriptions },
      streamName,
      streamId,
      topic,
    });
    expect(buttonTitles(buttons)).toContain('Mute stream');
  });

  test('show delete topic option if current user is an admin', () => {
    const ownUser = { ...eg.selfUser, is_admin: true };
    const buttons = constructTopicActionButtons({
      backgroundData: { ...eg.backgroundData, ownUser },
      streamName,
      streamId,
      topic,
    });
    expect(buttonTitles(buttons)).toContain('Delete topic');
  });

  test('do not show delete topic option if current user is not an admin', () => {
    const buttons = constructTopicActionButtons({
      backgroundData: eg.backgroundData,
      streamName,
      streamId,
      topic,
    });
    expect(buttonTitles(buttons)).not.toContain('Delete topic');
  });
});
