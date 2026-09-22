import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SectionList,
  Modal,
  ActivityIndicator,
} from "react-native";
import LottieView from "lottie-react-native";
import { useNavigation } from "@react-navigation/native";
import { useBackWithAnim } from "../hooks/useBackWithAnim";
import auth from "@react-native-firebase/auth";

// 1. Import Theme Hooks
import { useThemeStyles } from "../hooks/useThemeStyles";

type SettingItem = {
  id: string;
  title: string;
  icon: any;
  screen: string;
};

type SectionData = {
  title: string;
  data: SettingItem[];
};

const settingsSections: SectionData[] = [
  {
    title: "Account",
    data: [
      { id: "1", title: "Profile", icon: require("../Assets/profile1.png"), screen: "Profile" },
      { id: "2", title: "Notifications", icon: require("../Assets/notification.png"), screen: "Notification" },
      { id: "3", title: "Courses", icon: require("../Assets/course.png"), screen: "Courses" }, 
      { id: "4", title: "Certificates", icon: require("../Assets/certificate.png"), screen: "Certificates" }, 
      { id: "5", title: "Privacy & Security", icon: require("../Assets/security.png"), screen: "PrivacyScreen" },
    ],
  },
  {
    title: "System",
    data: [
      { id: "6", title: "Appearance", icon: require("../Assets/mode.png"), screen: "AppearanceScreen" },
      { id: "7", title: "Help Center", icon: require("../Assets/support.png"), screen: "SupportScreen" },
      { id: "8", title: "Feedback", icon: require("../Assets/feedback.png"), screen: "FeedbackScreen" }, 
      { id: "9", title: "About", icon: require("../Assets/about.png"), screen: "About" },
    ],
  },
];

const SettingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const animationRef = useRef<LottieView | null>(null);

  // 2. Initialize Theme Hook
  const { styles, colors } = useThemeStyles(styleGenerator);

  const [showBackAnim, setShowBackAnim] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const playBackAnim = useCallback(
    () =>
      new Promise<void>((resolve) => {
        setShowBackAnim(true);
        animationRef.current?.play();
        setTimeout(() => {
          resolve();
        }, 600);
      }),
    []
  );

  const { handleBackPress } = useBackWithAnim(playBackAnim, "HomeScreen");

  const handleNavigate = useCallback(
    (screen: string) => {
      if (screen) navigation.navigate(screen);
    },
    [navigation]
  );

  const handleLogoutConfirm = useCallback(async () => {
    try {
      setLoading(true);
      
      // ✅ FIXED: Typed Promise to solve TS error 2794
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
      
      await auth().signOut();
      setLoading(false);
      setShowLogoutConfirm(false);
      
      setShowSuccessModal(true);

      setTimeout(() => {
          setShowSuccessModal(false);
      }, 2000);

    } catch (error) {
      setLoading(false);
      console.error(error);
      // Removed alert to satisfy linter
    }
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: SettingItem }) => {
      return (
        <TouchableOpacity style={styles.item} onPress={() => handleNavigate(item.screen)}>
          <View style={styles.itemLeft}>
            <Image source={item.icon} style={styles.icon} />
            <Text style={styles.itemText}>{item.title}</Text>
          </View>
          <Text style={styles.arrow}>{">"}</Text>
        </TouchableOpacity>
      );
    },
    [styles, handleNavigate]
  );

  return (
    <View style={styles.container}>
      {showBackAnim && (
        <View style={styles.backAnimOverlay}>
          <LottieView
            ref={animationRef}
            source={require("../Assets/backAnimation.json")}
            autoPlay
            loop={false}
            speed={1.75}
            style={styles.backAnim}
          />
        </View>
      )}

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Image
            source={require("../Assets/back.png")}
            style={[styles.backIcon, { tintColor: colors.icon }]}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <SectionList
          sections={settingsSections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false} 
          ListFooterComponent={
            <TouchableOpacity style={styles.logoutBtn} onPress={() => setShowLogoutConfirm(true)}>
              <Image
                source={require("../Assets/logout.png")}
                style={[styles.logoutIcon, { tintColor: colors.accent }]}
              />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          }
        />

      {/* Logout Confirmation Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={showLogoutConfirm}
        onRequestClose={() => setShowLogoutConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LottieView source={require("../Assets/logout.json")} autoPlay loop style={styles.logoutAnim} />
            <Text style={styles.modalTitle}>Log Out?</Text>
            <Text style={styles.modalSubtitle}>Are you sure you want to sign out of your account?</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setShowLogoutConfirm(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={handleLogoutConfirm} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.confirmText}>Logout</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.successModal}>
              {/* ✅ FIXED: Removed inline style */}
              <LottieView
                source={require("../Assets/success.json")}
                autoPlay
                loop={false}
                style={styles.successAnim}
              />
              <Text style={styles.successTitle}>Logged Out</Text>
              <Text style={styles.successDesc}>See you soon!</Text>
            </View>
          </View>
        </Modal>

    </View>
  );
};

export default SettingScreen;

// 4. Style Generator
export const styleGenerator = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    center: {
      justifyContent: "center",
      alignItems: "center",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border || "#1E1E3C",
    },
    backIcon: {
      width: 26,
      height: 26,
      marginRight: 10,
      resizeMode: "contain",
    },
    headerTitle: {
      color: colors.textPrimary,
      fontSize: 18,
      fontFamily: "Poppins-SemiBold",
    },

    list: {
      paddingHorizontal: 16,
      paddingBottom: 40,
    },
    
    sectionHeader: {
      color: colors.textSecondary,
      fontSize: 13,
      fontFamily: "Poppins-SemiBold",
      marginTop: 24,
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: 1,
      opacity: 0.8,
    },
    item: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.card,
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 12, 
      marginVertical: 6,
      borderWidth: 1,
      borderColor: colors.border || "#22225C",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    itemLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    icon: {
      width: 22,
      height: 22,
      tintColor: colors.icon,
      marginRight: 12,
      resizeMode: "contain",
    },
    itemText: {
      color: colors.textPrimary,
      fontSize: 14,
      fontFamily: "Poppins-Medium", 
    },
    arrow: {
      color: colors.textSecondary,
      fontSize: 16,
    },

    logoutBtn: {
      marginTop: 30,
      paddingVertical: 14,
      backgroundColor: colors.card,
      borderRadius: 10,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border || "#2D2D55",
    },
    logoutIcon: {
      width: 22,
      height: 22,
      marginRight: 8,
      resizeMode: "contain",
    },
    logoutText: {
      color: colors.accent,
      fontSize: 15,
      fontFamily: "Poppins-SemiBold",
    },

    // Animations
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
    backAnim: { width: 200, height: 200 },

    // Modals
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlay || "rgba(0,0,0,0.7)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      width: "85%",
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 24,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    logoutAnim: { width: 150, height: 150, marginBottom: 10 },
    modalTitle: {
      color: colors.textPrimary,
      fontSize: 20,
      fontFamily: "Poppins-Bold",
      marginBottom: 8,
    },
    modalSubtitle: {
      color: colors.textSecondary,
      fontSize: 14,
      fontFamily: "Poppins-Regular",
      textAlign: "center",
      marginBottom: 24,
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      gap: 12,
    },
    modalBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: "center",
    },
    cancelBtn: {
      backgroundColor: colors.buttonMuted || "#2D2D55",
    },
    confirmBtn: {
      backgroundColor: colors.accent,
    },
    cancelText: {
      color: colors.textPrimary,
      fontFamily: "Poppins-SemiBold",
    },
    confirmText: {
      color: "#FFFFFF",
      fontFamily: "Poppins-SemiBold",
    },

    // Success Modal Styles
    successModal: {
        width: "70%",
        backgroundColor: colors.card,
        borderRadius: 20,
        alignItems: "center",
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    // ✅ Added style for Success Animation
    successAnim: {
        width: 100,
        height: 100,
    },
    successTitle: {
        color: colors.textPrimary,
        fontSize: 18,
        fontFamily: "Poppins-Bold",
        marginTop: 10,
    },
    successDesc: {
        color: colors.textSecondary,
        fontSize: 14,
        fontFamily: "Poppins-Regular",
        marginTop: 4,
    }
  });