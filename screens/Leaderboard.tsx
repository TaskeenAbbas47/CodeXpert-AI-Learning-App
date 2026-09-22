 
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   Image,
//   SafeAreaView,
//   TouchableOpacity,
//   BackHandler,
// } from "react-native";
// import LottieView from "lottie-react-native";

// // 1. Import The Hook
// import { useThemeStyles } from "../hooks/useThemeStyles";

// const data = [
//   {
//     id: "1",
//     title: "Write Your First Program",
//     description: "Print a simple message like HELLO WORLD!",
//     points: 4,
//     icon: require("../Assets/code.png"),
//   },
//   {
//     id: "2",
//     title: "Master Variables & Data Types",
//     description: "Create and use variables: strings, numbers, booleans",
//     points: 4,
//     icon: require("../Assets/variables.png"),
//   },
//   {
//     id: "3",
//     title: "Build Simple Calculations",
//     description: "Program asks for two numbers and shows their sum",
//     points: 4,
//     icon: require("../Assets/calc.png"),
//   },
//   {
//     id: "4",
//     title: "Use Conditions & Loops",
//     description: "Create an 'even or odd checker' game",
//     points: 4,
//     icon: require("../Assets/loop.png"),
//   },
//   {
//     id: "5",
//     title: "Create Your First Mini Project",
//     description: "A calculator, to-do list, or password generator",
//     points: 4,
//     icon: require("../Assets/project.png"),
//   },
// ];

// type Achievement = {
//   id: string;
//   title: string;
//   description: string;
//   points: number;
//   icon: any;
// };

// const Leaderboard = ({ navigation }: any) => {
//   // 2. Initialize Hook
//   const { styles, colors } = useThemeStyles(styleGenerator);

//   const [showBackAnim, setShowBackAnim] = useState(false);

//   const triggerBackAnimation = React.useCallback(() => {
//     setShowBackAnim(true);
//     setTimeout(() => {
//       navigation.goBack();
//     }, 1500); 
//   }, [navigation]);

//   useEffect(() => {
//     const backAction = () => {
//       if (!showBackAnim) {
//         triggerBackAnimation();
//       }
//       return true; 
//     };

//     const backHandler = BackHandler.addEventListener(
//       "hardwareBackPress",
//       backAction
//     );

//     return () => backHandler.remove();
//   }, [showBackAnim, triggerBackAnimation]);

//   useEffect(() => {
//     const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
//       if (showBackAnim) return; 

//       e.preventDefault(); 
//       triggerBackAnimation();
//     });

//     return unsubscribe;
//   }, [navigation, showBackAnim, triggerBackAnimation]);

//   const renderItem = ({ item }: { item: Achievement }) => (
//     <View style={styles.card}>
//       {/* Dynamic Tint Color for Icons */}
//       <Image source={item.icon} style={[styles.icon, { tintColor: colors.icon }]} />
//       <View style={styles.textContainer}>
//         <Text style={styles.cardTitle}>{item.title}</Text>
//         <Text style={styles.cardDescription}>{item.description}</Text>
//       </View>
//       <Text style={styles.points}>{item.points} Points</Text>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Back animation overlay matches background color */}
//       {showBackAnim && (
//         <View style={styles.backAnimOverlay}>
//           <LottieView
//             source={require("../Assets/backAnimation.json")}
//             autoPlay
//             loop={false}
//             style={styles.backAnim}
//           />
//         </View>
//       )}

//       {/* Header with back button */}
//       <View style={styles.headerRow}>
//         <TouchableOpacity onPress={triggerBackAnimation}>
//           <Image
//             source={require("../Assets/back.png")}
//             style={[styles.backIcon, { tintColor: colors.icon }]}
//           />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Achievements</Text>
//       </View>

//       {/* Top Achievements Section */}
//       <View style={styles.header}>
//         <Text style={styles.totalPoints}>20</Text>
//         <Text style={styles.subText}>Total Points</Text>

//         <View style={styles.progressContainer}>
//           <View style={styles.progressBarBackground}>
//             <View style={styles.progressBarFill} />
//           </View>
//           <View style={styles.iconOverlay}>
//             <Image
//               source={require("../Assets/bronze.png")}
//               style={styles.rankIcon}
//             />
//             <Image
//               source={require("../Assets/silver.png")}
//               style={styles.rankIcon}
//             />
//             <Image
//               source={require("../Assets/gold.png")}
//               style={styles.rankIcon}
//             />
//             <Image
//               source={require("../Assets/diamond.png")}
//               style={styles.rankIcon}
//             />
//           </View>
//         </View>
//       </View>

//       {/* Achievements list */}
//       <FlatList
//         data={data}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.id}
//         contentContainerStyle={styles.list}
//       />
//     </SafeAreaView>
//   );
// };

// export default Leaderboard;

// // 3. Style Generator
// export const styleGenerator = (colors: any) => StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background, // Dynamic Background
//   },
//   headerRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 16,
//   },
//   backIcon: {
//     width: 26,
//     height: 26,
//     marginRight: 12,
//     resizeMode: "contain",
//     // tintColor applied inline
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: colors.textPrimary, // Dynamic Text
//   },
//   header: {
//     backgroundColor: colors.card, // Dynamic Card Color
//     paddingVertical: 20,
//     paddingHorizontal: 16,
//     alignItems: "center",
//     borderRadius: 10,
//     marginHorizontal: 16, // Added margin to center it like a card
//   },
//   totalPoints: {
//     fontSize: 28,
//     fontWeight: "bold",
//     color: colors.textPrimary,
//   },
//   subText: {
//     fontSize: 14,
//     color: colors.textSecondary,
//     marginBottom: 10,
//   },
//   progressContainer: {
//     width: "90%",
//     alignItems: "center",
//     marginTop: 15,
//   },
//   progressBarBackground: {
//     width: "100%",
//     height: 10,
//     backgroundColor: colors.buttonMuted, // Uses the muted/border color
//     borderRadius: 10,
//   },
//   progressBarFill: {
//     width: "50%",
//     height: 10,
//     backgroundColor: colors.primary, // Uses Theme Blue
//     borderRadius: 10,
//   },
//   iconOverlay: {
//     position: "absolute",
//     top: -11,
//     left: 0,
//     right: 0,
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   rankIcon: {
//     width: 33,
//     height: 33,
//     resizeMode: "contain",
//   },
//   list: {
//     padding: 16,
//   },
//   card: {
//     backgroundColor: colors.card, // Dynamic Card
//     borderRadius: 16,
//     padding: 10,
//     marginBottom: 10,
//     // Light Mode Shadow
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 5,
//     elevation: 3,
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   icon: {
//     width: 32,
//     height: 32,
//     marginRight: 12,
//     resizeMode: "contain",
//     // tintColor applied inline
//   },
//   textContainer: {
//     flex: 1,
//   },
//   cardTitle: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: colors.textPrimary,
//     marginBottom: 4,
//   },
//   cardDescription: {
//     fontSize: 13,
//     color: colors.textSecondary,
//   },
//   points: {
//     fontSize: 13,
//     fontWeight: "600",
//     color: colors.textPrimary, // Or colors.primary if you want them to pop
//   },

//   // Back animation overlay
//   backAnimOverlay: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: colors.background, // Matches screen background
//     justifyContent: "center",
//     alignItems: "center",
//     zIndex: 100,
//   },
//   backAnim: {
//     width: 200,
//     height: 200,
//   },
// });





/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { useThemeStyles } from "../hooks/useThemeStyles";

// --- TYPES ---
type CourseAchievement = {
  id: string;
  courseName: string;
  points: number;
  badgeLevel: "None" | "Bronze" | "Silver" | "Gold";
  badgeName: string;
  nextMilestone: number | null;
};

type UserStats = {
  totalPoints: number;
  courses: CourseAchievement[];
};

// --- BADGE LOGIC HELPER ---
const calculateBadge = (courseId: string, points: number): Pick<CourseAchievement, "badgeLevel" | "badgeName" | "nextMilestone"> => {
  const name = courseId.charAt(0).toUpperCase() + courseId.slice(1);
  
  if (points >= 100) {
    return { badgeLevel: "Gold", badgeName: `${name} Master`, nextMilestone: null };
  } else if (points >= 40) {
    return { badgeLevel: "Silver", badgeName: `${name} Developer`, nextMilestone: 100 };
  } else if (points >= 12) {
    return { badgeLevel: "Bronze", badgeName: `${name} Novice`, nextMilestone: 40 };
  } else {
    return { badgeLevel: "None", badgeName: `${name} Beginner`, nextMilestone: 12 };
  }
};

// --- ICONS ---
const BADGE_ICONS = {
  Gold: require("../Assets/gold.png"),
  Silver: require("../Assets/silver.png"),
  Bronze: require("../Assets/bronze.png"),
  None: require("../Assets/bronze.png"), // Uses bronze but styled to look locked/grey
};

export default function AchievementsScreen({ navigation }: any) {
  const { styles, colors } = useThemeStyles(styleGenerator);
  const [stats, setStats] = useState<UserStats>({ totalPoints: 0, courses: [] });
  const [loading, setLoading] = useState(true);

  const user = auth().currentUser;

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const userRef = firestore().collection("users").doc(user.uid);
    const coursesRef = userRef.collection("courses");

    const unsubscribeUser = userRef.onSnapshot((doc) => {
      const total = doc.exists() ? (doc.data()?.totalPoints || 0) : 0;
      setStats((prev) => ({ ...prev, totalPoints: total }));
    });

    const unsubscribeCourses = coursesRef.onSnapshot((snapshot) => {
      const loadedCourses: CourseAchievement[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        const coursePoints = data.coursePoints || 0;
        const badgeInfo = calculateBadge(doc.id, coursePoints);

        return {
          id: doc.id,
          courseName: doc.id.charAt(0).toUpperCase() + doc.id.slice(1),
          points: coursePoints,
          ...badgeInfo,
        };
      });

      loadedCourses.sort((a, b) => b.points - a.points);
      
      setStats((prev) => ({ ...prev, courses: loadedCourses }));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching achievements:", error);
      setLoading(false);
    });

    return () => {
      unsubscribeUser();
      unsubscribeCourses();
    };
  }, [user]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerAll]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Image source={require("../Assets/back.png")} style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trophy Room</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* COMPACT HERO BANNER: TOTAL XP */}
        <View style={styles.heroBanner}>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroLabel}>GLOBAL EXPERIENCE</Text>
            <View style={styles.heroRow}>
              <Text style={styles.heroPoints}>{stats.totalPoints}</Text>
              <Text style={styles.heroPointsLabel}> XP</Text>
            </View>
          </View>
          <View style={styles.heroImageContainer}>
            <Image source={require("../Assets/project.png")} style={styles.heroImage} />
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Language Badges</Text>
          <Text style={styles.sectionCount}>{stats.courses.length} Unlocked</Text>
        </View>

        {/* EMPTY STATE */}
        {stats.courses.length === 0 ? (
          <View style={styles.emptyState}>
            <Image source={require("../Assets/code.png")} style={styles.emptyIcon} />
            <Text style={styles.emptyText}>Your trophy case is empty.</Text>
            <Text style={styles.emptySubText}>Complete your first lesson to earn points and unlock badges.</Text>
          </View>
        ) : (
          /* COURSE CARDS */
          stats.courses.map((course) => {
            const progressPercentage = course.nextMilestone 
              ? Math.min((course.points / course.nextMilestone) * 100, 100) 
              : 100;
            const isLocked = course.badgeLevel === 'None';

            return (
              <View key={course.id} style={styles.badgeCard}>
                
                {/* ICON & MAIN INFO */}
                <View style={styles.cardTopRow}>
                  <View style={[styles.badgeIconWrapper, isLocked && styles.lockedIconWrapper]}>
                    <Image 
                      source={BADGE_ICONS[course.badgeLevel]} 
                      style={[styles.badgeIcon, isLocked && styles.lockedBadgeIcon]} 
                    />
                  </View>
                  
                  <View style={styles.badgeInfo}>
                    <Text style={styles.courseName}>{course.courseName}</Text>
                    <Text style={[styles.badgeName, isLocked && { color: colors.textSecondary }]}>
                      {course.badgeName}
                    </Text>
                  </View>

                  {/* XP PILL */}
                  <View style={[styles.xpPill, isLocked && styles.xpPillLocked]}>
                    <Text style={[styles.xpPillText, isLocked && styles.xpPillTextLocked]}>
                      {course.points} XP
                    </Text>
                  </View>
                </View>

                {/* DETAILED PROGRESS TRACK */}
                {course.nextMilestone ? (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressTextRow}>
                      <Text style={styles.progressHint}>Next Rank</Text>
                      <Text style={styles.progressFraction}>{course.points} / {course.nextMilestone} XP</Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
                    </View>
                  </View>
                ) : (
                  <View style={styles.maxRankContainer}>
                    <Text style={styles.maxRankText}>🏆 Max Rank Achieved</Text>
                  </View>
                )}

              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------
// STYLES
// ---------------------------------------------------------
const styleGenerator = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerAll: { justifyContent: 'center', alignItems: 'center' },
  
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'android' ? 20 : 10, 
    paddingBottom: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.border 
  },
  backBtn: { padding: 5 },
  icon: { width: 24, height: 24, tintColor: colors.icon },
  headerTitle: { fontSize: 18, fontFamily: 'Poppins-Bold', color: colors.textPrimary },
  
  scrollContent: { padding: 20, paddingBottom: 40 },
  
  // SLEEK HERO BANNER
  heroBanner: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    marginTop: 5,
    borderWidth: 1,
    borderColor: colors.primary + '40', // Subtle primary tint on border
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  heroTextContainer: { flex: 1 },
  heroLabel: { color: colors.textSecondary, fontSize: 12, fontFamily: 'Poppins-SemiBold', letterSpacing: 1.5 },
  heroRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  heroPoints: { color: colors.primary, fontSize: 32, fontFamily: 'Poppins-Bold' },
  heroPointsLabel: { color: colors.textPrimary, fontSize: 16, fontFamily: 'Poppins-SemiBold', marginLeft: 4 },
  heroImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImage: { width: 30, height: 30, tintColor: colors.primary, resizeMode: 'contain' },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontFamily: 'Poppins-Bold', color: colors.textPrimary },
  sectionCount: { fontSize: 13, fontFamily: 'Poppins-Medium', color: colors.textSecondary, marginBottom: 2 },

  // CRISP BADGE CARDS
  badgeCard: { 
    backgroundColor: colors.background, // Matches background to feel flat/sleek
    borderRadius: 16, 
    padding: 18, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: colors.border,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center' },
  
  badgeIconWrapper: { 
    width: 52, 
    height: 52, 
    borderRadius: 26, 
    backgroundColor: colors.card, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lockedIconWrapper: { backgroundColor: colors.background, elevation: 0, shadowOpacity: 0 },
  
  badgeIcon: { width: 30, height: 30, resizeMode: 'contain' },
  lockedBadgeIcon: { tintColor: colors.textSecondary, opacity: 0.25 },
  
  badgeInfo: { flex: 1, justifyContent: 'center' },
  courseName: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  badgeName: { fontSize: 16, fontFamily: 'Poppins-Bold', color: colors.textPrimary, marginTop: -2 },

  // XP PILL
  xpPill: { 
    backgroundColor: colors.primary + '15', 
    paddingVertical: 6, 
    paddingHorizontal: 12, 
    borderRadius: 12, 
  },
  xpPillLocked: { backgroundColor: colors.buttonMuted },
  xpPillText: { fontSize: 13, fontFamily: 'Poppins-Bold', color: colors.primary },
  xpPillTextLocked: { color: colors.textSecondary },
  
  // DETAILED PROGRESS TRACK
  progressContainer: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border },
  progressTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressHint: { fontSize: 12, fontFamily: 'Poppins-Medium', color: colors.textSecondary },
  progressFraction: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: colors.textPrimary },
  progressTrack: { height: 6, backgroundColor: colors.card, borderRadius: 3, width: '100%', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  
  maxRankContainer: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border, alignItems: 'center' },
  maxRankText: { fontSize: 13, fontFamily: 'Poppins-Bold', color: '#FFD700', letterSpacing: 0.5 },

  // EMPTY STATE
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50, backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed' },
  emptyIcon: { width: 48, height: 48, tintColor: colors.textSecondary, opacity: 0.3, marginBottom: 12 },
  emptyText: { fontSize: 16, fontFamily: 'Poppins-SemiBold', color: colors.textPrimary, textAlign: 'center' },
  emptySubText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: colors.textSecondary, textAlign: 'center', marginTop: 4, paddingHorizontal: 20 },
});