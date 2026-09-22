 
// // import React, { useState } from 'react';
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   TextInput,
// //   TouchableOpacity,
// //   SafeAreaView,
// //   ActivityIndicator,
// //   KeyboardAvoidingView,
// //   Platform,
// //   Modal,
// //   Image,
// //   Animated,
// // } from 'react-native';
// // import { useNavigation } from '@react-navigation/native';
// // import auth from '@react-native-firebase/auth';
// // import { NativeStackScreenProps } from '@react-navigation/native-stack';
// // import { RootStackParamList } from '../navigator/AppNavigator';

// // // 1. Import Theme Hook & Auth Utils
// // import { useThemeStyles } from '../hooks/useThemeStyles';
// // import { setDefer } from '../utils/authControl';

// // type LoginNavigationProp = NativeStackScreenProps<
// //   RootStackParamList,
// //   'LoginScreen'
// // >['navigation'];

// // export default function LoginScreen() {
// //   const navigation = useNavigation<LoginNavigationProp>();
  
// //   // 2. Initialize Theme Hook
// //   const { styles, colors } = useThemeStyles(styleGenerator);

// //   const [passwordVisible, setPasswordVisible] = useState(false);
// //   const [email, setEmail] = useState('');
// //   const [password, setPassword] = useState('');
// //   const [loading, setLoading] = useState(false);

// //   // Alert modal state
// //   const [alertVisible, setAlertVisible] = useState(false);
// //   const [alertTitle, setAlertTitle] = useState('');
// //   const [alertMessage, setAlertMessage] = useState('');
// //   const fadeAnim = useState(new Animated.Value(0))[0];

// //   const showAlert = (title: string, message: string) => {
// //     setAlertTitle(title);
// //     setAlertMessage(message);
// //     setAlertVisible(true);
// //     Animated.timing(fadeAnim, {
// //       toValue: 1,
// //       duration: 200,
// //       useNativeDriver: true,
// //     }).start();
// //   };

// //   const hideAlert = () => {
// //     Animated.timing(fadeAnim, {
// //       toValue: 0,
// //       duration: 150,
// //       useNativeDriver: true,
// //     }).start(() => {
// //       setAlertVisible(false);

// //       // if we just showed login success, navigate and unset defer
// //       if (alertTitle === 'Login Successful') {
// //         setDefer(false);
// //         navigation.reset({
// //           index: 0,
// //           routes: [{ name: 'HomeScreen' }],
// //         });
// //       }
// //     });
// //   };

// //   const handleForgotPassword = async () => {
// //     if (!email.trim()) {
// //       showAlert('Missing Email', 'Please enter your email to reset password.');
// //       return;
// //     }
// //     try {
// //       await auth().sendPasswordResetEmail(email.trim());
// //       showAlert('Email Sent', 'A password reset link has been sent to your email.');
// //     } catch (error: any) {
// //       showAlert('Error', error.message || 'Failed to send reset email.');
// //     }
// //   };

// //   const handleLogin = async () => {
// //     if (!email.trim() || !password.trim()) {
// //       showAlert('Missing Fields', 'Please enter both email and password.');
// //       return;
// //     }

// //     setDefer(true);
// //     setLoading(true);
// //     try {
// //       await auth().signInWithEmailAndPassword(email.trim(), password);
// //       setLoading(false);
// //       showAlert('Login Successful', `Welcome back, ${auth().currentUser?.email || 'Coder'}!`);
// //     } catch (error: any) {
// //       setLoading(false);
// //       setDefer(false);
// //       showAlert('Login Failed', error.message || 'Invalid email or password.');
// //     }
// //   };

// //   return (
// //     <SafeAreaView style={styles.container}>
// //       <KeyboardAvoidingView
// //         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
// //         style={styles.flex1}
// //       >
// //         <Text style={styles.title}>Welcome Back</Text>
// //         <Text style={styles.subtitle}>Login to continue your journey</Text>

// //         {/* Email Input */}
// //         <View style={styles.inputContainer}>
// //           <Text style={styles.inputLabel}>Email Address</Text>
// //           <TextInput
// //             style={styles.input}
// //             placeholder="youremail@email.com"
// //             placeholderTextColor={colors.textSecondary}
// //             keyboardType="email-address"
// //             value={email}
// //             onChangeText={setEmail}
// //             autoCapitalize="none"
            
// //             // ✅ ADDED FOR PASSWORD MANAGER:
// //             textContentType="username" // iOS: Tells Keychain this is the username
// //             autoComplete="username"    // Android: Tells Google this is the username
// //             importantForAutofill="yes" // Android: Hints that this field is critical
// //           />
// //         </View>

// //         {/* Password Input */}
// //         <View style={styles.inputContainer}>
// //           <Text style={styles.inputLabel}>Password</Text>
// //           <View style={styles.passwordWrapper}>
// //             <TextInput
// //               style={styles.passwordInput}
// //               placeholder="********"
// //               placeholderTextColor={colors.textSecondary}
// //               secureTextEntry={!passwordVisible}
// //               value={password}
// //               onChangeText={setPassword}
              
// //               // ✅ ADDED FOR PASSWORD MANAGER:
// //               textContentType="password" // iOS: Tells Keychain this is the password
// //               autoComplete="password"    // Android: Tells Google this is the password
// //               importantForAutofill="yes" // Android
// //             />
// //             <TouchableOpacity
// //               onPress={() => setPasswordVisible(!passwordVisible)}
// //               activeOpacity={0.8}
// //             >
// //               <Image
// //                 source={
// //                   passwordVisible
// //                     ? require('../Assets/hidepass.png')
// //                     : require('../Assets/viewpass.png')
// //                 }
// //                 style={[styles.eyeIcon, { tintColor: colors.textSecondary }]}
// //               />
// //             </TouchableOpacity>
// //           </View>

// //           <TouchableOpacity onPress={handleForgotPassword}>
// //             <Text style={styles.forgotText}>Forgot Password?</Text>
// //           </TouchableOpacity>
// //         </View>

// //         {/* Login Button */}
// //         <TouchableOpacity
// //           style={[styles.loginButton, loading && styles.loginButtonDisabled]}
// //           onPress={handleLogin}
// //           disabled={loading}
// //         >
// //           {loading ? (
// //             <ActivityIndicator color="#FFFFFF" />
// //           ) : (
// //             <Text style={styles.loginText}>Log In</Text>
// //           )}
// //         </TouchableOpacity>

// //         {/* Signup */}
// //         <Text style={styles.signupPrompt}>
// //           Don’t have an account?{' '}
// //           <Text
// //             style={styles.signupLink}
// //             onPress={() => navigation.navigate('SignupScreen')}
// //           >
// //             Sign up
// //           </Text>
// //         </Text>
// //       </KeyboardAvoidingView>

// //       {/* Custom Modal Alert */}
// //       <Modal visible={alertVisible} transparent animationType="fade">
// //         <View style={styles.modalOverlay}>
// //           <Animated.View style={[styles.alertBox, { opacity: fadeAnim }]}>
// //             <Text style={styles.alertTitle}>{alertTitle}</Text>
// //             <Text style={styles.alertMessage}>{alertMessage}</Text>
// //             <TouchableOpacity style={styles.alertButton} onPress={hideAlert}>
// //               <Text style={styles.alertButtonText}>OK</Text>
// //             </TouchableOpacity>
// //           </Animated.View>
// //         </View>
// //       </Modal>
// //     </SafeAreaView>
// //   );
// // }

// // // 3. Style Generator
// // export const styleGenerator = (colors: any) => StyleSheet.create({
// //   flex1: {
// //     flex: 1,
// //   },
// //   container: {
// //     flex: 1,
// //     backgroundColor: colors.background,
// //     paddingHorizontal: 20,
// //     paddingTop: 80,
// //   },
// //   title: {
// //     fontSize: 28,
// //     color: colors.textPrimary,
// //     fontFamily: 'Poppins-Bold',
// //     marginBottom: 5,
// //   },
// //   subtitle: {
// //     color: colors.textSecondary,
// //     fontSize: 14,
// //     fontFamily: 'Poppins-Regular',
// //     marginBottom: 30,
// //   },
// //   inputContainer: {
// //     marginBottom: 20,
// //   },
// //   inputLabel: {
// //     color: colors.textPrimary,
// //     fontSize: 14,
// //     marginBottom: 5,
// //     fontFamily: 'Poppins-SemiBold',
// //   },
// //   input: {
// //     backgroundColor: colors.card,
// //     color: colors.textPrimary,
// //     borderRadius: 10,
// //     paddingVertical: 12,
// //     paddingHorizontal: 15,
// //     fontFamily: 'Poppins-Regular',
// //     width: '100%',
// //     borderWidth: 1,
// //     borderColor: colors.border || 'transparent',
// //   },
// //   passwordWrapper: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: colors.card,
// //     borderRadius: 10,
// //     paddingHorizontal: 15,
// //     borderWidth: 1,
// //     borderColor: colors.border || 'transparent',
// //   },
// //   passwordInput: {
// //     flex: 1,
// //     color: colors.textPrimary,
// //     fontFamily: 'Poppins-Regular',
// //     paddingVertical: 12,
// //   },
// //   eyeIcon: {
// //     width: 22,
// //     height: 22,
// //   },
// //   forgotText: {
// //     color: colors.primary,
// //     fontFamily: 'Poppins-Medium',
// //     fontSize: 13,
// //     textAlign: 'right',
// //     marginTop: 6,
// //   },
// //   loginButton: {
// //     backgroundColor: colors.primary,
// //     paddingVertical: 15,
// //     borderRadius: 10,
// //     alignItems: 'center',
// //     marginTop: 25,
// //   },
// //   loginButtonDisabled: {
// //     backgroundColor: colors.buttonMuted || '#6B7280',
// //     opacity: 0.7,
// //   },
// //   loginText: {
// //     color: '#fff',
// //     fontSize: 16,
// //     fontFamily: 'Poppins-SemiBold',
// //   },
// //   signupPrompt: {
// //     color: colors.textSecondary,
// //     fontSize: 14,
// //     fontFamily: 'Poppins-Regular',
// //     textAlign: 'center',
// //     marginTop: 25,
// //   },
// //   signupLink: {
// //     color: colors.primary,
// //     fontFamily: 'Poppins-SemiBold',
// //   },
// //   modalOverlay: {
// //     flex: 1,
// //     backgroundColor: colors.overlay,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   alertBox: {
// //     backgroundColor: colors.card,
// //     width: '80%',
// //     borderRadius: 14,
// //     padding: 20,
// //     alignItems: 'center',
// //     borderWidth: 1,
// //     borderColor: colors.border || '#2D2D55',
// //     shadowColor: "#000",
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.25,
// //     shadowRadius: 3.84,
// //     elevation: 5,
// //   },
// //   alertTitle: {
// //     color: colors.textPrimary,
// //     fontSize: 18,
// //     fontFamily: 'Poppins-SemiBold',
// //     marginBottom: 10,
// //   },
// //   alertMessage: {
// //     color: colors.textSecondary,
// //     fontSize: 14,
// //     textAlign: 'center',
// //     fontFamily: 'Poppins-Regular',
// //     marginBottom: 20,
// //   },
// //   alertButton: {
// //     backgroundColor: colors.primary,
// //     paddingVertical: 10,
// //     paddingHorizontal: 25,
// //     borderRadius: 8,
// //   },
// //   alertButtonText: {
// //     color: '#FFFFFF',
// //     fontSize: 14,
// //     fontFamily: 'Poppins-SemiBold',
// //   },
// // });
// import React, { useState } from 'react';

// import {
//   View,
//   Text,
//   StyleSheet,
//   TextInput,
//   TouchableOpacity,
//   SafeAreaView,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
//   Modal,
//   Image,
//   Animated,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import auth from '@react-native-firebase/auth';
// import firestore from '@react-native-firebase/firestore';
// import { NativeStackScreenProps } from '@react-navigation/native-stack';
// import { RootStackParamList } from '../navigator/AppNavigator';

// // 1. Import Theme Hook & Auth Utils
// import { useThemeStyles } from '../hooks/useThemeStyles';
// import { setDefer } from '../utils/authControl';

// type LoginNavigationProp = NativeStackScreenProps<
//   RootStackParamList,
//   'LoginScreen'
// >['navigation'];

// export default function LoginScreen() {
//   const navigation = useNavigation<LoginNavigationProp>();
  
//   // 2. Initialize Theme Hook
//   const { styles, colors } = useThemeStyles(styleGenerator);

//   const [passwordVisible, setPasswordVisible] = useState(false);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);

//   // Alert modal state
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const fadeAnim = useState(new Animated.Value(0))[0];

//   const showAlert = (title: string, message: string) => {
//     setAlertTitle(title);
//     setAlertMessage(message);
//     setAlertVisible(true);
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 200,
//       useNativeDriver: true,
//     }).start();
//   };

//   const hideAlert = () => {
//     Animated.timing(fadeAnim, {
//       toValue: 0,
//       duration: 150,
//       useNativeDriver: true,
//     }).start(() => {
//       setAlertVisible(false);

//       // ✅ FIX: Just unset defer. Firebase will automatically change the screen!
//       if (alertTitle === 'Login Successful') {
//         setDefer(false);
//       }
//     });
//   };

//   const handleForgotPassword = async () => {
//     if (!email.trim()) {
//       showAlert('Missing Email', 'Please enter your email to reset password.');
//       return;
//     }
//     try {
//       await auth().sendPasswordResetEmail(email.trim());
//       showAlert('Email Sent', 'A password reset link has been sent to your email.');
//     } catch (error: any) {
//       showAlert('Error', error.message || 'Failed to send reset email.');
//     }
//   };

//   // const handleLogin = async () => {
//   //   if (!email.trim() || !password.trim()) {
//   //     showAlert('Missing Fields', 'Please enter both email and password.');
//   //     return;
//   //   }

//   //   setDefer(true);
//   //   setLoading(true);
//   //   try {
//   //     // 1. Authenticate the user
//   //     const userCredential = await auth().signInWithEmailAndPassword(email.trim(), password);
//   //     const user = userCredential.user;

//   //     // 2. Generate the In-App Notification in Firestore
//   //     await firestore()
//   //       .collection('users')
//   //       .doc(user.uid)
//   //       .collection('notifications')
//   //       .add({
//   //         title: 'Security Alert',
//   //         message: 'A new login was detected on your CodeXpert account.',
//   //         createdAt: firestore.FieldValue.serverTimestamp(),
//   //         isRead: false,
//   //         type: 'auth'
//   //       });

//   //     setLoading(false);
//   //     showAlert('Login Successful', `Welcome back, ${user.email || 'Coder'}!`);
//   //   } catch (error: any) {
//   //     setLoading(false);
//   //     setDefer(false);
//   //     showAlert('Login Failed', error.message || 'Invalid email or password.');
//   //   }
//   // };
// const handleLogin = async () => {
//     if (!email.trim() || !password.trim()) {
//       showAlert('Missing Fields', 'Please enter both email and password.');
//       return;
//     }

//     console.log("1. Login button pressed, starting login...");
//     setDefer(true); // Using the global import!
//     setLoading(true);
    
//     try {
//       // 1. Authenticate the user
//       console.log("2. Reaching out to Firebase...");
//       const userCredential = await auth().signInWithEmailAndPassword(email.trim(), password);
//       const user = userCredential.user;
//       console.log("3. Firebase success! User:", user.email);

//       // 🛑 THE ADMIN INTERCEPTOR
//       if (user.email?.toLowerCase() === "wetom.k173@gmail.com") {
//         console.log("4. Admin detected! Dropping the defer gate...");
//         setLoading(false);
//         setDefer(false); // 👉 Tells AppNavigator to switch to Admin Stack
//         return; 
//       }

//       // 2. Generate the In-App Notification (For normal users)
//       console.log("4. Normal user detected. Saving notification...");
//       await firestore()
//         .collection('users')
//         .doc(user.uid)
//         .collection('notifications')
//         .add({
//           title: 'Security Alert',
//           message: 'A new login was detected on your CodeXpert account.',
//           createdAt: firestore.FieldValue.serverTimestamp(),
//           isRead: false,
//           type: 'auth'
//         });

//       setLoading(false);
//       console.log("5. Dropping the defer gate for normal user...");
//       setDefer(false); // 👉 Tells AppNavigator to switch to Student Stack
      
//       showAlert('Login Successful', `Welcome back, ${user.email || 'Coder'}!`);

//     } catch (error: any) {
//       console.log("❌ LOGIN ERROR:", error.message);
//       setLoading(false);
//       setDefer(false);
//       showAlert('Login Failed', error.message || 'Invalid email or password.');
//     }
//   };
//   return (
//     <SafeAreaView style={styles.container}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//         style={styles.flex1}
//       >
//         <Text style={styles.title}>Welcome Back</Text>
//         <Text style={styles.subtitle}>Login to continue your journey</Text>

//         {/* Email Input */}
//         <View style={styles.inputContainer}>
//           <Text style={styles.inputLabel}>Email Address</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="youremail@email.com"
//             placeholderTextColor={colors.textSecondary}
//             keyboardType="email-address"
//             value={email}
//             onChangeText={setEmail}
//             autoCapitalize="none"
            
//             // Password Manager Support
//             textContentType="username"
//             autoComplete="username"
//             importantForAutofill="yes"
//           />
//         </View>

//         {/* Password Input */}
//         <View style={styles.inputContainer}>
//           <Text style={styles.inputLabel}>Password</Text>
//           <View style={styles.passwordWrapper}>
//             <TextInput
//               style={styles.passwordInput}
//               placeholder="********"
//               placeholderTextColor={colors.textSecondary}
//               secureTextEntry={!passwordVisible}
//               value={password}
//               onChangeText={setPassword}
              
//               // Password Manager Support
//               textContentType="password"
//               autoComplete="password"
//               importantForAutofill="yes"
//             />
//             <TouchableOpacity
//               onPress={() => setPasswordVisible(!passwordVisible)}
//               activeOpacity={0.8}
//             >
//               <Image
//                 source={
//                   passwordVisible
//                     ? require('../Assets/hidepass.png')
//                     : require('../Assets/viewpass.png')
//                 }
//                 style={[styles.eyeIcon, { tintColor: colors.textSecondary }]}
//               />
//             </TouchableOpacity>
//           </View>

//           <TouchableOpacity onPress={handleForgotPassword}>
//             <Text style={styles.forgotText}>Forgot Password?</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Login Button */}
//         <TouchableOpacity
//           style={[styles.loginButton, loading && styles.loginButtonDisabled]}
//           onPress={handleLogin}
//           disabled={loading}
//         >
//           {loading ? (
//             <ActivityIndicator color="#FFFFFF" />
//           ) : (
//             <Text style={styles.loginText}>Log In</Text>
//           )}
//         </TouchableOpacity>

//         {/* Signup */}
//         <Text style={styles.signupPrompt}>
//           Don’t have an account?{' '}
//           <Text
//             style={styles.signupLink}
//             onPress={() => navigation.navigate('SignupScreen')}
//           >
//             Sign up
//           </Text>
//         </Text>
//       </KeyboardAvoidingView>

//       {/* Custom Modal Alert */}
//       <Modal visible={alertVisible} transparent animationType="fade">
//         <View style={styles.modalOverlay}>
//           <Animated.View style={[styles.alertBox, { opacity: fadeAnim }]}>
//             <Text style={styles.alertTitle}>{alertTitle}</Text>
//             <Text style={styles.alertMessage}>{alertMessage}</Text>
//             <TouchableOpacity style={styles.alertButton} onPress={hideAlert}>
//               <Text style={styles.alertButtonText}>OK</Text>
//             </TouchableOpacity>
//           </Animated.View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// // 3. Style Generator
// export const styleGenerator = (colors: any) => StyleSheet.create({
//   flex1: {
//     flex: 1,
//   },
//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//     paddingHorizontal: 20,
//     paddingTop: 80,
//   },
//   title: {
//     fontSize: 28,
//     color: colors.textPrimary,
//     fontFamily: 'Poppins-Bold',
//     marginBottom: 5,
//   },
//   subtitle: {
//     color: colors.textSecondary,
//     fontSize: 14,
//     fontFamily: 'Poppins-Regular',
//     marginBottom: 30,
//   },
//   inputContainer: {
//     marginBottom: 20,
//   },
//   inputLabel: {
//     color: colors.textPrimary,
//     fontSize: 14,
//     marginBottom: 5,
//     fontFamily: 'Poppins-SemiBold',
//   },
//   input: {
//     backgroundColor: colors.card,
//     color: colors.textPrimary,
//     borderRadius: 10,
//     paddingVertical: 12,
//     paddingHorizontal: 15,
//     fontFamily: 'Poppins-Regular',
//     width: '100%',
//     borderWidth: 1,
//     borderColor: colors.border || 'transparent',
//   },
//   passwordWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: colors.card,
//     borderRadius: 10,
//     paddingHorizontal: 15,
//     borderWidth: 1,
//     borderColor: colors.border || 'transparent',
//   },
//   passwordInput: {
//     flex: 1,
//     color: colors.textPrimary,
//     fontFamily: 'Poppins-Regular',
//     paddingVertical: 12,
//   },
//   eyeIcon: {
//     width: 22,
//     height: 22,
//   },
//   forgotText: {
//     color: colors.primary,
//     fontFamily: 'Poppins-Medium',
//     fontSize: 13,
//     textAlign: 'right',
//     marginTop: 6,
//   },
//   loginButton: {
//     backgroundColor: colors.primary,
//     paddingVertical: 15,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginTop: 25,
//   },
//   loginButtonDisabled: {
//     backgroundColor: colors.buttonMuted || '#6B7280',
//     opacity: 0.7,
//   },
//   loginText: {
//     color: '#fff',
//     fontSize: 16,
//     fontFamily: 'Poppins-SemiBold',
//   },
//   signupPrompt: {
//     color: colors.textSecondary,
//     fontSize: 14,
//     fontFamily: 'Poppins-Regular',
//     textAlign: 'center',
//     marginTop: 25,
//   },
//   signupLink: {
//     color: colors.primary,
//     fontFamily: 'Poppins-SemiBold',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: colors.overlay,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   alertBox: {
//     backgroundColor: colors.card,
//     width: '80%',
//     borderRadius: 14,
//     padding: 20,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: colors.border || '#2D2D55',
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   alertTitle: {
//     color: colors.textPrimary,
//     fontSize: 18,
//     fontFamily: 'Poppins-SemiBold',
//     marginBottom: 10,
//   },
//   alertMessage: {
//     color: colors.textSecondary,
//     fontSize: 14,
//     textAlign: 'center',
//     fontFamily: 'Poppins-Regular',
//     marginBottom: 20,
//   },
//   alertButton: {
//     backgroundColor: colors.primary,
//     paddingVertical: 10,
//     paddingHorizontal: 25,
//     borderRadius: 8,
//   },
//   alertButtonText: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     fontFamily: 'Poppins-SemiBold',
//   },
// });
 
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigator/AppNavigator';

// 1. Import Theme Hook & Auth Utils
import { useThemeStyles } from '../hooks/useThemeStyles';
import { setDefer } from '../utils/authControl';

type LoginNavigationProp = NativeStackScreenProps<
  RootStackParamList,
  'LoginScreen'
>['navigation'];

export default function LoginScreen() {
  const navigation = useNavigation<LoginNavigationProp>();
  
  // 2. Initialize Theme Hook
  const { styles, colors } = useThemeStyles(styleGenerator);

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Alert modal state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const fadeAnim = useState(new Animated.Value(0))[0];

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const hideAlert = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setAlertVisible(false);

      // 👉 FIX: Route the navigation ONLY after clicking "OK"
      if (alertTitle === 'Login Successful') {
        setDefer(false);
        const userEmail = auth().currentUser?.email?.toLowerCase();
        
        // Updated Master Admin Email Check
        if (userEmail === 'wetom.k173@gmail.com') {
            navigation.reset({ index: 0, routes: [{ name: 'AdminDashboard' as any }] });
        } else {
            navigation.reset({ index: 0, routes: [{ name: 'HomeScreen' as any }] });
        }
      }
    });
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      showAlert('Missing Email', 'Please enter your email to reset password.');
      return;
    }
    try {
      await auth().sendPasswordResetEmail(email.trim());
      showAlert('Email Sent', 'A password reset link has been sent to your email.');
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to send reset email.');
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showAlert('Missing Fields', 'Please enter both email and password.');
      return;
    }

    setDefer(true);
    setLoading(true);
    
    try {
      // 1. Authenticate the user
      const userCredential = await auth().signInWithEmailAndPassword(email.trim(), password);
      const user = userCredential.user;

      // 2. Generate Notification ONLY for normal students
      if (user.email?.toLowerCase() !== 'wetom.k173@gmail.com') {
        await firestore()
          .collection('users')
          .doc(user.uid)
          .collection('notifications')
          .add({
            title: 'Security Alert',
            message: 'A new login was detected on your CodeXpert account.',
            createdAt: firestore.FieldValue.serverTimestamp(),
            isRead: false,
            type: 'auth'
          });
      }

      setLoading(false);
      // 👉 Do NOT call setDefer(false) here! Wait for the user to click "OK" in hideAlert.
      showAlert('Login Successful', `Welcome back, ${user.email || 'Coder'}!`);

    } catch (error: any) {
      setLoading(false);
      setDefer(false);
      showAlert('Login Failed', error.message || 'Invalid email or password.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex1}
      >
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Login to continue your journey</Text>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="youremail@email.com"
            placeholderTextColor={colors.textSecondary}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            
            // Password Manager Support
            textContentType="username"
            autoComplete="username"
            importantForAutofill="yes"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="********"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={!passwordVisible}
              value={password}
              onChangeText={setPassword}
              
              // Password Manager Support
              textContentType="password"
              autoComplete="password"
              importantForAutofill="yes"
            />
            <TouchableOpacity
              onPress={() => setPasswordVisible(!passwordVisible)}
              activeOpacity={0.8}
            >
              <Image
                source={
                  passwordVisible
                    ? require('../Assets/hidepass.png')
                    : require('../Assets/viewpass.png')
                }
                style={[styles.eyeIcon, { tintColor: colors.textSecondary }]}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.loginText}>Log In</Text>
          )}
        </TouchableOpacity>

        {/* Signup */}
        <Text style={styles.signupPrompt}>
          Don’t have an account?{' '}
          <Text
            style={styles.signupLink}
            onPress={() => navigation.navigate('SignupScreen')}
          >
            Sign up
          </Text>
        </Text>
      </KeyboardAvoidingView>

      {/* Custom Modal Alert */}
      <Modal visible={alertVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.alertBox, { opacity: fadeAnim }]}>
            <Text style={styles.alertTitle}>{alertTitle}</Text>
            <Text style={styles.alertMessage}>{alertMessage}</Text>
            <TouchableOpacity style={styles.alertButton} onPress={hideAlert}>
              <Text style={styles.alertButtonText}>OK</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// 3. Style Generator
export const styleGenerator = (colors: any) => StyleSheet.create({
  flex1: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  title: {
    fontSize: 28,
    color: colors.textPrimary,
    fontFamily: 'Poppins-Bold',
    marginBottom: 5,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: 5,
    fontFamily: 'Poppins-SemiBold',
  },
  input: {
    backgroundColor: colors.card,
    color: colors.textPrimary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontFamily: 'Poppins-Regular',
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border || 'transparent',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: colors.border || 'transparent',
  },
  passwordInput: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: 'Poppins-Regular',
    paddingVertical: 12,
  },
  eyeIcon: {
    width: 22,
    height: 22,
  },
  forgotText: {
    color: colors.primary,
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    textAlign: 'right',
    marginTop: 6,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 25,
  },
  loginButtonDisabled: {
    backgroundColor: colors.buttonMuted || '#6B7280',
    opacity: 0.7,
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  signupPrompt: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginTop: 25,
  },
  signupLink: {
    color: colors.primary,
    fontFamily: 'Poppins-SemiBold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    backgroundColor: colors.card,
    width: '80%',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border || '#2D2D55',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  alertTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 10,
  },
  alertMessage: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    marginBottom: 20,
  },
  alertButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  alertButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
});