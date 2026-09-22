// // import React, { useState, useEffect } from 'react';
// // import { NavigationContainer } from '@react-navigation/native';
// // import { createNativeStackNavigator } from '@react-navigation/native-stack';
// // import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
// // import { ActivityIndicator, View, StyleSheet } from 'react-native';

// // // --- Screens ---
// // import Onboarding from '../screens/Onboarding';
// // import LoginScreen from '../screens/LoginScreen';
// // import SignupScreen from '../screens/SignupScreen';
// // import ConfirmationScreen from '../screens/ConfirmationScreen';
// // import ErrorScreen from '../screens/ErrorScreen';
// // import HomeScreen from '../screens/HomeScreen';
// // import PythonCourse from '../screens/PythonCourse';
// // import HtmlCourse from '../screens/HtmlCourse';
// // import CssCourse from '../screens/CssCourse';
// // import JsCourse from '../screens/JsCourse';
// // import NotificationScreen from '../screens/Notification';
// // import Leaderboard from '../screens/Leaderboard';
// // import Ai from '../screens/Ai';
// // import Profile from '../screens/Profile';
// // import Settings from '../screens/Settings';
// // import Liked from '../screens/liked';
// // import About from '../screens/Aboutus';
// // import TermsScreen from '../screens/TermsScreen';

// // // --- Navigation Types ---
// // export type RootStackParamList = {
// //   Onboarding: undefined;
// //   LoginScreen: undefined;
// //   SignupScreen: { agreed?: boolean } | undefined;
// //   TermsScreen: { fromSignup?: boolean } | undefined;
// //   Confirmation: { nextScreen?: keyof RootStackParamList };
// //   ErrorScreen: { errorMessage?: string };
// //   HomeScreen: undefined;
// //   PythonCourse: undefined;
// //   HtmlCourse: undefined;
// //   CssCourse: undefined;
// //   JsCourse: undefined;
// //   Notification: undefined;
// //   Leaderboard: undefined;
// //   Ai: undefined;
// //   Profile: undefined;
// //   Settings: undefined;
// //   Liked: undefined;
// //   About: undefined;
// // };

// // const Stack = createNativeStackNavigator<RootStackParamList>();

// // export default function AppNavigator() {
// //   const [initializing, setInitializing] = useState(true);
// //   const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

// //   useEffect(() => {
// //     const subscriber = auth().onAuthStateChanged(userState => {
// //       setUser(userState);
// //       if (initializing) setInitializing(false);
// //     });
// //     return subscriber;
// //   }, [initializing]);

// //   if (initializing) {
// //     return (
// //       <View style={styles.loadingContainer}>
// //         <ActivityIndicator size="large" color="#4C6EF5" />
// //       </View>
// //     );
// //   }

// //   return (
// //     <NavigationContainer>
// //       <Stack.Navigator
// //         screenOptions={{ headerShown: false }}
// //       >
// //         {user ? (
// //           // ✅ Authenticated Stack (user logged in)
// //           <>
// //             <Stack.Screen
// //               name="HomeScreen"
// //               component={HomeScreen}
// //               options={{ gestureEnabled: false }} // disable swipe back
// //             />
// //             <Stack.Screen name="Profile" component={Profile} />
// //             <Stack.Screen name="Ai" component={Ai} />
// //             <Stack.Screen name="PythonCourse" component={PythonCourse} />
// //             <Stack.Screen name="HtmlCourse" component={HtmlCourse} />
// //             <Stack.Screen name="CssCourse" component={CssCourse} />
// //             <Stack.Screen name="JsCourse" component={JsCourse} />
// //             <Stack.Screen name="Notification" component={NotificationScreen} />
// //             <Stack.Screen name="Leaderboard" component={Leaderboard} />
// //             <Stack.Screen name="Settings" component={Settings} />
// //             <Stack.Screen name="Liked" component={Liked} />
// //             <Stack.Screen name="About" component={About} />
// //             <Stack.Screen name="TermsScreen" component={TermsScreen} />
// //             <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
// //             <Stack.Screen name="ErrorScreen" component={ErrorScreen} />
// //           </>
// //         ) : (
// //           // ✅ Guest Stack (logged out)
// //           <>
// //             <Stack.Screen
// //               name="Onboarding"
// //               component={Onboarding}
// //               options={{ gestureEnabled: false }}
// //             />
// //             <Stack.Screen name="LoginScreen" component={LoginScreen} />
// //             <Stack.Screen name="SignupScreen" component={SignupScreen} />
// //             <Stack.Screen name="TermsScreen" component={TermsScreen} />
// //             <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
// //             <Stack.Screen name="ErrorScreen" component={ErrorScreen} />
// //           </>
// //         )}
// //       </Stack.Navigator>
// //     </NavigationContainer>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   loadingContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: '#0A0A23',
// //   },
// // });
// // navigator/AppNavigator.tsx
// import React, { useState, useEffect } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
// import { ActivityIndicator, View, StyleSheet } from 'react-native';

// // screens
// import Onboarding from '../screens/Onboarding';
// import LoginScreen from '../screens/LoginScreen';
// import SignupScreen from '../screens/SignupScreen';
// import ConfirmationScreen from '../screens/ConfirmationScreen';
// import ErrorScreen from '../screens/ErrorScreen';
// import HomeScreen from '../screens/HomeScreen';
// import PythonCourse from '../screens/PythonCourse';
// import HtmlCourse from '../screens/HtmlCourse';
// import CssCourse from '../screens/CssCourse';
// import JsCourse from '../screens/JsCourse';
// import NotificationScreen from '../screens/Notification';
// import Leaderboard from '../screens/Leaderboard';
// import Ai from '../screens/Ai';
// import Profile from '../screens/Profile';
// import Settings from '../screens/Settings';
// import Liked from '../screens/liked';
// import About from '../screens/Aboutus';
// import TermsScreen from '../screens/TermsScreen';
// import AppearanceScreen from '../screens/AppearanceScreen';
// import Certificates from '../screens/CertificatesScreen';
// import Courses from '../screens/CoursesScreen';
// import SupportScreen from '../screens/SupportScreen';
// import PrivacyScreen from '../screens/PrivacyScreen';
// import AdminDashboard from '../screens/AdminDashboard';
// // small control module
// import { subscribe as subscribeDefer, getDefer } from '../utils/authControl';
// import FeedbackScreen from '../screens/FeedbackScreen';


// // navigation types
// export type RootStackParamList = {
//   Onboarding: undefined;
//   LoginScreen: undefined;
//   SignupScreen: { agreed?: boolean } | undefined;
//   TermsScreen: { fromSignup?: boolean } | undefined;
//   Confirmation: { nextScreen?: keyof RootStackParamList };
//   ErrorScreen: { errorMessage?: string };
//   HomeScreen: undefined;
//   PythonCourse: undefined;
//   HtmlCourse: undefined;
//   CssCourse: undefined;
//   JsCourse: undefined;
//   Notification: undefined;
//   Leaderboard: undefined;
//   Ai: undefined;
//   Profile: undefined;
//   Settings: undefined;
//   Liked: undefined;
//   About: undefined;
//   AppearanceScreen: undefined;
//   Courses: undefined;
//   Certificates: undefined;
//   FeedbackScreen: undefined;
//   SupportScreen: undefined;
//   PrivacyScreen: undefined;
//   AdminDashboard: undefined;


// };

// const Stack = createNativeStackNavigator<RootStackParamList>();

// export default function AppNavigator() {
//   const [initializing, setInitializing] = useState(true);
//   const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
//   const [defer, setDefer] = useState<boolean>(getDefer());

//   useEffect(() => {
//     const unsub = subscribeDefer((val) => setDefer(val));
//     return unsub;
//   }, []);

//   useEffect(() => {
//     // use the modular onAuthStateChanged style, returns unsubscribe
//     const unsubscribe = auth().onAuthStateChanged((u) => {
//       setUser(u);
//       if (initializing) setInitializing(false);
//     });

//     return () => {
//       try { unsubscribe(); } catch (e) { /* ignore */ }
//     };
//     // intentionally no deps besides initializing handled above
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   if (initializing) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#4C6EF5" />
//       </View>
//     );
//   }

//   // when defer is true we keep showing guest stack until you manually unset defer
//   const effectiveUser = defer ? null : user;

//   return (
//     <NavigationContainer>
//       <Stack.Navigator screenOptions={{ headerShown: false }}>
//         {effectiveUser ? (
//           <>
//             <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ gestureEnabled: false }} />
//             <Stack.Screen name="Profile" component={Profile} />
//             <Stack.Screen name="Ai" component={Ai} />
//             <Stack.Screen name="PythonCourse" component={PythonCourse} />
//             <Stack.Screen name="HtmlCourse" component={HtmlCourse} />
//             <Stack.Screen name="CssCourse" component={CssCourse} />
//             <Stack.Screen name="JsCourse" component={JsCourse} />
//             <Stack.Screen name="Notification" component={NotificationScreen} />
//             <Stack.Screen name="Leaderboard" component={Leaderboard} />
//             <Stack.Screen name="Settings" component={Settings} />
//             <Stack.Screen name="Liked" component={Liked} />
//             <Stack.Screen name="About" component={About} />
//             <Stack.Screen name="TermsScreen" component={TermsScreen} />
//             <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
//             <Stack.Screen name="ErrorScreen" component={ErrorScreen} />
//             <Stack.Screen name="AppearanceScreen" component={AppearanceScreen} />
//             <Stack.Screen name="Courses" component={Courses} />
//             <Stack.Screen name="Certificates" component={Certificates} />
//             <Stack.Screen name="FeedbackScreen" component={FeedbackScreen} />
//             <Stack.Screen name="SupportScreen" component={SupportScreen} />
//             <Stack.Screen name="PrivacyScreen" component={PrivacyScreen} />
            
//           </>
//         ) : (
//           <>
//             <Stack.Screen name="Onboarding" component={Onboarding} options={{ gestureEnabled: false }} />
//             <Stack.Screen name="LoginScreen" component={LoginScreen} />
//             <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
//             <Stack.Screen name="SignupScreen" component={SignupScreen} />
//             <Stack.Screen name="TermsScreen" component={TermsScreen} />
//             <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
//             <Stack.Screen name="ErrorScreen" component={ErrorScreen} />
//           </>
//         )}
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

// const styles = StyleSheet.create({
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#0A0A23',
//   },
// });
// navigator/AppNavigator.tsx
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// screens
import Onboarding from '../screens/Onboarding';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ConfirmationScreen from '../screens/ConfirmationScreen';
import ErrorScreen from '../screens/ErrorScreen';
import HomeScreen from '../screens/HomeScreen';
import PythonCourse from '../screens/PythonCourse';
import HtmlCourse from '../screens/HtmlCourse';
import CssCourse from '../screens/CssCourse';
import JsCourse from '../screens/JsCourse';
import NotificationScreen from '../screens/Notification';
import Leaderboard from '../screens/Leaderboard';
import Ai from '../screens/Ai';
import Profile from '../screens/Profile';
import Settings from '../screens/Settings';
import Liked from '../screens/liked';
import About from '../screens/Aboutus';
import TermsScreen from '../screens/TermsScreen';
import AppearanceScreen from '../screens/AppearanceScreen';
import Certificates from '../screens/CertificatesScreen';
import Courses from '../screens/CoursesScreen';
import SupportScreen from '../screens/SupportScreen';
import PrivacyScreen from '../screens/PrivacyScreen';
import AdminDashboard from '../screens/AdminDashboard';
// small control module
import { subscribe as subscribeDefer, getDefer } from '../utils/authControl';
import FeedbackScreen from '../screens/FeedbackScreen';

// navigation types
export type RootStackParamList = {
  Onboarding: undefined;
  LoginScreen: undefined;
  SignupScreen: { agreed?: boolean } | undefined;
  TermsScreen: { fromSignup?: boolean } | undefined;
  Confirmation: { nextScreen?: keyof RootStackParamList };
  ErrorScreen: { errorMessage?: string };
  HomeScreen: undefined;
  PythonCourse: undefined;
  HtmlCourse: undefined;
  CssCourse: undefined;
  JsCourse: undefined;
  Notification: undefined;
  Leaderboard: undefined;
  Ai: undefined;
  Profile: undefined;
  Settings: undefined;
  Liked: undefined;
  About: undefined;
  AppearanceScreen: undefined;
  Courses: undefined;
  Certificates: undefined;
  FeedbackScreen: undefined;
  SupportScreen: undefined;
  PrivacyScreen: undefined;
  AdminDashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false); // 
  const [defer, setDefer] = useState<boolean>(getDefer());

  useEffect(() => {
    const unsub = subscribeDefer((val) => setDefer(val));
    return unsub;
  }, []);

  useEffect(() => {
    // use the modular onAuthStateChanged style, returns unsubscribe
    const unsubscribe = auth().onAuthStateChanged((u) => {
      setUser(u);
      
     
      if (u && u.email?.toLowerCase() === "wetom.k173@gmail.com") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }

      if (initializing) setInitializing(false);
    });

    return () => {
      try { unsubscribe(); } catch (e) { /* ignore */ }
    };
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4C6EF5" />
      </View>
    );
  }

  // when defer is true we keep showing guest stack until you manually unset defer
  const effectiveUser = defer ? null : user;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!effectiveUser ? (
          //  GUEST STACK (Not Logged In)
          <>
            <Stack.Screen name="Onboarding" component={Onboarding} options={{ gestureEnabled: false }} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="SignupScreen" component={SignupScreen} />
            <Stack.Screen name="TermsScreen" component={TermsScreen} />
            <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
            <Stack.Screen name="ErrorScreen" component={ErrorScreen} />
          </>
        ) : isAdmin ? (
          // ADMIN STACK (Logged In as Admin)
          <>
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ gestureEnabled: false }} />
            <Stack.Screen name="Settings" component={Settings} />
            <Stack.Screen name="AppearanceScreen" component={AppearanceScreen} />
            <Stack.Screen name="SupportScreen" component={SupportScreen} />
            <Stack.Screen name="ErrorScreen" component={ErrorScreen} />
          </>
        ) : (
          //  STUDENT STACK (Logged In as Normal User)
          <>
            <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ gestureEnabled: false }} />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="Ai" component={Ai} />
            <Stack.Screen name="PythonCourse" component={PythonCourse} />
            <Stack.Screen name="HtmlCourse" component={HtmlCourse} />
            <Stack.Screen name="CssCourse" component={CssCourse} />
            <Stack.Screen name="JsCourse" component={JsCourse} />
            <Stack.Screen name="Notification" component={NotificationScreen} />
            <Stack.Screen name="Leaderboard" component={Leaderboard} />
            <Stack.Screen name="Settings" component={Settings} />
            <Stack.Screen name="Liked" component={Liked} />
            <Stack.Screen name="About" component={About} />
            <Stack.Screen name="TermsScreen" component={TermsScreen} />
            <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
            <Stack.Screen name="ErrorScreen" component={ErrorScreen} />
            <Stack.Screen name="AppearanceScreen" component={AppearanceScreen} />
            <Stack.Screen name="Courses" component={Courses} />
            <Stack.Screen name="Certificates" component={Certificates} />
            <Stack.Screen name="FeedbackScreen" component={FeedbackScreen} />
            <Stack.Screen name="SupportScreen" component={SupportScreen} />
            <Stack.Screen name="PrivacyScreen" component={PrivacyScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A23',
  },
});