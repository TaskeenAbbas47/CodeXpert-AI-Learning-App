import React, { useEffect, useRef } from "react";
import { View, Image, StyleSheet, Animated, Easing } from "react-native";

// 1. Import Theme Hooks
import { useThemeStyles } from "../hooks/useThemeStyles";
import { useTheme } from "../context/ThemeContext";

type SplashProps = {
  onFinish: () => void;
};

export default function Splash({ onFinish }: SplashProps) {
  // 2. Initialize Hooks
  const { styles, colors } = useThemeStyles(styleGenerator);
  const { isDark } = useTheme(); // Used for conditional image tinting

  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 2200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start(() => {
      onFinish();
    });
  }, [onFinish, progress]);

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "80%"],
  });

  return (
    <View style={styles.container}>
      <Image
        source={require("../Assets/Spalsh-img.png")}
        style={[
          styles.logo,
          // In Light mode, we tint the logo dark for better visibility.
          // In Dark mode, we use the original asset colors.
          !isDark && { tintColor: colors.textPrimary }
        ]}
        resizeMode="contain"
      />

      <View style={styles.track}>
        <Animated.View style={[styles.bar, { width: barWidth }]} />
      </View>
    </View>
  );
}

// 3. Style Generator
export const styleGenerator = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Dynamic Background
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: 40,
    // tintColor is handled inline
  },
  track: {
    width: "55%",
    height: 8,
    borderRadius: 8,
    backgroundColor: colors.border || "#2D2D4D", // Dynamic Track Color
    overflow: "hidden",
    // Shadow for depth in Light Mode
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  bar: {
    height: "100%",
    borderRadius: 8,
    backgroundColor: colors.primary, // Dynamic Progress Color (Blue)
  },
});