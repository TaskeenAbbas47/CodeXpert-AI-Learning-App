// /* eslint-disable react-native/no-inline-styles */
// import React, { useCallback, useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   BackHandler,
//   Modal,
//   Pressable,
//   ActivityIndicator,
//   RefreshControl,
// } from "react-native";
// import { useNavigation, useFocusEffect } from "@react-navigation/native";
// import auth from "@react-native-firebase/auth";
// import firestore from "@react-native-firebase/firestore";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { NativeStackScreenProps } from "@react-navigation/native-stack";
// import { RootStackParamList } from "../navigator/AppNavigator";

// // Components
// import LanguageCard from "../components/LanguageCard";
// import ExitModal from "../components/ExitModal";

// // Hook
// import { useThemeStyles } from "../hooks/useThemeStyles";

// type HomeScreenNavigationProp = NativeStackScreenProps<
//   RootStackParamList,
//   "HomeScreen"
// >["navigation"];

// type BottomNavScreen =
//   | "HomeScreen"
//   | "Liked"
//   | "Ai"
//   | "Leaderboard"
//   | "Settings";

// // Updated Course Info to include specific colors
// type CourseInfo = {
//   id: string;
//   title: string;
//   icon: any;
//   description: string;
//   screen: string;
//   color: string; // Brand color for progress bar
// };

// export default function HomeScreen() {
//   const navigation = useNavigation<HomeScreenNavigationProp>();
//   const [activeTab, setActiveTab] = useState("Home");
//   const [userName, setUserName] = useState("User");
//   const [exitModalVisible, setExitModalVisible] = useState(false);
  
//   // Stores progress data: { python: { enrolled: true, overallProgress: 45 }, ... }
//   const [coursesData, setCoursesData] = useState<Record<string, any>>({});
  
//   const [loading, setLoading] = useState(true);
//   const [selectedCourse, setSelectedCourse] = useState<CourseInfo | null>(null);
//   const [showEnrollModal, setShowEnrollModal] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

//   const { styles, colors } = useThemeStyles(styleGenerator);

//   // ✅ UPDATED CONFIG: IDs match the Firestore docs used in Course Screens
//   const allCourses: CourseInfo[] = [
//     {
//       id: "python",
//       title: "Python The Master",
//       icon: require("../Assets/python.png"),
//       description: "Build your ideas into reality with Python.",
//       screen: "PythonCourse",
//       color: "#FFD43B", // Python Yellow
//     },
//     {
//       id: "html",
//       title: "HTML The Architect",
//       icon: require("../Assets/html.png"),
//       description: "Structure the web with semantic tags.",
//       screen: "HtmlCourse",
//       color: "#E34F26", // HTML Orange
//     },
//     {
//       id: "css",
//       title: "CSS The Stylist",
//       icon: require("../Assets/css.png"),
//       description: "Design beautiful, responsive layouts.",
//       screen: "CssCourse",
//       color: "#2965F1", // CSS Blue
//     },
//     {
//       id: "javascript", // ✅ ID matches 'javascript' collection in JavascriptCourse.tsx
//       title: "JavaScript The Brain",
//       icon: require("../Assets/js.png"),
//       description: "Make websites interactive and dynamic.",
//       screen: "JsCourse", // ✅ Matches screen name
//       color: "#F7DF1E", // JS Yellow
//     },
//   ];

//   // --- DATA FETCHING ---
//   const fetchUserData = useCallback(async (forceRefresh = false) => {
//     try {
//       if (forceRefresh) setLoading(true);

//       // 1. Try Cache first
//       if (!forceRefresh) {
//         const [cachedUser, cachedCourses] = await Promise.all([
//           AsyncStorage.getItem("userName"),
//           AsyncStorage.getItem("coursesData"),
//         ]);
//         if (cachedUser && cachedCourses) {
//           setUserName(cachedUser);
//           setCoursesData(JSON.parse(cachedCourses));
//           setLoading(false);
//         } else {
//           setLoading(true);
//         }
//       }

//       const currentUser = auth().currentUser;
//       if (!currentUser) {
//         setUserName("Guest");
//         setCoursesData({});
//         setLoading(false);
//         return;
//       }

//       // 2. Fetch from Firestore
//       const userRef = firestore().collection("users").doc(currentUser.uid);
//       const progressRef = userRef.collection("progress");

//       const [userDoc, progressSnap] = await Promise.all([userRef.get(), progressRef.get()]);

//       const progressMap: Record<string, any> = {};
//       progressSnap.forEach((doc) => {
//         // doc.id is 'python', 'html', etc.
//         // doc.data() contains { enrolled: true, overallProgress: 50 }
//         progressMap[doc.id] = doc.data(); 
//       });

//       const name = userDoc.exists() ? (userDoc.data()?.name || "User") : "User";

//       // 3. Update State & Cache
//       setUserName(name);
//       setCoursesData(progressMap);

//       await AsyncStorage.setItem("userName", name);
//       await AsyncStorage.setItem("coursesData", JSON.stringify(progressMap));

//       setLoading(false);
//     } catch (err) {
//       console.error("fetchUserData error:", err);
//       setLoading(false);
//     }
//   }, []);

//   // Listen for Auth Changes
//   useEffect(() => {
//     const unsub = auth().onAuthStateChanged((u) => {
//       if (u) fetchUserData(true);
//     });
//     return () => unsub();
//   }, [fetchUserData]);

//   // Refresh data when returning to Home (to update progress bars)
//   useFocusEffect(
//     useCallback(() => {
//       fetchUserData(false);
//     }, [fetchUserData])
//   );

//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     fetchUserData(true).finally(() => setRefreshing(false));
//   }, [fetchUserData]);

//   // --- ENROLL LOGIC ---
//   const handleEnroll = async (courseId: string) => {
//     const currentUser = auth().currentUser;
//     if (!currentUser) return;
    
//     try {
//       // Create the progress document
//       await firestore()
//         .collection("users")
//         .doc(currentUser.uid)
//         .collection("courses")
//         .doc(courseId)
//         .set({ enrolled: true, overallProgress: 0 }, { merge: true });

//       // Update local state immediately
//       setCoursesData((prev) => ({ ...prev, [courseId]: { enrolled: true, overallProgress: 0 } }));
//       setShowEnrollModal(false);
      
//       // Optional: Auto-navigate after enroll
//       // const course = allCourses.find(c => c.id === courseId);
//       // if(course) navigation.navigate(course.screen as any);

//     } catch (e) {
//       console.warn("handleEnroll error", e);
//     }
//   };

//   const handleCourseClick = (course: CourseInfo) => {
//     const isEnrolled = coursesData[course.id]?.enrolled;
    
//     if (isEnrolled) {
//       navigation.navigate(course.screen as any);
//     } else {
//       setSelectedCourse(course);
//       setShowEnrollModal(true);
//     }
//   };

//   // Exit App Handler
//   useFocusEffect(
//     useCallback(() => {
//       const onBackPress = () => {
//         setExitModalVisible(true);
//         return true;
//       };
//       const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
//       return () => sub.remove();
//     }, [])
//   );

//   const getGreeting = () => {
//     const h = new Date().getHours();
//     if (h >= 5 && h < 12) return "Good Morning";
//     if (h >= 12 && h < 17) return "Good Afternoon";
//     if (h >= 17 && h < 21) return "Good Evening";
//     return "Good Night";
//   };

//   const navItems: { name: string; icon: any; screen: BottomNavScreen }[] = [
//     { name: "Home", icon: require("../Assets/home.png"), screen: "HomeScreen" },
//     { name: "Loved", icon: require("../Assets/heart.png"), screen: "Liked" },
//     { name: "Assistance", icon: require("../Assets/assist1.png"), screen: "Ai" },
//     { name: "LeaderBoard", icon: require("../Assets/trophy.png"), screen: "Leaderboard" },
//     { name: "Settings", icon: require("../Assets/setting.png"), screen: "Settings" },
//   ];

//   return (
//     <View style={styles.container}>
//       {/* Top Bar */}
//       <View style={styles.topBar}>
//         <View style={styles.topBarLeft}>
//           <Text style={styles.greeting}>{getGreeting()}, {userName}</Text>
//           <Text style={styles.motivation}>Time to level up your skills!</Text>
//         </View>
//         <TouchableOpacity onPress={() => navigation.navigate("Notification")}>
//           <Image source={require("../Assets/notification.png")} style={styles.icon} />
//         </TouchableOpacity>
//       </View>

//       <ScrollView
//         style={styles.scroll}
//         contentContainerStyle={styles.content}
//         showsVerticalScrollIndicator={false}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
//       >
//         {loading ? (
//           <ActivityIndicator color={colors.primary} size="large" style={styles.activityIndicatorStyle} />
//         ) : (
//           allCourses.map((course) => {
//             const userCourse = coursesData[course.id];
//             const isEnrolled = userCourse?.enrolled;
//             const progress = userCourse?.overallProgress || 0;

//             return (
//               <LanguageCard
//                 key={course.id}
//                 title={course.title}
//                 description={course.description}
//                 icon={course.icon}
//                 progress={isEnrolled ? progress : undefined}
//                 grayOut={!isEnrolled}
//                 onPress={() => handleCourseClick(course)}
//               />
//             );
//           })
//         )}
//       </ScrollView>

//       {/* Enroll Modal */}
//       <Modal visible={showEnrollModal} transparent animationType="fade" onRequestClose={() => setShowEnrollModal(false)}>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalCard}>
//             <Image source={selectedCourse?.icon} style={{width: 60, height: 60, marginBottom: 15}} resizeMode="contain" />
//             <Text style={styles.modalTitle}>Unlock {selectedCourse?.title}?</Text>
//             <Text style={styles.modalSubtitle}>Start your journey to become a developer.</Text>
            
//             <View style={styles.modalButtons}>
//               <Pressable style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setShowEnrollModal(false)}>
//                 <Text style={styles.cancelText}>Later</Text>
//               </Pressable>
//               <Pressable style={[styles.modalBtn, styles.enrollBtn]} onPress={() => selectedCourse && handleEnroll(selectedCourse.id)}>
//                 <Text style={styles.enrollText}>Start Learning</Text>
//               </Pressable>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* Bottom Nav */}
//       <View style={styles.bottomNav}>
//         {navItems.map((item, i) => {
//           const isActive = activeTab === item.name;
//           return (
//             <TouchableOpacity 
//               key={i} 
//               style={styles.navItem} 
//               onPress={() => { setActiveTab(item.name); if (item.screen !== "HomeScreen") navigation.navigate(item.screen); }}
//             >
//               <Image 
//                 source={item.icon} 
//                 style={[styles.navIcon, isActive && { tintColor: colors.primary }]} 
//               />
//               <Text style={[styles.navLabel, isActive && { color: colors.primary, fontFamily: "Poppins-SemiBold" }]}>
//                 {item.name}
//               </Text>
//             </TouchableOpacity>
//           );
//         })}
//       </View>

//       <ExitModal 
//         visible={exitModalVisible} 
//         onClose={() => setExitModalVisible(false)} 
//         onExit={() => { setExitModalVisible(false); setTimeout(() => BackHandler.exitApp(), 400); }} 
//       />
//     </View>
//   );
// }

// // --- STYLES ---
// export const styleGenerator = (colors: any) => StyleSheet.create({
//   container: { 
//     flex: 1, 
//     backgroundColor: colors.background 
//   },
//   topBar: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 24,
//     paddingTop: 40,
//     marginBottom: 10,
//     backgroundColor: colors.background,
//   },
//   topBarLeft: { flex: 1 },
//   greeting: {
//     fontSize: 20,
//     color: colors.textPrimary,
//     fontFamily: "Poppins-Bold",
//   },
//   motivation: {
//     fontSize: 13,
//     color: colors.textSecondary,
//     fontFamily: "Poppins-Medium",
//     marginTop: 2,
//   },
//   icon: { 
//     width: 24, 
//     height: 24, 
//     tintColor: colors.icon 
//   },
//   scroll: { flex: 1 },
//   content: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 10 },

//   // Modal
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalCard: {
//     backgroundColor: colors.card,
//     borderRadius: 24,
//     padding: 30,
//     width: "85%",
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     elevation: 10,
//   },
//   modalTitle: {
//     color: colors.textPrimary,
//     fontSize: 20,
//     fontFamily: "Poppins-Bold",
//     marginBottom: 8,
//     textAlign: "center",
//   },
//   modalSubtitle: {
//     color: colors.textSecondary,
//     fontSize: 14,
//     textAlign: "center",
//     marginBottom: 25,
//     fontFamily: "Poppins-Regular",
//   },
//   modalButtons: { flexDirection: "row", gap: 15, width: '100%' },
//   modalBtn: {
//     flex: 1,
//     paddingVertical: 14,
//     borderRadius: 14,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   cancelBtn: { backgroundColor: colors.buttonMuted },
//   enrollBtn: { backgroundColor: colors.primary },
//   cancelText: { color: colors.textSecondary, fontFamily: "Poppins-SemiBold", fontSize: 16 },
//   enrollText: { color: "#FFF", fontFamily: "Poppins-Bold", fontSize: 16 },

//   // Bottom Nav
//   bottomNav: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     backgroundColor: colors.card,
//     paddingVertical: 12,
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     position: "absolute",
//     bottom: 0,
//     width: "100%",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: -4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 20,
//     borderTopWidth: 1,
//     borderTopColor: colors.border || 'transparent',
//   },
//   navItem: { flex: 1, alignItems: "center", justifyContent: "center" },
//   navIcon: {
//     width: 24,
//     height: 24,
//     tintColor: colors.icon,
//     marginBottom: 4,
//     resizeMode: 'contain'
//   },
//   navLabel: {
//     fontSize: 11,
//     color: colors.textSecondary,
//     fontFamily: "Poppins-Medium",
//   },
//   activityIndicatorStyle: {
//     marginTop: 100,
//   },
// });
/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  BackHandler,
  Modal,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigator/AppNavigator";

// Components
import LanguageCard from "../components/LanguageCard";
import ExitModal from "../components/ExitModal";

// Hook
import { useThemeStyles } from "../hooks/useThemeStyles";

const { width } = Dimensions.get("window");

type HomeScreenNavigationProp = NativeStackScreenProps<
  RootStackParamList,
  "HomeScreen"
>["navigation"];

type BottomNavScreen =
  | "HomeScreen"
  | "Liked"
  | "Ai"
  | "Leaderboard"
  | "Settings";

type CourseInfo = {
  id: string;
  title: string;
  icon: any;
  description: string;
  screen: string;
  color: string; 
};

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState("Home");
  const [userName, setUserName] = useState("User");
  const [exitModalVisible, setExitModalVisible] = useState(false);
  
  const [coursesData, setCoursesData] = useState<Record<string, any>>({});
  
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<CourseInfo | null>(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 👉 The notification logic state
  const [hasUnreadNotifs, setHasUnreadNotifs] = useState(false);

  const { styles, colors } = useThemeStyles(styleGenerator);

  const allCourses: CourseInfo[] = [
    {
      id: "python",
      title: "Python The Master",
      icon: require("../Assets/python.png"),
      description: "Build your ideas into reality with Python.",
      screen: "PythonCourse",
      color: "#FFD43B", 
    },
    {
      id: "html",
      title: "HTML The Architect",
      icon: require("../Assets/html.png"),
      description: "Structure the web with semantic tags.",
      screen: "HtmlCourse",
      color: "#E34F26", 
    },
    {
      id: "css",
      title: "CSS The Stylist",
      icon: require("../Assets/css.png"),
      description: "Design beautiful, responsive layouts.",
      screen: "CssCourse",
      color: "#2965F1", 
    },
    {
      id: "javascript", 
      title: "JavaScript The Brain",
      icon: require("../Assets/js.png"),
      description: "Make websites interactive and dynamic.",
      screen: "JsCourse", 
      color: "#F7DF1E", 
    },
  ];

  // --- DATA FETCHING ---
  const fetchUserData = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) setLoading(true);

      if (!forceRefresh) {
        const [cachedUser, cachedCourses] = await Promise.all([
          AsyncStorage.getItem("userName"),
          AsyncStorage.getItem("coursesData"),
        ]);
        if (cachedUser && cachedCourses) {
          setUserName(cachedUser);
          setCoursesData(JSON.parse(cachedCourses));
          setLoading(false);
        } else {
          setLoading(true);
        }
      }

      const currentUser = auth().currentUser;
      if (!currentUser) {
        setUserName("Guest");
        setCoursesData({});
        setLoading(false);
        return;
      }

      const userRef = firestore().collection("users").doc(currentUser.uid);
      const coursesRef = userRef.collection("courses");

      const [userDoc, coursesSnap] = await Promise.all([userRef.get(), coursesRef.get()]);

      const progressMap: Record<string, any> = {};
      coursesSnap.forEach((doc) => {
        progressMap[doc.id] = doc.data(); 
      });

      const name = userDoc.exists() ? (userDoc.data()?.name || "User") : "User";

      setUserName(name);
      setCoursesData(progressMap);

      await AsyncStorage.setItem("userName", name);
      await AsyncStorage.setItem("coursesData", JSON.stringify(progressMap));

      setLoading(false);
    } catch (err) {
      console.error("fetchUserData error:", err);
      setLoading(false);
    }
  }, []);

  // 👉 NOTIFICATION LISTENER
  useEffect(() => {
    const currentUser = auth().currentUser;
    if (!currentUser) return;

    const unsub = firestore()
      .collection("users")
      .doc(currentUser.uid)
      .collection("notifications")
      .where("isRead", "==", false) 
      .onSnapshot(snap => {
         setHasUnreadNotifs(snap && !snap.empty);
      });
      
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = auth().onAuthStateChanged((u) => {
      if (u) fetchUserData(true);
    });
    return () => unsub();
  }, [fetchUserData]);

  useFocusEffect(
    useCallback(() => {
      fetchUserData(false);
    }, [fetchUserData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserData(true).finally(() => setRefreshing(false));
  }, [fetchUserData]);

  // --- ENROLL LOGIC ---
  const handleEnroll = async (courseId: string) => {
    const currentUser = auth().currentUser;
    if (!currentUser) return;
    
    try {
      await firestore()
        .collection("users")
        .doc(currentUser.uid)
        .collection("courses")
        .doc(courseId)
        .set({ progress: 0, lastUpdated: Date.now() }, { merge: true });

      setCoursesData((prev) => ({ ...prev, [courseId]: { progress: 0 } }));
      setShowEnrollModal(false);

    } catch (e) {
      console.warn("handleEnroll error", e);
    }
  };

  const handleCourseClick = (course: CourseInfo) => {
    const isEnrolled = !!coursesData[course.id];
    
    if (isEnrolled) {
      navigation.navigate(course.screen as any);
    } else {
      setSelectedCourse(course);
      setShowEnrollModal(true);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        setExitModalVisible(true);
        return true;
      };
      const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => sub.remove();
    }, [])
  );

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return "Good Morning";
    if (h >= 12 && h < 17) return "Good Afternoon";
    if (h >= 17 && h < 21) return "Good Evening";
    return "Good Night";
  };

  const navItems: { name: string; icon: any; screen: BottomNavScreen }[] = [
    { name: "Home", icon: require("../Assets/home.png"), screen: "HomeScreen" },
    { name: "Loved", icon: require("../Assets/heart.png"), screen: "Liked" },
    { name: "Assistance", icon: require("../Assets/assist1.png"), screen: "Ai" },
    { name: "LeaderBoard", icon: require("../Assets/trophy.png"), screen: "Leaderboard" },
    { name: "Settings", icon: require("../Assets/setting.png"), screen: "Settings" },
  ];

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Text style={styles.greeting} numberOfLines={1} adjustsFontSizeToFit>
            {getGreeting()}, {userName}
          </Text>
          <Text style={styles.motivation}>Time to level up your skills!</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("Notification")}>
          <View>
            <Image source={require("../Assets/notification.png")} style={styles.icon} />
            {/* 👉 THE ACTUAL RED DOT UI */}
            {hasUnreadNotifs && (
              <View style={{
                position: 'absolute', 
                top: -2, 
                right: -2,
                width: 10, 
                height: 10, 
                borderRadius: 5, 
                backgroundColor: '#FF4545',
                borderWidth: 1.5, 
                borderColor: colors.background
              }} />
            )}
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} size="large" style={styles.activityIndicatorStyle} />
        ) : (
          allCourses.map((course) => {
            const userCourse = coursesData[course.id];
            const isEnrolled = !!userCourse;
            const progress = userCourse?.progress || 0;

            return (
              <LanguageCard
                key={course.id}
                title={course.title}
                description={course.description}
                icon={course.icon}
                progress={isEnrolled ? progress : undefined}
                grayOut={!isEnrolled}
                onPress={() => handleCourseClick(course)}
              />
            );
          })
        )}
      </ScrollView>

      {/* Enroll Modal */}
      <Modal visible={showEnrollModal} transparent animationType="fade" onRequestClose={() => setShowEnrollModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Image source={selectedCourse?.icon} style={{width: 60, height: 60, marginBottom: 15}} resizeMode="contain" />
            <Text style={styles.modalTitle}>Unlock {selectedCourse?.title}?</Text>
            <Text style={styles.modalSubtitle}>Start your journey to become a developer.</Text>
            
            <View style={styles.modalButtons}>
              <Pressable style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setShowEnrollModal(false)}>
                <Text style={styles.cancelText}>Later</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, styles.enrollBtn]} onPress={() => selectedCourse && handleEnroll(selectedCourse.id)}>
                <Text style={styles.enrollText}>Start Learning</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        {navItems.map((item, i) => {
          const isActive = activeTab === item.name;
          return (
            <TouchableOpacity 
              key={i} 
              style={styles.navItem} 
              onPress={() => { setActiveTab(item.name); if (item.screen !== "HomeScreen") navigation.navigate(item.screen); }}
            >
              <Image 
                source={item.icon} 
                style={[styles.navIcon, isActive && { tintColor: colors.primary }]} 
              />
              <Text style={[styles.navLabel, isActive && { color: colors.primary, fontFamily: "Poppins-SemiBold" }]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ExitModal 
        visible={exitModalVisible} 
        onClose={() => setExitModalVisible(false)} 
        onExit={() => { setExitModalVisible(false); setTimeout(() => BackHandler.exitApp(), 400); }} 
      />
    </View>
  );
}

// --- STYLES ---
export const styleGenerator = (colors: any) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background 
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: width * 0.06, 
    paddingTop: Platform.OS === 'ios' ? 50 : 40, 
    marginBottom: 10,
    backgroundColor: colors.background,
  },
  topBarLeft: { flex: 1, paddingRight: 10 },
  greeting: {
    fontSize: 19, 
    color: colors.textPrimary,
    fontFamily: "Poppins-Bold",
  },
  motivation: {
    fontSize: 12, 
    color: colors.textSecondary,
    fontFamily: "Poppins-Medium",
    marginTop: 2,
  },
  icon: { 
    width: 24, 
    height: 24, 
    tintColor: colors.icon 
  },
  scroll: { flex: 1 },
  content: { 
    paddingHorizontal: width * 0.05, 
    paddingBottom: Platform.OS === 'ios' ? 120 : 100, 
    paddingTop: 10 
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20, 
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 30,
    width: width > 400 ? 360 : "95%", 
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 19, 
    fontFamily: "Poppins-Bold",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    color: colors.textSecondary,
    fontSize: 13, 
    textAlign: "center",
    marginBottom: 25,
    fontFamily: "Poppins-Regular",
  },
  modalButtons: { flexDirection: "row", gap: 15, width: '100%' },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: { backgroundColor: colors.buttonMuted },
  enrollBtn: { backgroundColor: colors.primary },
  cancelText: { color: colors.textSecondary, fontFamily: "Poppins-SemiBold", fontSize: 15 }, 
  enrollText: { color: "#FFF", fontFamily: "Poppins-Bold", fontSize: 15 }, 

  // Bottom Nav
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: colors.card,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12, 
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    position: "absolute",
    bottom: 0,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border || 'transparent',
  },
  navItem: { flex: 1, alignItems: "center", justifyContent: "center" },
  navIcon: {
    width: 24,
    height: 24,
    tintColor: colors.icon,
    marginBottom: 4,
    resizeMode: 'contain'
  },
  navLabel: {
    fontSize: 10, 
    color: colors.textSecondary,
    fontFamily: "Poppins-Medium",
  },
  activityIndicatorStyle: {
    marginTop: 100,
  },
});