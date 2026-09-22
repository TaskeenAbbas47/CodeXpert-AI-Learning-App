/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";

// ✅ Import Notification Manager instance
import { notificationManager } from './utils/notificationManager';

// Navigation & Screens
import Splash from "./screens/Splash";
import AppNavigator from "./navigator/AppNavigator";

// Theme Provider & Hook
import { ThemeProvider, useTheme } from "./context/ThemeContext";

// ----------------------
// Custom Toast Components
// ----------------------
const SuccessToast = (props: any) => {
  const { colors } = useTheme();
  return (
    <BaseToast
      {...props}
      style={{
        ...toastStylesBase.successContainer,
        backgroundColor: colors.card,
        borderLeftColor: colors.success,
      }}
      contentContainerStyle={toastStylesBase.contentContainer}
      text1Style={{
        ...toastStylesBase.text1,
        color: colors.textPrimary,
      }}
      text2Style={{
        ...toastStylesBase.text2,
        color: colors.textSecondary,
      }}
    />
  );
};

const ErrorToastCustom = (props: any) => {
  const { colors } = useTheme();
  return (
    <ErrorToast
      {...props}
      style={{
        ...toastStylesBase.errorContainer,
        backgroundColor: colors.card,
        borderLeftColor: colors.accent,
      }}
      text1Style={{
        ...toastStylesBase.text1,
        color: colors.textPrimary,
      }}
      text2Style={{
        ...toastStylesBase.text2,
        color: colors.textSecondary,
      }}
    />
  );
};

// ----------------------
// App Content (Child of Provider)
// ----------------------
const AppContent: React.FC = () => {
  const { isDark, colors } = useTheme();
  const [showSplash, setShowSplash] = useState(true);

  // ✅ FIXED: Corrected async cleanup logic to prevent memory leaks/errors
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupNotifications = async () => {
      // 1. Request Permission using class instance
      const hasPermission = await notificationManager.requestPermission();
      
      if (hasPermission) {
        // 2. Sync token to Firestore
        await notificationManager.getAndSaveToken();
      }

      // 3. Set up foreground/background listeners
      const cleanup = notificationManager.setupListeners();
      if (typeof cleanup === 'function') {
        unsubscribe = cleanup;
      }
    };

    setupNotifications();

    // 4. Cleanup listener on unmount
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const toastConfig = {
    success: (props: any) => <SuccessToast {...props} />,
    error: (props: any) => <ErrorToastCustom {...props} />,
  };

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaProvider>
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={colors.background}
          translucent={false}
        />
        
        {showSplash ? (
          <Splash onFinish={() => setShowSplash(false)} />
        ) : (
          <>
            <AppNavigator />
            <Toast config={toastConfig} position="bottom" bottomOffset={70} />
          </>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

// ----------------------
// Main App Entry
// ----------------------
export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

// ----------------------
// Base Styles
// ----------------------
const toastStylesBase = StyleSheet.create({
  successContainer: {
    borderLeftWidth: 5,
    height: 60,
    width: '90%',
    borderRadius: 10,
    backgroundColor: "#0A0A23",
    borderLeftColor: "#4CAF50",
    elevation: 5,
  },
  errorContainer: {
    borderLeftWidth: 5,
    height: 60,
    width: '90%',
    borderRadius: 10,
    backgroundColor: "#0A0A23",
    borderLeftColor: "#FF4C4C",
    elevation: 5,
  },
  contentContainer: {
    paddingHorizontal: 15,
  },
  text1: {
    fontSize: 14,
    fontWeight: "600",
  },
  text2: {
    fontSize: 12,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});