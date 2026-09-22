import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import installations from '@react-native-firebase/installations'; 
import { Platform, PermissionsAndroid } from 'react-native';

class NotificationManager {
  async requestPermission() {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    const authStatus = await messaging().requestPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  }

  // UPDATED: Gets FCM Token AND FIAM Installation ID
  async getAndSaveToken() {
    try {
      // 1. Get FCM Token (For Push Notifications)
      const fcmToken = await messaging().getToken();
      console.log('🔥 FCM Token:', fcmToken);

      // 2. Get FIAM Installation ID (For In-App Messaging Test Device)
      const fiamId = await installations().getId();
      console.log('💬 FIAM Installation ID:', fiamId); 

      const user = auth().currentUser;
      if (user) {
        // Saving both to users/{uid}
        await firestore().collection('users').doc(user.uid).set({
          fcmToken: fcmToken,
          fiamInstallationId: fiamId, //
          lastTokenUpdate: firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        
        console.log('✅ Tokens saved to Firestore');
      }
      return fcmToken;
    } catch (error) {
      console.log('❌ Token Error:', error);
    }
  }

  setupListeners() {
    // 1. Foreground Message (User is inside the app)
    messaging().onMessage(async remoteMessage => {
      const user = auth().currentUser;
      if (user && remoteMessage.notification) {
        await firestore()
          .collection('users')
          .doc(user.uid)
          .collection('notifications')
          .add({
            title: remoteMessage.notification.title,
            body: remoteMessage.notification.body, // Fixed: usually 'body', not 'detail'
            type: remoteMessage.data?.type || 'general',
            unread: true,
            timestamp: firestore.FieldValue.serverTimestamp(),
          });
      }
    });

    // 2. Background Message
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification caused app to open from background:', remoteMessage);
    });

    // 3. Quit State
    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        console.log('Notification caused app to open from quit state:', remoteMessage);
      }
    });
  }
}

export const notificationManager = new NotificationManager();