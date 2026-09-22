/* eslint-disable @typescript-eslint/no-unused-vars */
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

// 1. Import Hooks
import { useTheme } from "../context/ThemeContext";
import { useThemeStyles } from "../hooks/useThemeStyles";
import { useBackWithAnim } from "../hooks/useBackWithAnim";

export default function AppearanceScreen() {
  
  // 2. Initialize Theme Hooks
  const { styles, colors } = useThemeStyles(styleGenerator);
  const { isDark, setTheme } = useTheme();

  // Back Animation State
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

  const { handleBackPress } = useBackWithAnim(playBackAnim, "Settings");

  // Selection Handler
  const handleSelectTheme = (mode: 'light' | 'dark') => {
    setTheme(mode);
  };

  const renderOption = (label: string, mode: 'light' | 'dark', description: string) => {
    const isSelected = (mode === 'dark' && isDark) || (mode === 'light' && !isDark);

    return (
      <TouchableOpacity
        style={[styles.optionCard, isSelected && styles.selectedOption]}
        onPress={() => handleSelectTheme(mode)}
        activeOpacity={0.8}
      >
        <View style={styles.textWrapper}>
          <Text style={styles.optionTitle}>{label}</Text>
          <Text style={styles.optionDesc}>{description}</Text>
        </View>

        {/* Radio Circle */}
        <View style={styles.radioCircle}>
          {isSelected && <View style={styles.radioDot} />}
        </View>
      </TouchableOpacity>
    );
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
        <TouchableOpacity onPress={handleBackPress}>
          <Image
            source={require("../Assets/back.png")}
            style={[styles.backIcon, { tintColor: colors.icon }]}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appearance</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionHeader}>Theme Preference</Text>
        
        {renderOption(
          "Dark Mode", 
          "dark", 
          "Easier on the eyes, perfect for low-light environments."
        )}
        
        {renderOption(
          "Light Mode", 
          "light", 
          "Bright and clear, ideal for sunny days or bright rooms."
        )}
      </ScrollView>
    </View>
  );
}

// 3. Style Generator
const styleGenerator = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    marginRight: 12,
    resizeMode: "contain",
  },
  headerTitle: {
    fontSize: 18,
    color: colors.textPrimary,
    fontFamily: "Poppins-SemiBold",
  },
  content: {
    padding: 20,
  },
  sectionHeader: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border || "transparent",
    // Shadow for Light Mode
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedOption: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  textWrapper: {
    flex: 1,
    paddingRight: 10,
  },
  optionTitle: {
    fontSize: 16,
    color: colors.textPrimary,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: "Poppins-Regular",
    lineHeight: 18,
  },
  radioCircle: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  
  // Animation Styles
  backAnimOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  backAnim: {
    width: 200,
    height: 200,
  },
});