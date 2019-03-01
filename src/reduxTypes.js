/**
 * Types describing our Redux state and store.
 *
 * This isn't the place for types that are borrowed from the API;
 * those go under `src/api/` (typically in `src/api/modelTypes.js`)
 * and can be imported here as needed.
 *
 * @flow strict-local
 */

import type { InputSelector } from 'reselect';

import type { Account, Outbox } from './types';
import type { Action, NavigateAction } from './actionTypes';
import type {
  Topic,
  HuddlesUnreadItem,
  Message,
  MuteTuple,
  PmsUnreadItem,
  RealmBot,
  RealmEmojiState,
  RealmFilter,
  Narrow,
  Stream,
  StreamUnreadItem,
  Subscription,
  User,
  UserGroup,
  UserPresence,
  UserStatusMapObject,
} from './api/apiTypes';

import type { SessionState } from './session/sessionReducers';

export type * from './actionTypes';

/**
 * An index on `MessagesState`, listing messages in each narrow.
 *
 * Keys are `JSON.stringify`-encoded `Narrow` objects.
 * Values are sorted lists of message IDs.
 *
 * See also `MessagesState`, which stores the message data indexed by ID.
 */
export type NarrowsState = {
  [narrow: string]: number[],
};

/**
 * A map with all messages we've stored locally, indexed by ID.
 *
 * See also `NarrowsState`, which is an index on this data that identifies
 * messages belonging to a given narrow.
 */
export type MessagesState = {|
  [id: number]: $Exact<Message>,
|};

export type UserStatusState = UserStatusMapObject;

export type StreamsState = Stream[];

export type SubscriptionsState = Subscription[];

export type AccountsState = Account[];

/**
 * Info about how complete our knowledge is of the messages in some narrow.
 *
 * @prop older - true just if in some fetch we reached the oldest message
 *   in the narrow.  No need to fetch more in that direction.
 * @prop newer - true just if in some fetch we reached the newest message in
 *   the narrow.  Of course their may always be new messages, but we should
 *   learn about them through events; so again, no need to fetch more.
 */
export type CaughtUp = {|
  older: boolean,
  newer: boolean,
|};

export type Fetching = {|
  older: boolean,
  newer: boolean,
|};

/**
 * Info about how completely we know the messages in each narrow of
 * MessagesState.
 */
export type CaughtUpState = {|
  [narrow: string]: CaughtUp,
|};

export type FetchingState = {
  [narrow: string]: Fetching,
};

export type FlagsState = {|
  read: { [messageId: number]: boolean },
  starred: { [messageId: number]: boolean },
  collapsed: { [messageId: number]: boolean },
  mentions: { [messageId: number]: boolean },
  wildcard_mentions: { [messageId: number]: boolean },
  summarize_in_home: { [messageId: number]: boolean },
  summarize_in_stream: { [messageId: number]: boolean },
  force_expand: { [messageId: number]: boolean },
  force_collapse: { [messageId: number]: boolean },
  has_alert_word: { [messageId: number]: boolean },
  historical: { [messageId: number]: boolean },
  is_me_message: { [messageId: number]: boolean },
|};

export type FlagName = $Keys<FlagsState>;

export type MigrationsState = {|
  version?: string,
|};

export type LoadingState = {|
  presence: boolean,
  subscriptions: boolean,
  streams: boolean,
  unread: boolean,
  users: boolean,
|};

export type MuteState = MuteTuple[];

export type NavigationRouteState = {
  key: string,
  routeName: string,
  /** The fields in `params` vary by route; see `navActions.js`. */
  params?: {
    narrow?: Narrow,
  },
};

export type NavigationState = {|
  index: number,
  isTransitioning: boolean,
  key: string,
  routes: NavigationRouteState[],
|};

/**
 * State with general info about a Zulip organization; our state subtree `realm`.
 *
 * @prop twentyFourHourTime
 * @prop canCreateStreams
 * @prop crossRealmBots - The server's cross-realm bots; e.g., Welcome Bot.
 *   Cross-realm bots should be treated like normal bots.
 * @prop nonActiveUsers - All users in the organization with `is_active`
 *   false; for normal users, this means they or an admin deactivated their
 *   account.  See `User` and the linked documentation.
 * @prop filters
 * @prop emoji
 * @prop isAdmin
 */
export type RealmState = {|
  twentyFourHourTime: boolean,
  canCreateStreams: boolean,
  crossRealmBots: RealmBot[],
  nonActiveUsers: User[],
  filters: RealmFilter[],
  emoji: RealmEmojiState,
  isAdmin: boolean,
|};

export type TopicsState = {|
  [number]: Topic[],
|};

export type ThemeName = 'default' | 'night';

export type SettingsState = {|
  locale: string,
  theme: ThemeName,
  offlineNotification: boolean,
  onlineNotification: boolean,
  experimentalFeaturesEnabled: boolean,
  streamNotification: boolean,
|};

export type TypingState = {|
  [normalizedRecipients: string]: {
    time: number,
    userIds: number[],
  },
|};

export type UnreadStreamsState = StreamUnreadItem[];
export type UnreadHuddlesState = HuddlesUnreadItem[];
export type UnreadPmsState = PmsUnreadItem[];
export type UnreadMentionsState = number[];

export type AlertWordsState = string[];

export type DraftsState = {|
  [narrow: string]: string,
|};

/**
 * A collection of (almost) all users in the Zulip org; our `users` state subtree.
 *
 * This contains all users except deactivated users and cross-realm bots.
 * For those, see RealmState.
 */
export type UsersState = User[];

export type UserGroupsState = UserGroup[];

/**
 * The `presence` subtree of our Redux state.
 *
 * @prop (email) - Indexes over all users for which the app has received a
 *   presence status.
 */
export type PresenceState = {|
  [email: string]: UserPresence,
|};

export type OutboxState = Outbox[];

export type UnreadState = {|
  streams: UnreadStreamsState,
  huddles: UnreadHuddlesState,
  pms: UnreadPmsState,
  mentions: UnreadMentionsState,
|};

/**
 * Our complete Redux state tree.
 *
 * Each property is a subtree maintained by its own reducer function.
 */
export type GlobalState = {|
  accounts: AccountsState,
  alertWords: AlertWordsState,
  caughtUp: CaughtUpState,
  drafts: DraftsState,
  fetching: FetchingState,
  flags: FlagsState,
  migrations: MigrationsState,
  loading: LoadingState,
  messages: MessagesState,
  mute: MuteState,
  narrows: NarrowsState,
  nav: NavigationState,
  outbox: OutboxState,
  presence: PresenceState,
  realm: RealmState,
  session: SessionState,
  settings: SettingsState,
  streams: StreamsState,
  subscriptions: SubscriptionsState,
  topics: TopicsState,
  typing: TypingState,
  unread: UnreadState,
  userGroups: UserGroupsState,
  userStatus: UserStatusState,
  users: UsersState,
|};

/** A selector returning TResult, with extra parameter TParam. */
// Seems like this should be OutputSelector... but for whatever reason,
// putting that on a selector doesn't cause the result type to propagate to
// the corresponding parameter when used in `createSelector`, and this does.
export type Selector<TResult, TParam = void> = InputSelector<GlobalState, TParam, TResult>;

export type GetState = () => GlobalState;

export type PlainDispatch = <A: Action | NavigateAction>(action: A) => A;

export interface Dispatch {
  <A: Action | NavigateAction>(action: A): A;
  <T>((Dispatch, GetState) => T): T;
}
