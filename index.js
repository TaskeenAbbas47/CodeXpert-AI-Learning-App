/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// ✅ 1. Import Messaging
import messaging from '@react-native-firebase/messaging';
// import '@react-native-firebase/app';

// ✅ 2. Register Background Handler
// This allows the app to handle messages when it is completely CLOSED (Quit state).
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  // You can't update the UI here, but the system will show the notification automatically.
});

AppRegistry.registerComponent(appName, () => App);