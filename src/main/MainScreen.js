/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import { ZulipStatusBar } from '../common';
import ChatContainer from '../chat/ChatContainer';
import MainNavBar from '../nav/MainNavBar';

export default class MainScreen extends PureComponent<{}> {
  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;

    return (
      <View style={[styles.flexed, styles.backgroundColor]}>
        <ZulipStatusBar />
        <MainNavBar />
        <ChatContainer />
      </View>
    );
  }
}
