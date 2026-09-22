/* eslint-disable react-native/no-inline-styles */
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  LayoutAnimation,
  Linking,
  Platform,
  UIManager,
} from "react-native";
import LottieView from "lottie-react-native";
import { useNavigation } from "@react-navigation/native";
import { useBackWithAnim } from "../hooks/useBackWithAnim";
import { useThemeStyles } from "../hooks/useThemeStyles";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQ_DATA = [
  {
    q: "How do I reset my password?",
    a: "Go to Profile Settings > Password and click 'Change'. If you are logged out, use the 'Forgot Password' link on the login screen.",
  },
  {
    q: "Are the courses free?",
    a: "Yes! CodeXpert provides free access to all basic programming courses including Python, HTML, CSS, and JS.",
  },
  {
    q: "How do I earn a certificate?",
    a: "Complete 100% of the lessons in a course. Once finished, your certificate will appear in the 'Certificates' section automatically.",
  },
  {
    q: "Can I use CodeXpert offline?",
    a: "Currently, CodeXpert requires an internet connection to sync your progress and load lesson content.",
  },
];

export default function SupportScreen() {
  const { styles, colors } = useThemeStyles(styleGenerator);
  const navigation = useNavigation<any>();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [showBackAnim, setShowBackAnim] = useState(false);

  const playBackAnim = () =>
    new Promise<void>((resolve) => {
      setShowBackAnim(true);
      setTimeout(() => resolve(), 600);
    });

  const { handleBackPress } = useBackWithAnim(playBackAnim, "Settings");

  const toggleExpand = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleEmailSupport = () => {
      Linking.openURL('mailto:support@codexpert.com?subject=CodeXpert Support Request');
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
        <Text style={styles.headerText}>Help Center</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Support Hero (Lottie) */}
        <View style={styles.supportHero}>
            <LottieView 
                source={require("../Assets/support.json")} 
                autoPlay 
                loop 
                style={styles.heroAnim} 
            />
            <Text style={styles.heroTitle}>How can we help?</Text>
        </View>

        {/* Contact Actions */}
        <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionCard} onPress={handleEmailSupport}>
                <View style={[styles.actionIconContainer, {backgroundColor: '#4CAF5020'}]}>
                    <Image source={require("../Assets/email.png")} style={styles.actionIcon} />
                </View>
                <Text style={styles.actionTitle}>Email Us</Text>
            </TouchableOpacity>

            {/* ✅ FIXED: Passing the 'fromScreen' parameter here */}
            <TouchableOpacity 
                style={styles.actionCard} 
                onPress={() => navigation.navigate('FeedbackScreen', { fromScreen: 'SupportScreen' })}
            >
                <View style={[styles.actionIconContainer, {backgroundColor: '#2196F320'}]}>
                    <Image source={require("../Assets/chat.png")} style={[styles.actionIcon, {tintColor: '#2196F3'}]} />
                </View>
                <Text style={styles.actionTitle}>Send Feedback</Text>
            </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        
        {FAQ_DATA.map((item, index) => {
            const isExpanded = expandedIndex === index;
            return (
                <TouchableOpacity 
                    key={index} 
                    style={styles.faqItem} 
                    activeOpacity={0.8}
                    onPress={() => toggleExpand(index)}
                >
                    <View style={styles.faqHeader}>
                        <Text style={[styles.faqQuestion, isExpanded && {color: colors.primary}]}>{item.q}</Text>
                        <Image 
                            source={require("../Assets/down.png")} 
                            style={[styles.arrow, isExpanded && { transform: [{ rotate: '180deg' }] }, { tintColor: colors.textSecondary }]} 
                        />
                    </View>
                    {isExpanded && (
                        <Text style={styles.faqAnswer}>{item.a}</Text>
                    )}
                </TouchableOpacity>
            );
        })}

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

  supportHero: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  heroAnim: { width: 200, height: 200, marginBottom: 10 },
  heroTitle: { color: colors.textPrimary, fontSize: 24, fontFamily: "Poppins-Bold" },

  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 35 },
  actionCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      marginHorizontal: 5,
      borderWidth: 1,
      borderColor: colors.border || "#2D2D55",
      shadowColor: "#000",
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2
  },
  actionIconContainer: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  actionIcon: { width: 24, height: 24, resizeMode: 'contain' },
  actionTitle: { color: colors.textPrimary, fontSize: 14, fontFamily: "Poppins-SemiBold" },

  sectionTitle: { color: colors.textPrimary, fontSize: 18, fontFamily: "Poppins-Bold", marginBottom: 15 },

  faqItem: {
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: 10,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border || "#2D2D55"
  },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { color: colors.textPrimary, fontSize: 15, fontFamily: "Poppins-Medium", flex: 1, marginRight: 10 },
  arrow: { width: 14, height: 14 },
  faqAnswer: { color: colors.textSecondary, fontSize: 14, fontFamily: "Poppins-Regular", marginTop: 12, lineHeight: 22 },

  backAnimOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: colors.background, justifyContent: "center", alignItems: "center", zIndex: 100,
  },
  backAnim: { width: 200, height: 200 },
});