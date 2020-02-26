/* @flow strict-local */
import type { PmRecipientUser, Message, Outbox, User } from '../types';

// Filter a list of PM recipients in the quirky way that we do.
//
// This is a module-private helper.  See caller for jsdoc.
const filterRecipients = (recipients: PmRecipientUser[], ownUserId: number): PmRecipientUser[] =>
  recipients.length === 1 ? recipients : recipients.filter(r => r.id !== ownUserId);

// TODO types: this union is confusing
export const normalizeRecipients = (recipients: $ReadOnlyArray<{ email: string }> | string) =>
  !Array.isArray(recipients)
    ? recipients
    : recipients
        .map(s => s.email.trim())
        .filter(x => x.length > 0)
        .sort()
        .join(',');

export const normalizeRecipientsSansMe = (
  recipients: $ReadOnlyArray<{ email: string }>,
  ownEmail: string,
) =>
  recipients.length === 1
    ? recipients[0].email
    : normalizeRecipients(recipients.filter(r => r.email !== ownEmail));

/**
 * Returns a filtered array of recipients for a private message.
 * If the message is a self PM, returns an array containing a single
 * element - the current user. Otherwise, returns all recipients
 * except the current user.
 */
export const filteredRecipientsForPM = (
  message: Message | Outbox,
  ownUser: User,
): PmRecipientUser[] => {
  if (message.type !== 'private') {
    throw new Error('filteredRecipientsForPM: expected PM, got stream message');
  }
  return filterRecipients(message.display_recipient, ownUser.user_id);
};

export const getRecipientsIds = (recipients: PmRecipientUser[], ownEmail?: string): string =>
  recipients.length === 2
    ? recipients.filter(r => r.email !== ownEmail)[0].id.toString()
    : recipients
        .map(s => s.id)
        .sort((a, b) => a - b)
        .join(',');

export const isSameRecipient = (
  message1: Message | Outbox,
  message2: Message | Outbox,
): boolean => {
  if (message1 === undefined || message2 === undefined) {
    return false;
  }

  if (message1.type !== message2.type) {
    return false;
  }

  switch (message1.type) {
    case 'private':
      return (
        normalizeRecipients(message1.display_recipient).toLowerCase()
        === normalizeRecipients(message2.display_recipient).toLowerCase()
      );
    case 'stream':
      return (
        message1.display_recipient.toLowerCase() === message2.display_recipient.toLowerCase()
        && message1.subject.toLowerCase() === message2.subject.toLowerCase()
      );
    default:
      // Invariant
      return false;
  }
};
