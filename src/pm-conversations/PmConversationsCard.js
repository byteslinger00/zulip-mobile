/* @flow strict-local */

import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';

import type { ThemeData } from '../styles';
import { ThemeContext } from '../styles';
import type { Dispatch, PmConversationData, UserOrBot } from '../types';
import { connect } from '../react-redux';
import { Label, ZulipButton, LoadingBanner } from '../common';
import { IconPeople, IconSearch } from '../common/Icons';
import PmConversationList from './PmConversationList';
import { getRecentConversations, getAllUsersByEmail } from '../selectors';
import { navigateToCreateGroup, navigateToUsersScreen } from '../actions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    margin: 8,
    flex: 1,
  },
  emptySlate: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 20,
  },
  row: {
    flexDirection: 'row',
  },
});

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  conversations: PmConversationData[],
  usersByEmail: Map<string, UserOrBot>,
|}>;

/**
 * The "PMs" page in the main tabs navigation.
 * */
class PmConversationsCard extends PureComponent<Props> {
  static contextType = ThemeContext;
  context: ThemeData;

  render() {
    const { dispatch, conversations, usersByEmail } = this.props;

    return (
      <View style={[styles.container, { backgroundColor: this.context.backgroundColor }]}>
        <View style={styles.row}>
          <ZulipButton
            secondary
            Icon={IconPeople}
            style={styles.button}
            text="Create group"
            onPress={() => {
              setTimeout(() => dispatch(navigateToCreateGroup()));
            }}
          />
          <ZulipButton
            secondary
            Icon={IconSearch}
            style={styles.button}
            text="Search"
            onPress={() => {
              setTimeout(() => dispatch(navigateToUsersScreen()));
            }}
          />
        </View>
        <LoadingBanner />
        {conversations.length === 0 ? (
          <Label style={styles.emptySlate} text="No recent conversations" />
        ) : (
          <PmConversationList
            dispatch={dispatch}
            conversations={conversations}
            usersByEmail={usersByEmail}
          />
        )}
      </View>
    );
  }
}

export default connect(state => ({
  conversations: getRecentConversations(state),
  usersByEmail: getAllUsersByEmail(state),
}))(PmConversationsCard);
