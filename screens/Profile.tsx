/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  Animated,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import LottieView from "lottie-react-native";
import { useBackWithAnim } from "../hooks/useBackWithAnim";

import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

// 1. Import Theme Hook
import { useThemeStyles } from "../hooks/useThemeStyles";

const avatars = [
  require("../Assets/avatar1.png"),
  require("../Assets/avatar8.png"),
  require("../Assets/avatar3.png"),
  require("../Assets/avatar6.png"),
  require("../Assets/avatar7.png"),
  require("../Assets/avatar5.png"),
  require("../Assets/avatar4.png"),
  require("../Assets/avatar9.png"),
  require("../Assets/avatar2.png"),
 
];

const eyeIcon = require("../Assets/eye.png"); 
const eyeOffIcon = require("../Assets/eye-off.png");

type UserData = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatarIndex?: number;
};

export default function Profile() {
  const { styles, colors } = useThemeStyles(styleGenerator);

  const [avatar, setAvatar] = useState(avatars[0]);
  const [scale] = useState(new Animated.Value(1));
  const [isLoading, setIsLoading] = useState(true);
  
  // User Fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  // Modals
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // Password Change State
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Visibility Toggles
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Animation
  const [showBackAnim, setShowBackAnim] = useState(false);
  const playBackAnim = () => new Promise<void>((resolve) => { setShowBackAnim(true); setTimeout(() => resolve(), 600); });
  const { handleBackPress } = useBackWithAnim(playBackAnim, "Settings");

  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => setShowSuccessModal(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessModal]);

  useEffect(() => {
    const currentUser = auth().currentUser;
    if (!currentUser) return;

    const unsubscribeUser = firestore()
      .collection("users")
      .doc(currentUser.uid)
      .onSnapshot((documentSnapshot) => {
        if (documentSnapshot.exists()) {
          const userData = documentSnapshot.data() as UserData;
          setFirstName(userData.firstName || "");
          setLastName(userData.lastName || "");
          setUsername(userData.username || "");
          setEmail(currentUser.email || ""); 
          if (userData.avatarIndex !== undefined) {
            setAvatar(avatars[userData.avatarIndex]);
          }
        }
        if (isLoading) setIsLoading(false);
      });

    return () => unsubscribeUser();
  }, [isLoading]);

  const handleAvatarChange = async (index: number) => {
    setShowAvatarModal(false);
    const currentUser = auth().currentUser;
    if (!currentUser) return;

    try {
      await firestore().collection("users").doc(currentUser.uid).update({ avatarIndex: index });
      setAvatar(avatars[index]);
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.1, duration: 150, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    } catch (error) {
      Alert.alert("Error", "Failed to update avatar.");
    }
  };

  const handleProfileUpdate = async () => {
    const currentUser = auth().currentUser;
    if (!currentUser) return;

    try {
      await firestore().collection("users").doc(currentUser.uid).update({
        firstName,
        lastName,
        username,
      });
      setModalMessage("Profile details updated!");
      setShowSuccessModal(true);
    } catch (error) {
      Alert.alert("Error", "Could not update profile.");
    }
  };

  const handleChangePassword = async () => {
    if (!oldPass || !newPass || !confirmPass) {
        Alert.alert("Error", "Please fill all fields.");
        return;
    }
    if (newPass !== confirmPass) {
        Alert.alert("Error", "New passwords do not match.");
        return;
    }
    if (newPass.length < 6) {
        Alert.alert("Error", "Password must be at least 6 chars.");
        return;
    }

    const user = auth().currentUser;
    if (!user || !user.email) return;

    setPasswordLoading(true);
    try {
        const credential = auth.EmailAuthProvider.credential(user.email, oldPass);
        await user.reauthenticateWithCredential(credential);
        await user.updatePassword(newPass);
        
        setShowPasswordModal(false);
        setOldPass(""); setNewPass(""); setConfirmPass("");
        setModalMessage("Password changed successfully!");
        setShowSuccessModal(true);
    } catch (error: any) {
        console.error(error);
        if (error.code === 'auth/wrong-password') {
            Alert.alert("Error", "Incorrect old password.");
        } else {
            Alert.alert("Error", "Failed to update password. Please try again.");
        }
    } finally {
        setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const user = auth().currentUser;
    if (!user) return;

    try {
        await firestore().collection("users").doc(user.uid).delete();
        await user.delete();
    } catch (error) {
        Alert.alert("Error", "Please re-login and try again for security reasons.");
    }
  };

  return (
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
        <Text style={styles.headerText}>Profile Settings</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 100 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          
          <View style={styles.avatarContainer}>
            {/* ✅ UPDATED: Larger, No Border */}
            <Animated.Image source={avatar} style={[styles.avatar, { transform: [{ scale }] }]} resizeMode="contain" />
            <TouchableOpacity style={styles.changeButton} onPress={() => setShowAvatarModal(true)}>
              <Text style={styles.changeText}>Change Avatar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>First Name</Text>
            <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="First Name" placeholderTextColor={colors.textSecondary} />

            <Text style={styles.label}>Last Name</Text>
            <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Last Name" placeholderTextColor={colors.textSecondary} />

            <Text style={styles.label}>Username</Text>
            <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="@username" placeholderTextColor={colors.textSecondary} />

            <Text style={styles.label}>Email Address</Text>
            <TextInput style={[styles.input, styles.disabledInput]} value={email} editable={false} />

            <Text style={styles.label}>Password</Text>
            <TouchableOpacity style={styles.passwordTrigger} onPress={() => setShowPasswordModal(true)}>
                <Text style={styles.passwordText}>••••••••</Text>
                <Text style={styles.editText}>Change</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.updateButton} onPress={handleProfileUpdate}>
              <Text style={styles.updateText}>Save Changes</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.deleteButton} onPress={() => setShowDeleteModal(true)}>
                <Image source={require("../Assets/delete.png")} style={styles.deleteIcon} />
                <Text style={styles.deleteText}>Delete Account</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      )}

      {/* --- MODALS --- */}

      <Modal visible={showAvatarModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Avatar</Text>
            <FlatList
              data={avatars}
              numColumns={3}
              columnWrapperStyle={styles.avatarGrid}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity onPress={() => handleAvatarChange(index)}>
                  <Image source={item} style={styles.avatarSmall} resizeMode="contain" />
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowAvatarModal(false)}>
              <Text style={styles.closeModalText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showPasswordModal} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Change Password</Text>
                
                <View style={styles.passwordInputContainer}>
                    <TextInput 
                        style={styles.passwordInput} 
                        placeholder="Old Password" 
                        value={oldPass} 
                        onChangeText={setOldPass} 
                        secureTextEntry={!showOld} 
                        placeholderTextColor={colors.textSecondary} 
                    />
                    <TouchableOpacity onPress={() => setShowOld(!showOld)} style={styles.eyeBtn}>
                        <Image source={showOld ? eyeIcon : eyeOffIcon} style={[styles.eyeIcon, {tintColor: colors.textSecondary}]} />
                    </TouchableOpacity>
                </View>

                <View style={styles.passwordInputContainer}>
                    <TextInput 
                        style={styles.passwordInput} 
                        placeholder="New Password" 
                        value={newPass} 
                        onChangeText={setNewPass} 
                        secureTextEntry={!showNew} 
                        placeholderTextColor={colors.textSecondary} 
                    />
                    <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeBtn}>
                        <Image source={showNew ? eyeIcon : eyeOffIcon} style={[styles.eyeIcon, {tintColor: colors.textSecondary}]} />
                    </TouchableOpacity>
                </View>

                <View style={styles.passwordInputContainer}>
                    <TextInput 
                        style={styles.passwordInput} 
                        placeholder="Confirm New Password" 
                        value={confirmPass} 
                        onChangeText={setConfirmPass} 
                        secureTextEntry={!showConfirm} 
                        placeholderTextColor={colors.textSecondary} 
                    />
                    <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                        <Image source={showConfirm ? eyeIcon : eyeOffIcon} style={[styles.eyeIcon, {tintColor: colors.textSecondary}]} />
                    </TouchableOpacity>
                </View>

                <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowPasswordModal(false)}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.confirmBtn} onPress={handleChangePassword} disabled={passwordLoading}>
                        {passwordLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.confirmText}>Update</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
                <View style={styles.warningIconContainer}>
                    <Image source={require("../Assets/delete.png")} style={styles.warningIcon} />
                </View>
                <Text style={styles.modalTitle}>Delete Account?</Text>
                <Text style={styles.modalSubtitle}>
                    Are you sure? This action is irreversible. All your progress and certificates will be lost.
                </Text>
                <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowDeleteModal(false)}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.confirmBtn, {backgroundColor: '#FF4545'}]} onPress={handleDeleteAccount}>
                        <Text style={styles.confirmText}>Yes, Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <LottieView source={require("../Assets/success.json")} autoPlay loop={false} style={{ width: 100, height: 100 }} />
            <Text style={styles.successText}>Success!</Text>
            <Text style={{ color: colors.textSecondary, textAlign: "center" }}>{modalMessage}</Text>
          </View>
        </View>
      </Modal>

    </View>
  );
}

// 3. Style Generator (Reduced Sizes)
export const styleGenerator = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  
  // Header
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  backIcon: { width: 24, height: 24, marginRight: 10, resizeMode: "contain" },
  headerText: { color: colors.textPrimary, fontSize: 20, fontFamily: "Poppins-SemiBold" }, // Reduced from 24

  // Avatar
  avatarContainer: { alignItems: "center", marginBottom: 30 },
  avatar: { 
    width: 110,  // Reduced from 130
    height: 110, 
    borderRadius: 0, 
    marginBottom: 15, 
  },
  changeButton: { 
    backgroundColor: colors.card, 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: colors.border 
  },
  changeText: { color: colors.textPrimary, fontFamily: "Poppins-Medium", fontSize: 13 }, // Reduced

  // Form
  form: { marginBottom: 20 },
  label: { 
    color: colors.textSecondary, 
    marginBottom: 6, 
    fontSize: 13, // Reduced from 15
    fontFamily: "Poppins-Medium", 
    marginLeft: 4 
  },
  
  input: {
    backgroundColor: colors.card,
    color: colors.textPrimary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12, // Reduced height
    borderWidth: 1,
    borderColor: colors.border || "#2D2D55",
    marginBottom: 16,
    fontSize: 14, // Reduced font
    fontFamily: "Poppins-Regular"
  },
  disabledInput: { opacity: 0.6, backgroundColor: colors.background },
  
  // Password Row (Inline)
  passwordTrigger: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.card,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 24
  },
  passwordText: { color: colors.textPrimary, fontSize: 16, letterSpacing: 2 },
  editText: { color: colors.primary, fontFamily: "Poppins-SemiBold", fontSize: 13 },

  // Buttons
  updateButton: { 
    backgroundColor: colors.primary, 
    paddingVertical: 14, // Reduced padding
    borderRadius: 12, 
    alignItems: "center", 
    shadowColor: colors.primary, 
    shadowOpacity: 0.3, 
    shadowRadius: 5, 
    elevation: 3 
  },
  updateText: { color: "#fff", fontFamily: "Poppins-SemiBold", fontSize: 15 }, // Reduced from 17

  divider: { height: 1, backgroundColor: colors.border, marginVertical: 30 },

  deleteButton: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 12, 
    backgroundColor: '#FF454515', 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#FF454550' 
  },
  deleteIcon: { width: 18, height: 18, tintColor: '#FF4545', marginRight: 8 },
  deleteText: { color: '#FF4545', fontFamily: "Poppins-SemiBold", fontSize: 14 },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: colors.overlay || 'rgba(0,0,0,0.7)', justifyContent: "center", alignItems: "center" },
  modalContent: { width: "85%", backgroundColor: colors.card, borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontFamily: "Poppins-Bold", color: colors.textPrimary, marginBottom: 16, textAlign: "center" },
  modalSubtitle: { color: colors.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 20, fontSize: 13 },
  
  avatarGrid: { justifyContent: 'space-around', marginBottom: 15 },
  avatarSmall: { width: 65, height: 65, marginVertical: 10 },
  
  // Password Row in Modal
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    paddingRight: 10,
  },
  passwordInput: { 
    flex: 1, 
    color: colors.textPrimary, 
    padding: 12, 
    fontSize: 14,
    fontFamily: "Poppins-Regular"
  },
  eyeBtn: { padding: 8 },
  eyeIcon: { width: 20, height: 20, resizeMode: 'contain', opacity: 0.6 },
  
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 15 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: colors.buttonMuted, alignItems: 'center' },
  confirmBtn: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center' },
  cancelText: { color: colors.textPrimary, fontFamily: "Poppins-SemiBold", fontSize: 14 },
  confirmText: { color: '#FFF', fontFamily: "Poppins-SemiBold", fontSize: 14 },
  closeModalBtn: { alignSelf: 'center', marginTop: 15, padding: 10 },
  closeModalText: { color: colors.textSecondary, fontFamily: "Poppins-Medium", fontSize: 14 },

  warningIconContainer: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FF454520', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 15 },
  warningIcon: { width: 30, height: 30, tintColor: '#FF4545' },

  successModal: { width: 250, backgroundColor: colors.card, borderRadius: 20, alignItems: "center", padding: 20 },
  successText: { color: colors.textPrimary, fontFamily: "Poppins-SemiBold", fontSize: 16, marginTop: 10 },

  backAnimOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.background, justifyContent: "center", alignItems: "center", zIndex: 100 },
  backAnim: { width: 200, height: 200 },
});