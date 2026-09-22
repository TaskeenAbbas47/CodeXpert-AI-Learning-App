 
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Modal,
  Alert, 
} from "react-native";
import LottieView from "lottie-react-native";
import { useNavigation } from "@react-navigation/native";
import { useBackWithAnim } from "../hooks/useBackWithAnim";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

// 1. Import Theme Hook
import { useThemeStyles } from "../hooks/useThemeStyles";

// --- Static Data Mapping ---
const COURSE_INFO: Record<string, any> = {
  python: { title: "Python Mastery", icon: require("../Assets/python.png"), color: "#FFD43B" },
  html: { title: "HTML5 Fundamentals", icon: require("../Assets/html.png"), color: "#E44D26" },
  css: { title: "CSS3 Styling", icon: require("../Assets/css.png"), color: "#264DE4" },
  javascript: { title: "Modern JavaScript", icon: require("../Assets/js.png"), color: "#F7DF1E" },
  ml: { title: "Machine Learning", icon: require("../Assets/ml.png"), color: "#FF6B6B" },
};

type EnrolledCourse = {
  id: string;
  progress: number;
  lastPlayed?: number;
};

export default function CoursesScreen() {
  const { styles, colors } = useThemeStyles(styleGenerator);
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [showBackAnim, setShowBackAnim] = useState(false);
  
  // Un-enroll State
  const [showUnenrollModal, setShowUnenrollModal] = useState(false);
  const [courseToUnenroll, setCourseToUnenroll] = useState<string | null>(null);
  const [unenrollLoading, setUnenrollLoading] = useState(false);

  // Animation for Back Button
  const playBackAnim = () =>
    new Promise<void>((resolve) => {
      setShowBackAnim(true);
      setTimeout(() => resolve(), 600);
    });

  const { handleBackPress } = useBackWithAnim(playBackAnim, "HomeScreen");

  // 👉 FIXED: Fetch Enrolled Courses from the correct 'courses' sub-collection
  useEffect(() => {
    const user = auth().currentUser;
    if (!user) return;

    const unsubscribe = firestore()
      .collection("users")
      .doc(user.uid)
      .collection("courses") // 🔥 Changed from 'progress' to 'courses' to match your DB
      .onSnapshot((snapshot) => {
        const fetchedCourses: EnrolledCourse[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          fetchedCourses.push({
            id: doc.id,
            progress: data.progress || 0, // 🔥 Changed from 'overallProgress' to 'progress'
            lastPlayed: data.lastUpdated || 0, // 🔥 Changed to 'lastUpdated' based on your DB screenshot
          });
        });

        // Sort by most recently played/updated
        fetchedCourses.sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0));
        
        setCourses(fetchedCourses);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching courses:", error);
        setLoading(false);
      });

    return () => unsubscribe();
  }, []);

  const handlePressCourse = (courseId: string) => {
    if (courseId === 'python') navigation.navigate('PythonCourse');
    else Alert.alert("Coming Soon", "Course content coming soon!");
  };

  const confirmUnenroll = (courseId: string) => {
      setCourseToUnenroll(courseId);
      setShowUnenrollModal(true);
  };

  // 👉 FIXED: Deep Delete Logic paths updated
  const handleUnenroll = async () => {
      if (!courseToUnenroll) return;
      setUnenrollLoading(true);
      
      const user = auth().currentUser;
      if (!user) return;

      const courseRef = firestore()
        .collection("users")
        .doc(user.uid)
        .collection("courses") // 🔥 Changed from 'progress' to 'courses'
        .doc(courseToUnenroll);

      try {
          // 1. Delete Sub-collections (if any exist, e.g. 'completedLessons')
          const subCollection = await courseRef.collection('completedLessons').get();
          
          const batch = firestore().batch();
          
          subCollection.docs.forEach((doc) => {
              batch.delete(doc.ref);
          });

          // 2. Delete the Main Course Document
          batch.delete(courseRef);

          await batch.commit();
            
          setShowUnenrollModal(false);
          setCourseToUnenroll(null);
      } catch (error) {
          console.error("Un-enroll Error:", error);
          Alert.alert("Error", "Failed to un-enroll fully. Please try again.");
      } finally {
          setUnenrollLoading(false);
      }
  };

  const renderItem = ({ item }: { item: EnrolledCourse }) => {
    const info = COURSE_INFO[item.id] || { title: item.id.toUpperCase(), icon: require("../Assets/code.png"), color: colors.primary };
    
    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.9} 
        onPress={() => handlePressCourse(item.id)}
      >
        <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: info.color + '20' }]}>
                <Image source={info.icon} style={styles.courseIcon} resizeMode="contain" />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.courseTitle}>{info.title}</Text>
                <Text style={styles.courseSubtitle}>{item.progress === 100 ? "Completed" : `${Math.round(item.progress)}% Complete`}</Text>
            </View>
            
            <TouchableOpacity onPress={() => confirmUnenroll(item.id)} style={styles.deleteBtn}>
                <Image source={require("../Assets/delete.png")} style={styles.deleteIcon} />
            </TouchableOpacity>
        </View>

        <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${item.progress}%`, backgroundColor: info.color }]} />
        </View>
      </TouchableOpacity>
    );
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
        <Text style={styles.headerText}>My Courses</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : courses.length === 0 ? (
        <View style={styles.emptyState}>
            <LottieView source={require("../Assets/search.json")} autoPlay loop style={styles.emptyAnim} />
            <Text style={styles.emptyText}>You haven't enrolled in any courses yet.</Text>
            <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate("HomeScreen")}>
                <Text style={styles.browseText}>Browse Courses</Text>
            </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Un-enroll Confirmation Modal */}
      <Modal visible={showUnenrollModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
                <View style={styles.warningIconContainer}>
                    <Image source={require("../Assets/delete.png")} style={styles.warningIcon} />
                </View>
                <Text style={styles.modalTitle}>Un-enroll Course?</Text>
                <Text style={styles.modalSubtitle}>
                    All progress for this course will be permanently lost. Are you sure?
                </Text>
                
                <View style={styles.modalActions}>
                    <TouchableOpacity 
                        style={styles.cancelBtn} 
                        onPress={() => setShowUnenrollModal(false)}
                        disabled={unenrollLoading}
                    >
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.confirmBtn} 
                        onPress={handleUnenroll}
                        disabled={unenrollLoading}
                    >
                        {unenrollLoading ? (
                            <ActivityIndicator color="#FFF" size="small" />
                        ) : (
                            <Text style={styles.confirmText}>Un-enroll</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

    </View>
  );
}

// 3. Style Generator
const styleGenerator = (colors: any) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background, 
    padding: 20 
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 20,
    paddingBottom: 10,
  },
  backIcon: { 
    width: 24, 
    height: 24, 
    marginRight: 15, 
    resizeMode: "contain" 
  },
  headerText: { 
    color: colors.textPrimary, 
    fontSize: 22, 
    fontFamily: "Poppins-SemiBold" 
  },

  list: { 
    paddingBottom: 40 
  },

  // Course Card
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border || "#2D2D55",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  courseIcon: {
    width: 28,
    height: 28,
  },
  textContainer: {
    flex: 1,
  },
  courseTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 2,
  },
  courseSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: "Poppins-Regular",
  },
  deleteBtn: {
      padding: 8,
      backgroundColor: '#FF454515',
      borderRadius: 8,
  },
  deleteIcon: {
    width: 18,
    height: 18,
    tintColor: '#FF4545',
  },

  // Progress Bar
  progressBarBg: {
    height: 6,
    backgroundColor: colors.background,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -50,
  },
  emptyAnim: {
    width: 200,
    height: 200,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    marginBottom: 20,
  },
  browseBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  browseText: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
  },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: colors.overlay || 'rgba(0,0,0,0.7)', justifyContent: "center", alignItems: "center" },
  modalContent: { width: "85%", backgroundColor: colors.card, borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontFamily: "Poppins-Bold", color: colors.textPrimary, marginBottom: 10, textAlign: "center" },
  modalSubtitle: { color: colors.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: colors.buttonMuted, alignItems: 'center' },
  confirmBtn: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#FF4545', alignItems: 'center' },
  cancelText: { color: colors.textPrimary, fontFamily: "Poppins-SemiBold" },
  confirmText: { color: '#FFF', fontFamily: "Poppins-SemiBold" },

  warningIconContainer: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FF454520', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 15 },
  warningIcon: { width: 30, height: 30, tintColor: '#FF4545' },

  // Animation
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