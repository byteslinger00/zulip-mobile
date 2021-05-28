/* @flow strict-local */
import { NativeModules, Platform, Linking } from 'react-native';
import SafariView from 'react-native-safari-view';

import type { BrowserPreference, SettingsState } from '../types';

/** Open a URL in the in-app browser. */
export function openLinkEmbedded(url: string): void {
  if (Platform.OS === 'ios') {
    SafariView.show({ url: encodeURI(url) });
  } else {
    NativeModules.CustomTabsAndroid.openURL(url);
  }
}

/** Open a URL in the user's default browser app. */
export function openLinkExternal(url: string): void {
  Linking.openURL(url);
}

export function shouldUseInAppBrowser(browser: BrowserPreference): boolean {
  if (browser === 'default') {
    return Platform.OS === 'android';
  } else {
    return browser === 'embedded';
  }
}

/** Open a URL using whichever browser the user has configured in the Zulip settings. */
export function openLinkWithUserPreference(url: string, settings: SettingsState): void {
  if (shouldUseInAppBrowser(settings.browser)) {
    openLinkEmbedded(url);
  } else {
    openLinkExternal(url);
  }
}
