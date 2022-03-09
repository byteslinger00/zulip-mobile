/* @flow strict-local */
import { addBreadcrumb } from '@sentry/react-native';

import type { GeneralEvent, ThunkAction } from '../types';
import * as api from '../api';
import { logout } from '../account/accountActions';
import { deadQueue } from '../session/sessionActions';
import eventToAction from './eventToAction';
import doEventActionSideEffects from './doEventActionSideEffects';
import { tryGetAuth } from '../selectors';
import { BackoffMachine } from '../utils/async';
import { ApiError } from '../api/apiErrors';
import * as logging from '../utils/logging';

/**
 * Handle a single Zulip event from the server.
 *
 * This is part of our use of the Zulip events system; see `doInitialFetch`
 * for discussion.
 */
const handleEvent = (event: GeneralEvent, dispatch, getState) => {
  addBreadcrumb({
    category: 'z-event',
    level: 'info',
    data: { type: event.type, ...(event.op !== undefined && { op: event.op }) },
  });

  try {
    const action = eventToAction(getState(), event);
    if (!action) {
      return;
    }

    // These side effects should not be moved to reducers, which
    // are explicitly not the place for side effects (see
    // https://redux.js.org/faq/actions).
    dispatch(doEventActionSideEffects(action));

    // Now dispatch the plain-object action, for our reducers to handle.
    dispatch(action);
  } catch (e) {
    // We had an error processing the event.  Log it and carry on.
    logging.error(e);
  }
};

/**
 * Poll an event queue on the Zulip server for updates, in a loop.
 *
 * This is part of our use of the Zulip events system; see `doInitialFetch`
 * for discussion.
 */
export const startEventPolling = (
  queueId: string,
  eventId: number,
): ThunkAction<Promise<void>> => async (dispatch, getState) => {
  let lastEventId = eventId;

  const backoffMachine = new BackoffMachine();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const auth = tryGetAuth(getState());
    if (!auth) {
      // This account is not logged in.
      break;
    }
    // `auth` represents the active account.  It might be different from
    // the one in the previous loop iteration, if we did a backoff wait.
    // TODO(#5009): Is that really quite OK?

    let events = undefined;
    try {
      const response = await api.pollForEvents(auth, queueId, lastEventId);
      events = response.events;

      if (getState().session.eventQueueId === null) {
        // We don't want to keep polling, e.g., because we've logged out;
        // see `PerAccountSessionState.eventQueueId` for other cases.
        break;
      } else if (queueId !== getState().session.eventQueueId) {
        // TODO: Explain why we still want this (coming soon)
        break;
      }
    } catch (e) {
      // We had an error polling the server for events.

      if (e.httpStatus === 401) {
        // 401 Unauthorized -> our `auth` is invalid.  No use retrying.
        dispatch(logout());
        break;
      }

      // protection from inadvertent DDOS
      await backoffMachine.wait();

      if (e instanceof ApiError && e.code === 'BAD_EVENT_QUEUE_ID') {
        // The event queue is too old or has been garbage collected.
        dispatch(deadQueue());
        break;
      }

      continue;
    }

    for (const event of events) {
      handleEvent(event, dispatch, getState);
    }

    lastEventId = Math.max(lastEventId, ...events.map(x => x.id));
  }
};
