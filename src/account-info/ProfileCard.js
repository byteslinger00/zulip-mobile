/* @flow strict-local */
import React from 'react';
import { ScrollView, View } from 'react-native';

import type { MainTabsNavigationProp, MainTabsRouteProp } from '../main/MainTabs';
import * as NavigationService from '../nav/NavigationService';
import type { Dispatch, User } from '../types';
import { createStyleSheet } from '../styles';
import { connect } from '../react-redux';
import { getSelfUserDetail } from '../selectors';
import { ZulipButton } from '../common';
import {
  logout,
  tryStopNotifications,
  navigateToAccountPicker,
  navigateToUserStatus,
} from '../actions';
import AccountDetails from './AccountDetails';
import AwayStatusSwitch from './AwayStatusSwitch';

const styles = createStyleSheet({
  buttonRow: {
    flexDirection: 'row',
    marginHorizontal: 8,
  },
  button: {
    flex: 1,
    margin: 8,
  },
});

function SetStatusButton(props: {||}) {
  return (
    <ZulipButton
      style={styles.button}
      secondary
      text="Set a status"
      onPress={() => {
        NavigationService.dispatch(navigateToUserStatus());
      }}
    />
  );
}

function SwitchAccountButton(props: {||}) {
  return (
    <ZulipButton
      style={styles.button}
      secondary
      text="Switch account"
      onPress={() => {
        NavigationService.dispatch(navigateToAccountPicker());
      }}
    />
  );
}

function LogoutButton(props: {| +dispatch: Dispatch |}) {
  return (
    <ZulipButton
      style={styles.button}
      secondary
      text="Log out"
      onPress={() => {
        const { dispatch } = props;
        dispatch(tryStopNotifications());
        dispatch(logout());
      }}
    />
  );
}

type Props = $ReadOnly<{|
  navigation: MainTabsNavigationProp<'profile'>,
  route: MainTabsRouteProp<'profile'>,

  dispatch: Dispatch,
  selfUserDetail: User,
|}>;

/**
 * This is similar to `AccountDetails` but used to show the current users account.
 * It does not have a "Send private message" but has "Switch account" and "Log out" buttons.
 *
 * The user can still open `AccountDetails` on themselves via the (i) icon in a chat screen.
 */
function ProfileCard(props: Props) {
  const { selfUserDetail } = props;

  return (
    <ScrollView>
      <AccountDetails user={selfUserDetail} />
      <AwayStatusSwitch />
      <View style={styles.buttonRow}>
        <SetStatusButton />
      </View>
      <View style={styles.buttonRow}>
        <SwitchAccountButton />
        <LogoutButton dispatch={props.dispatch} />
      </View>
    </ScrollView>
  );
}

export default connect(state => ({
  selfUserDetail: getSelfUserDetail(state),
}))(ProfileCard);
