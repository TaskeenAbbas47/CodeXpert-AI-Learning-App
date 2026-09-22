import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import LottieView from "lottie-react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigator/AppNavigator";

// 1. Import Theme Hook
import { useThemeStyles } from "../hooks/useThemeStyles";

type TermsNavProp = NativeStackNavigationProp<RootStackParamList, "TermsScreen">;

const TermsScreen = () => {
  const navigation = useNavigation<TermsNavProp>();
  
  // 2. Initialize Theme Hook
  const { styles, colors } = useThemeStyles(styleGenerator);

  const [showBackAnim, setShowBackAnim] = useState(false);
  const animationRef = useRef<LottieView>(null);

  const playBackAnim = () =>
    new Promise<void>((resolve) => {
      setShowBackAnim(true);
      animationRef.current?.play();
      setTimeout(() => {
        setShowBackAnim(false);
        resolve();
      }, 1500);
    });

  const handleAgree = async () => {
    await playBackAnim();
    navigation.navigate("SignupScreen", { agreed: true });
  };

  const handleBack = async () => {
    await playBackAnim();
    navigation.navigate("SignupScreen");
  };

  return (
    <View style={styles.container}>
      {/* Back Animation Overlay */}
      {showBackAnim && (
        <View style={styles.backAnimOverlay}>
          <LottieView
            ref={animationRef}
            source={require("../Assets/backAnimation.json")}
            autoPlay
            loop={false}
            style={styles.backAnim}
          />
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Image 
            source={require("../Assets/back.png")} 
            style={[styles.backIcon, { tintColor: colors.icon }]} 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
      </View>

      {/* Scrollable Terms */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.sectionText}>
          Welcome to our app. By using this application, you agree to comply
          with and be bound by the following terms and conditions of use.
        </Text>

        <Text style={styles.sectionTitle}>2. User Responsibilities</Text>
        <Text style={styles.sectionText}>
          Users must provide accurate information during account creation and
          must not engage in activities that violate any laws or regulations.
        </Text>

        <Text style={styles.sectionTitle}>3. Data & Privacy</Text>
        <Text style={styles.sectionText}>
          We value your privacy. Personal data collected is used solely for
          enhancing user experience and is never sold to third parties.
        </Text>

        <Text style={styles.sectionTitle}>4. Intellectual Property</Text>
        <Text style={styles.sectionText}>
          All materials, trademarks, and content within this app are the
          property of the developers. Unauthorized use may lead to legal action.
        </Text>

        <Text style={styles.sectionTitle}>5. Limitation of Liability</Text>
        <Text style={styles.sectionText}>
          We are not liable for any direct or indirect damages resulting from
          the use or inability to use this application.
        </Text>

        <Text style={styles.sectionTitle}>6. Account Termination</Text>
        <Text style={styles.sectionText}>
          We reserve the right to suspend or terminate accounts found violating
          these terms or engaging in abusive behavior.
        </Text>

        <Text style={styles.sectionTitle}>7. Updates to Terms</Text>
        <Text style={styles.sectionText}>
          These terms may be updated periodically. Continued use of the app
          implies acceptance of the updated terms.
        </Text>

        <Text style={styles.sectionTitle}>8. Contact Us</Text>
        <Text style={styles.sectionText}>
          For questions, contact our support team via the Help section.
        </Text>

        {/* Agree Button */}
        <TouchableOpacity style={styles.agreeBtn} onPress={handleAgree}>
          <Text style={styles.agreeText}>Agree & Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default TermsScreen;

// 3. Style Generator
export const styleGenerator = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Dynamic Background
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border || "#222",
  },
  backIcon: {
    width: 26,
    height: 26,
    // tintColor handled inline
    marginRight: 12,
    resizeMode: "contain",
  },
  headerTitle: {
    fontSize: 18,
    color: colors.textPrimary, // Dynamic Text
    fontFamily: "Poppins-SemiBold",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: colors.textPrimary, // Dynamic Title
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 6,
    marginTop: 12,
  },
  sectionText: {
    color: colors.textSecondary, // Dynamic Body Text
    fontSize: 13,
    lineHeight: 20,
    fontFamily: "Poppins-Regular",
    marginBottom: 8,
  },
  agreeBtn: {
    backgroundColor: colors.primary, // Dynamic Blue
    marginTop: 25,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  agreeText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
  },
  backAnimOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background, // Matches theme bg
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  backAnim: {
    width: 200,
    height: 200,
  },
});