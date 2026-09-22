import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  Animated,
} from "react-native";
import LottieView from "lottie-react-native";
import { useBackWithAnim } from "../hooks/useBackWithAnim";
import { useThemeStyles } from "../hooks/useThemeStyles";

const teamMembers = [
  {
    id: "1",
    name: "Mushaf Khalil",
    role: "Software Engineer / App Developer",
    image: require("../Assets/mushaf.jpg"),
    linkedin: "https://www.linkedin.com/in/mushaf-khalill/",
    github: "https://github.com/Mushaf-Khalil",
  },
  {
    id: "2",
    name: "Taskeen Abbas",
    role: "UI/UX Designer / Frontend Developer",
    image: require("../Assets/taskeen.jpg"),
    linkedin: "https://www.linkedin.com/in/taskeen-abbas/",
    github: "https://github.com/Taskeen-Abbas",
  },
];

const AboutUs = () => {
  const { styles, colors } = useThemeStyles(styleGenerator);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showBackAnim, setShowBackAnim] = React.useState(false);
  const animationRef = useRef<LottieView>(null);

  // ✅ UPDATED: Faster timeout to match increased speed
  const playBackAnim = () =>
    new Promise<void>((resolve) => {
      setShowBackAnim(true);
      animationRef.current?.play();
      setTimeout(() => {
        resolve(); 
      }, 600); // Reduced from 1500ms to 600ms
    });

  const { handleBackPress } = useBackWithAnim(playBackAnim, "Settings");

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

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
            speed={1.75} // ✅ ADDED: Plays 2.5x faster
            style={styles.backAnim}
          />
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Image
            source={require("../Assets/back.png")}
            style={[styles.backIcon, { tintColor: colors.textPrimary }]} 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.heroSection}>
            <LottieView
              source={require("../Assets/aboutus.json")}
              autoPlay
              loop
              style={styles.heroAnim}
            />
            <Text style={styles.appTitle}>CodeXpert</Text>
            <Text style={styles.tagline}>
              Empowering developers through learning and innovation.
            </Text>
          </View>

          {/* Mission */}
          <View style={styles.missionBox}>
            <Text style={styles.missionHeading}>Our Mission</Text>
            <Text style={styles.missionText}>
              At CodeXpert, our mission is to make coding education accessible,
              fun, and interactive for everyone. We strive to build an
              AI-powered learning experience that helps you master coding skills
              efficiently through personalized lessons, interactive quizzes, and
              real-time feedback.
            </Text>
          </View>

          {/* Team Section */}
          <Text style={styles.teamHeading}>Meet the Inventors</Text>
          {teamMembers.map((member) => (
            <View key={member.id} style={styles.profileCard}>
              <Image source={member.image} style={styles.profileImage} />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{member.name}</Text>
                <Text style={styles.profileRole}>{member.role}</Text>

                <View style={styles.socialRow}>
                  <TouchableOpacity onPress={() => Linking.openURL(member.linkedin)}>
                    <Image
                      source={require("../Assets/linkedin.png")}
                      style={styles.socialIcon} 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => Linking.openURL(member.github)}>
                    <Image
                      source={require("../Assets/github.png")}
                      style={styles.socialIcon} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2025 CodeXP — Built with ❤️ by our team
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default AboutUs;

// Style Generator
const styleGenerator = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border || "#222",
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
    heroSection: {
      alignItems: "center",
      marginTop: 10,
      paddingHorizontal: 16,
    },
    heroAnim: {
      width: 200,
      height: 200,
    },
    appTitle: {
      color: colors.textPrimary,
      fontSize: 24,
      fontFamily: "Poppins-Bold",
      marginTop: 10,
    },
    tagline: {
      color: colors.textSecondary,
      fontSize: 13,
      fontFamily: "Poppins-Regular",
      textAlign: "center",
      marginTop: 4,
      marginBottom: 20,
    },
    missionBox: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 16,
      borderWidth: 1,
      borderColor: colors.border || 'transparent',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    missionHeading: {
      color: colors.textPrimary,
      fontSize: 16,
      fontFamily: "Poppins-SemiBold",
      marginBottom: 8,
      textAlign: "center",
    },
    missionText: {
      color: colors.textSecondary,
      fontSize: 13,
      fontFamily: "Poppins-Regular",
      lineHeight: 20,
      textAlign: "center",
    },
    teamHeading: {
      color: colors.textPrimary,
      fontSize: 18,
      fontFamily: "Poppins-SemiBold",
      marginTop: 24,
      marginBottom: 10,
      textAlign: "center",
    },
    profileCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 12,
      marginHorizontal: 16,
      padding: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border || 'transparent',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    profileImage: {
      width: 70,
      height: 70,
      borderRadius: 35,
      marginRight: 14,
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      color: colors.textPrimary,
      fontSize: 15,
      fontFamily: "Poppins-SemiBold",
    },
    profileRole: {
      color: colors.textSecondary,
      fontSize: 12,
      fontFamily: "Poppins-Regular",
      marginBottom: 8,
    },
    socialRow: {
      flexDirection: "row",
    },
    socialIcon: {
      width: 22,
      height: 22,
      marginRight: 10,
      resizeMode: "contain",
    },
    footer: {
      alignItems: "center",
      marginVertical: 20,
    },
    footerText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontFamily: "Poppins-Regular",
    },
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
  });