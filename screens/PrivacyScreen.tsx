import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  Linking,
  Alert,
} from "react-native";
import LottieView from "lottie-react-native";
import { useBackWithAnim } from "../hooks/useBackWithAnim";
import { useThemeStyles } from "../hooks/useThemeStyles";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const POLICY_DATA = [
  {
    id: "1",
    title: "Data Protection",
    icon: require("../Assets/security.png"),
    content: "We take your data seriously. All personal information is encrypted using AES-256 standards. We do not sell your data to third parties.",
  },
  {
    id: "2",
    title: "Account Security",
    icon: require("../Assets/lock.png"), 
    content: "Your account is protected by multi-layer authentication. We recommend using a strong, unique password and changing it every 3 months.",
  },
  {
    id: "3",
    title: "Course Progress",
    icon: require("../Assets/code.png"),
    content: "Your learning progress is stored securely in the cloud. You can sync your progress across devices by logging in with the same account.",
  },
  {
    id: "4",
    title: "Third-Party Services",
    icon: require("../Assets/cloud.png"), 
    content: "We use Firebase for authentication and database services. Google Analytics is used anonymously to improve app performance.",
  },
];

export default function PrivacyScreen() {
  const { styles, colors } = useThemeStyles(styleGenerator);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showBackAnim, setShowBackAnim] = useState(false);

  const playBackAnim = () =>
    new Promise<void>((resolve) => {
      setShowBackAnim(true);
      setTimeout(() => resolve(), 600);
    });

  const { handleBackPress } = useBackWithAnim(playBackAnim, "Settings");

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  // ✅ UPDATED EMAIL HANDLER
  const handleEmailPress = async () => {
    // Adding a subject line makes it look more professional
    const url = "mailto:mushafchughtai09@gmail.com?subject=CodeXpert Support Request";
    
    try {
        // We try to open it directly. canOpenURL often returns false on Android 11+ 
        // due to package visibility rules, so try/catch on openURL is more reliable for mailto.
        await Linking.openURL(url);
    } catch (error) {
        console.error("Email Error:", error);
        Alert.alert(
            "No Email App", 
            "Could not open an email application. Please copy the address manually."
        );
    }
  };

  return (
    <View style={styles.container}>
      {showBackAnim && (
        <View style={styles.backAnimOverlay}>
          <LottieView source={require("../Assets/backAnimation.json")} autoPlay loop={false} style={styles.backAnim} />
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Image source={require("../Assets/back.png")} style={[styles.backIcon, { tintColor: colors.icon }]} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Privacy & Security</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Hero Animation */}
        <View style={styles.heroContainer}>
            <LottieView source={require("../Assets/security_anim.json")} autoPlay loop style={styles.heroAnim} /> 
            <Text style={styles.heroText}>Your privacy is our priority.</Text>
            <Text style={styles.lastUpdated}>Last Updated: Jan 2026</Text>
        </View>

        {POLICY_DATA.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
                <TouchableOpacity 
                    key={item.id} 
                    style={[styles.card, isExpanded && styles.cardExpanded]} 
                    activeOpacity={0.9}
                    onPress={() => toggleExpand(item.id)}
                >
                    <View style={styles.cardHeader}>
                        <View style={styles.row}>
                            <View style={styles.iconContainer}>
                                <Image source={item.icon} style={[styles.icon, { tintColor: colors.primary }]} resizeMode="contain" />
                            </View>
                            <Text style={styles.cardTitle}>{item.title}</Text>
                        </View>
                        <Image 
                            source={require("../Assets/down.png")} 
                            style={[styles.arrow, isExpanded && { transform: [{ rotate: '180deg' }] }, { tintColor: colors.textSecondary }]} 
                        />
                    </View>
                    {isExpanded && (
                        <Text style={styles.cardContent}>{item.content}</Text>
                    )}
                </TouchableOpacity>
            );
        })}

        {/* ✅ UPDATED FOOTER WITH COPYABLE EMAIL */}
        <View style={styles.footer}>
            <Text style={styles.footerText}>Questions about our policy?</Text>
            
            <TouchableOpacity 
                style={styles.emailContainer} 
                onPress={handleEmailPress}
                activeOpacity={0.7}
            >
                <View style={styles.emailIconBox}>
                    <Image source={require("../Assets/email.png")} style={styles.emailIcon} />
                </View>
                <View>
                    <Text style={styles.contactLabel}>Contact Support</Text>
                    <Text 
                        style={styles.emailText} 
                        selectable={true} 
                        selectionColor={colors.primary}
                    >
                        mushafchughtai09@gmail.com
                    </Text>
                </View>
            </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styleGenerator = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  backIcon: { width: 24, height: 24, marginRight: 15, resizeMode: "contain" },
  headerText: { color: colors.textPrimary, fontSize: 22, fontFamily: "Poppins-SemiBold" },

  scroll: { paddingBottom: 40 },

  heroContainer: { alignItems: 'center', marginBottom: 30 },
  heroAnim: { width: 180, height: 180 },
  heroText: { color: colors.textPrimary, fontSize: 18, fontFamily: "Poppins-SemiBold", marginTop: 10 },
  lastUpdated: { color: colors.textSecondary, fontSize: 12, fontFamily: "Poppins-Regular", marginTop: 5 },

  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border || "#2D2D55",
    overflow: 'hidden'
  },
  cardExpanded: {
      borderColor: colors.primary,
      backgroundColor: colors.card 
  },
  cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12
  },
  icon: { width: 20, height: 20 },
  cardTitle: { color: colors.textPrimary, fontSize: 16, fontFamily: "Poppins-Medium" },
  arrow: { width: 16, height: 16 },
  
  cardContent: {
      marginTop: 15,
      color: colors.textSecondary,
      fontSize: 14,
      fontFamily: "Poppins-Regular",
      lineHeight: 22,
      paddingLeft: 52 
  },

  // ✅ NEW FOOTER STYLES
  footer: { 
      marginTop: 30, 
      alignItems: 'center',
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border || '#2D2D55'
  },
  footerText: { 
      color: colors.textSecondary, 
      fontSize: 14, 
      fontFamily: "Poppins-Regular",
      marginBottom: 15
  },
  emailContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border || '#333'
  },
  emailIconBox: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12
  },
  emailIcon: {
      width: 20,
      height: 20,
      tintColor: colors.primary
  },
  contactLabel: {
      color: colors.textSecondary,
      fontSize: 12,
      fontFamily: "Poppins-Regular"
  },
  emailText: {
      color: colors.textPrimary,
      fontSize: 15,
      fontFamily: "Poppins-SemiBold",
      textDecorationLine: 'underline'
  },

  backAnimOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: colors.background, justifyContent: "center", alignItems: "center", zIndex: 100,
  },
  backAnim: { width: 200, height: 200 },
});