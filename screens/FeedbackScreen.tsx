/* eslint-disable react-native/no-inline-styles */
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  BackHandler, // ✅ Import BackHandler
} from "react-native";
import LottieView from "lottie-react-native";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native"; 
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

import { useThemeStyles } from "../hooks/useThemeStyles";

const CATEGORIES = ["Suggestion", "Bug Report", "Content Issue", "Other"];

export default function FeedbackScreen() {
  const { styles, colors } = useThemeStyles(styleGenerator);
  const navigation = useNavigation<any>();
  const route = useRoute<any>(); 
  
  const [feedback, setFeedback] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Suggestion");
  const [loading, setLoading] = useState(false);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showBackAnim, setShowBackAnim] = useState(false);

  // ✅ 1. ROBUST BACK NAVIGATION LOGIC
  const handleBackPress = useCallback(() => {
    setShowBackAnim(true);
    setTimeout(() => {
        // Priority 1: Specific screen passed via params
        if (route.params?.fromScreen) {
            navigation.navigate(route.params.fromScreen);
        } 
        // Priority 2: Standard history
        else if (navigation.canGoBack()) {
            navigation.goBack(); 
        } 
        // Priority 3: Fallback
        else {
            navigation.navigate("Settings");
        }
    }, 600);
  }, [navigation, route.params]);

  // ✅ 2. HANDLE HARDWARE BACK BUTTON
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleBackPress(); // Trigger our custom animation & logic
        return true; // Prevent default behavior (immediate exit)
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [handleBackPress])
  );

  const handleSubmit = async () => {
    if (!feedback.trim()) return; 

    setLoading(true);
    const user = auth().currentUser;

    try {
      await firestore().collection("feedback").add({
        userId: user?.uid || "anonymous",
        userEmail: user?.email || "anonymous",
        category: selectedCategory,
        message: feedback.trim(),
        timestamp: firestore.FieldValue.serverTimestamp(),
        device: Platform.OS + " " + Platform.Version,
        status: "pending",
      });

      setLoading(false);
      setShowSuccessModal(true);
      setFeedback(""); 
      
      setTimeout(() => {
        setShowSuccessModal(false);
        handleBackPress();
      }, 2500);

    } catch (error) {
      console.error("Feedback Error:", error);
      setLoading(false);
      setErrorMessage("Failed to send feedback. Please check your internet connection.");
      setShowErrorModal(true);
      setTimeout(() => setShowErrorModal(false), 3000);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        
        {showBackAnim && (
          <View style={styles.backAnimOverlay}>
            <LottieView source={require("../Assets/backAnimation.json")} autoPlay loop={false} style={styles.backAnim} />
          </View>
        )}

        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress}>
            <Image source={require("../Assets/back.png")} style={[styles.backIcon, { tintColor: colors.icon }]} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Send Feedback</Text>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          
          <Text style={styles.subHeader}>We'd love to hear from you!</Text>
          <Text style={styles.description}>
            Have a suggestion or found a bug? Let us know so we can improve CodeXpert.
          </Text>

          <Text style={styles.label}>Category</Text>
          <View style={styles.chipContainer}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.chip,
                  selectedCategory === cat && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedCategory === cat && { color: "#FFF", fontFamily: "Poppins-SemiBold" }
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Your Message</Text>
          <TextInput
            style={styles.input}
            placeholder="Type your feedback here..."
            placeholderTextColor={colors.textSecondary}
            multiline
            textAlignVertical="top"
            value={feedback}
            onChangeText={setFeedback}
          />

          <TouchableOpacity
            style={[styles.submitBtn, !feedback.trim() && styles.disabledBtn]}
            onPress={handleSubmit}
            disabled={loading || !feedback.trim()}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitText}>Submit Feedback</Text>
            )}
          </TouchableOpacity>

        </KeyboardAvoidingView>

        <Modal visible={showSuccessModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <LottieView
                source={require("../Assets/success.json")}
                autoPlay
                loop={false}
                style={{ width: 120, height: 120 }}
              />
              <Text style={styles.modalTitle}>Thank You!</Text>
              <Text style={styles.modalDesc}>Your feedback helps us grow.</Text>
            </View>
          </View>
        </Modal>

        <Modal visible={showErrorModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <LottieView
                source={require("../Assets/Error.json")} 
                autoPlay
                loop={false}
                style={{ width: 100, height: 100, marginBottom: 10 }}
              />
              <Text style={[styles.modalTitle, { color: '#FF4545' }]}>Ooops!</Text>
              <Text style={styles.modalDesc}>{errorMessage}</Text>
              <TouchableOpacity 
                style={styles.closeBtn}
                onPress={() => setShowErrorModal(false)}
              >
                <Text style={styles.closeBtnText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </View>
    </TouchableWithoutFeedback>
  );
}

// 3. Style Generator
const styleGenerator = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24 },
  
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  backIcon: { width: 24, height: 24, marginRight: 15, resizeMode: "contain" },
  headerText: { color: colors.textPrimary, fontSize: 22, fontFamily: "Poppins-SemiBold" },

  subHeader: { color: colors.textPrimary, fontSize: 24, fontFamily: "Poppins-Bold", marginBottom: 8 },
  description: { color: colors.textSecondary, fontSize: 15, fontFamily: "Poppins-Regular", marginBottom: 30, lineHeight: 22 },

  label: { color: colors.textPrimary, fontSize: 16, fontFamily: "Poppins-SemiBold", marginBottom: 12 },

  chipContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 30 },
  chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: colors.border || "#2D2D55", backgroundColor: colors.card },
  chipText: { color: colors.textSecondary, fontSize: 14, fontFamily: "Poppins-Medium" },

  input: { backgroundColor: colors.card, color: colors.textPrimary, borderRadius: 16, padding: 16, height: 150, borderWidth: 1, borderColor: colors.border || "#2D2D55", fontSize: 15, fontFamily: "Poppins-Regular", marginBottom: 30 },

  submitBtn: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 14, alignItems: "center", shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  disabledBtn: { backgroundColor: colors.buttonMuted || "#2D2D55", shadowOpacity: 0 },
  submitText: { color: "#FFF", fontFamily: "Poppins-SemiBold", fontSize: 16 },

  modalOverlay: { flex: 1, backgroundColor: colors.overlay || "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center" },
  modalCard: { width: "80%", backgroundColor: colors.card, borderRadius: 24, alignItems: "center", padding: 30, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  modalTitle: { color: colors.textPrimary, fontSize: 20, fontFamily: "Poppins-Bold", marginTop: 5, marginBottom: 5 },
  modalDesc: { color: colors.textSecondary, fontSize: 14, fontFamily: "Poppins-Regular", textAlign: "center", marginBottom: 15 },
  
  closeBtn: { marginTop: 10, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#FF454515', borderRadius: 10 },
  closeBtnText: { color: '#FF4545', fontFamily: "Poppins-SemiBold" },

  backAnimOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.background, justifyContent: "center", alignItems: "center", zIndex: 100 },
  backAnim: { width: 200, height: 200 },
});