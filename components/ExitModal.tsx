import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
} from "react-native";
import LottieView from "lottie-react-native";
import { BackHandler } from "react-native";

// 1. Import Theme Hook
import { useThemeStyles } from "../hooks/useThemeStyles";

interface ExitModalProps {
  visible: boolean;
  onClose: () => void;
  onExit?: () => void;
}

export default function ExitModal({ visible, onClose, onExit }: ExitModalProps) {
  // 2. Initialize Hook
  const { styles } = useThemeStyles(styleGenerator);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      animationRef.current?.play();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  const handleExit = () => {
    if (onExit) onExit();
    else BackHandler.exitApp();
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <View style={styles.modalBox}>
          <LottieView
            ref={animationRef}
            source={require("../Assets/really.json")}
            autoPlay
            loop={true}
            style={styles.lottie}
          />

          <Text style={styles.title}>Exit CodeXpert ?</Text>
          <Text style={styles.message}>
            Are you sure you want to close the app?
          </Text>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.exitButton]}
              onPress={handleExit}
            >
              <Text style={styles.exitText}>Exit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

// 3. Style Generator
const styleGenerator = (colors: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay, // Dynamic Overlay
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: colors.card, // Dynamic Card Background
    width: "80%",
    borderRadius: 16,
    padding: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border || "#2D2D55",
    // Shadow for light mode depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  lottie: {
    width: 160,
    height: 160,
  },
  title: {
    color: colors.textPrimary, // Dynamic Title
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    marginTop: 5,
  },
  message: {
    color: colors.textSecondary, // Dynamic Message
    fontSize: 14,
    textAlign: "center",
    marginVertical: 10,
    fontFamily: "Poppins-Regular",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: colors.buttonMuted, // Dynamic Muted Button
  },
  exitButton: {
    backgroundColor: colors.primary, // Dynamic Primary Button
  },
  cancelText: {
    color: colors.textPrimary, // Ensure text is visible on muted background
    fontFamily: "Poppins-SemiBold",
  },
  exitText: {
    color: "#FFFFFF", // Primary button usually keeps white text
    fontFamily: "Poppins-SemiBold",
  },
});