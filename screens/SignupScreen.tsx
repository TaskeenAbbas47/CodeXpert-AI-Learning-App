/* eslint-disable react-native/no-inline-styles */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Animated,
  Image,
} from 'react-native';
import { useFocusEffect, useRoute, useNavigation } from "@react-navigation/native";
import CheckBox from '@react-native-community/checkbox';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigator/AppNavigator';

// 1. Import Theme Hook
import { useThemeStyles } from '../hooks/useThemeStyles';

type SignupNavigationProp = NativeStackScreenProps<
  RootStackParamList,
  'SignupScreen'
>['navigation'];

export default function SignupScreen() {
  const navigation = useNavigation<SignupNavigationProp>();

  // 2. Initialize Theme Hook
  const { styles, colors } = useThemeStyles(styleGenerator);

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  // Custom modal alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const fadeAnim = useState(new Animated.Value(0))[0];

  const route = useRoute();

  useFocusEffect(
    useCallback(() => {
      if (route.params && (route.params as any).agreed) {
        setAcceptedTerms(true);
      }
    }, [route.params])
  );

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
    Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  };

  const hideAlert = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() =>
      setAlertVisible(false)
    );
  };

  const validatePassword = (text: string) => {
    setPassword(text);
    setPasswordChecks({
      length: text.length >= 8,
      upper: /[A-Z]/.test(text),
      lower: /[a-z]/.test(text),
      number: /[0-9]/.test(text),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(text),
    });
  };

  const isValidEmail = (inputEmail: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(inputEmail);
  };

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim()) {
      showAlert('Missing Fields', 'Please enter both email and password.');
      return;
    }

    if (!isValidEmail(email)) {
      showAlert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    const { length, upper, lower, number, special } = passwordChecks;
    if (!(length && upper && lower && number && special)) {
      showAlert('Weak Password', 'Your password does not meet the strength requirements.');
      return;
    }

    if (!acceptedTerms) {
      showAlert('Terms Required', 'You must accept the Terms & Conditions to continue.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const { user } = userCredential;

      await firestore().collection('users').doc(user.uid).set({
        email: user.email,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      setLoading(false);
      navigation.navigate('Confirmation', { nextScreen: 'HomeScreen' });
    } catch (error: any) {
      setLoading(false);
      showAlert('Signup Failed', error.message || 'An unexpected error occurred.');
    }
  };

  const renderCheck = (label: string, condition: boolean) => (
    <View style={styles.checkRow}>
      <Image
        source={require('../Assets/check.png')}
        style={styles.checkIcon}
        // Semantic colors (Green/Red) usually stay the same, but Red can use accent color
        tintColor={condition ? '#4CAF50' : colors.accent}
      />
      <Text style={[styles.checkText, condition ? { color: '#4CAF50' } : { color: colors.accent }]}>
        {label}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <Text style={styles.subtitle}>Create your account below</Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Your Email</Text>
        <TextInput
          style={styles.input}
          placeholder="@example@gmail.com"
          placeholderTextColor={colors.textSecondary}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
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
            onChangeText={validatePassword}
          />
          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
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

        {/* Password Checks */}
        <View style={styles.passwordChecks}>
          {renderCheck('At least 8 characters', passwordChecks.length)}
          {renderCheck('One uppercase letter', passwordChecks.upper)}
          {renderCheck('One lowercase letter', passwordChecks.lower)}
          {renderCheck('One number', passwordChecks.number)}
          {renderCheck('One special character', passwordChecks.special)}
        </View>
      </View>

      {/* Terms */}
      <View style={styles.checkboxContainer}>
        <CheckBox
          value={acceptedTerms}
          onValueChange={setAcceptedTerms}
          tintColors={{ true: colors.primary, false: colors.textSecondary }}
        />
        <Text style={styles.termsText}>
          I agree to the{' '}
          <Text
            style={styles.termsLink}
            onPress={() => navigation.navigate("TermsScreen", { fromSignup: true })}
          >
            Terms & Conditions
          </Text>
        </Text>
      </View>

      {/* Sign Up Button */}
      <TouchableOpacity
        style={[
          styles.createAccountButton,
          (!acceptedTerms || loading) && styles.createAccountButtonDisabled,
        ]}
        disabled={!acceptedTerms || loading}
        onPress={handleSignUp}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.createAccountText}>Create Account</Text>
        )}
      </TouchableOpacity>

      {/* Login Link */}
      <Text style={styles.loginPrompt}>
        Already have an account?{' '}
        <Text
          style={styles.loginLink}
          onPress={() => navigation.navigate('LoginScreen')}
        >
          Log in
        </Text>
      </Text>

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
  container: {
    flex: 1,
    backgroundColor: colors.background, // Dynamic
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  title: {
    fontSize: 28,
    color: colors.textPrimary, // Dynamic
    fontFamily: 'Poppins-Bold',
    marginBottom: 5,
  },
  subtitle: {
    color: colors.textSecondary, // Dynamic
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: colors.textPrimary, // Dynamic
    fontSize: 14,
    marginBottom: 5,
    fontFamily: 'Poppins-SemiBold',
  },
  input: {
    backgroundColor: colors.card, // Dynamic
    color: colors.textPrimary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontFamily: 'Poppins-Regular',
    borderWidth: 1,
    borderColor: colors.border || 'transparent',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card, // Dynamic
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
    // tintColor handled inline
  },
  passwordChecks: {
    marginTop: 8,
    paddingLeft: 8,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  checkIcon: {
    width: 14,
    height: 14,
    marginRight: 8,
  },
  checkText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  // textGreen/textRed handled inline for cleaner prop passing

  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  termsText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    marginLeft: 8,
  },
  termsLink: {
    color: colors.primary, // Dynamic Blue
  },
  createAccountButton: {
    backgroundColor: colors.primary, // Dynamic Blue
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  createAccountButtonDisabled: {
    backgroundColor: colors.buttonMuted || '#6B7280',
    opacity: 0.7,
  },
  createAccountText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  loginPrompt: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginTop: 20,
  },
  loginLink: {
    color: colors.primary,
    fontFamily: 'Poppins-SemiBold',
  },

  // Modal Styles
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
    // Shadow for light mode
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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