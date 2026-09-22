/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";

import LottieView from "lottie-react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

import { useBackWithAnim } from "../hooks/useBackWithAnim";
import CourseRoadmap from "../components/CourseRoadmap";
import LessonView from "../components/LessonView";
import { loadCourse } from "../utils/courseManager";
import {
  markLessonComplete,
  unlockNextLesson,
  listenToSectionProgress,
  updateOverallCourseProgress, // ✅ 1. Import this function
} from "../utils/progressManager";

// Theme Hook
import { useThemeStyles } from "../hooks/useThemeStyles";

// Enable Layout Animation
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HtmlCourse({ _navigation }: any) {
  const { styles, colors } = useThemeStyles(styleGenerator);

  const [course, setCourse] = useState<any | null>(null);
  const [selectedSection, setSelectedSection] = useState<any | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<any | null>(null);
  
  // Progress State
  const [lessonStates, setLessonStates] = useState<
    Record<string, { unlocked?: boolean; completed?: boolean }>
  >({});
  
  const [loading, setLoading] = useState(true);
  const [showBackAnim, setShowBackAnim] = useState(false);

  const animationRef = useRef<LottieView>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const user = auth().currentUser;

  // --- Animation Logic ---
  const playBackAnim = () =>
    new Promise<void>((resolve) => {
      setShowBackAnim(true);
      animationRef.current?.play();
      timeoutRef.current = setTimeout(() => {
        setShowBackAnim(false);
        resolve();
      }, 900);
    });

  const { handleBackPress } = useBackWithAnim(playBackAnim, "HomeScreen");

  // --- Helper: Get Full Lesson Object ---
  const getFullLesson = useCallback(
    (section: any, lessonId: string) => {
      const fromSection = section?.lessons?.find(
        (l: any) => String(l.id) === String(lessonId)
      );
      
      if (fromSection) {
        return { 
            ...fromSection, 
            content: fromSection.content || [],
            consoleExercise: fromSection.consoleExercise || null,
            quiz: fromSection.quiz || null
        };
      }
      return { id: lessonId, title: "Lesson", content: [] };
    },
    []
  );

  // --- 1. Load Data ---
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        // ✅ LOAD HTML COURSE
        const data = await loadCourse("html_linear_mastery");
        
        if (mounted) {
            if (data) {
                setCourse(data);
                // Auto-select if simple structure
                if (data.sections?.length === 1) {
                    setSelectedSection(data.sections[0]);
                }
            } else {
                console.error("HTML Course data missing.");
            }
        }
      } catch (e) {
        console.warn("loadCourse failed", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();
    return () => {
      mounted = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // --- 2. Listen to Progress (HTML) ---
  useEffect(() => {
    if (!user || !selectedSection) {
      setLessonStates({});
      return;
    }

    const uid = user.uid;
    // ✅ Listen to "html" collection
    const unsub = listenToSectionProgress(
      uid,
      "html", 
      String(selectedSection.id),
      (progress) => {
        setLessonStates(progress || {});
      }
    );

    // Ensure Lesson 1 is always unlocked
    (async () => {
      try {
        const firstLessonId = selectedSection?.lessons?.[0]?.id;
        if (!firstLessonId) return;
        
        const docRef = firestore()
          .collection("users")
          .doc(uid)
          .collection("progress")
          .doc("html") // ✅ "html" doc
          .collection("sections")
          .doc(String(selectedSection.id))
          .collection("lessons")
          .doc(String(firstLessonId));
          
        const snap = await docRef.get();
        if (!snap.exists) {
          await docRef.set({ unlocked: true, completed: false }, { merge: true });
        }
      } catch (e) { console.warn("Ensure first lesson failed", e); }
    })();

    return () => { if (unsub) unsub(); };
  }, [user, selectedSection]);

  const calculateSectionProgress = useCallback(
    (section: any) => {
      const total = section?.lessons?.length || 0;
      if (total === 0) return 0;
      const completed = section.lessons.filter(
        (l: any) => lessonStates[l.id]?.completed
      ).length;
      return Math.round((completed / total) * 100) || 0;
    },
    [lessonStates]
  );

  // --- Calculate Overall Progress ---
  const overallProgress = course?.sections
    ? Math.round(
        (course.sections.reduce(
          (acc: number, s: any) => acc + calculateSectionProgress(s),
          0
        ) / (course.sections.length || 1)) || 0
      )
    : 0;

  // ✅ 3. Sync Progress to Home Screen
  useEffect(() => {
    if (user && course) {
        updateOverallCourseProgress(user.uid, "html", overallProgress);
    }
  }, [overallProgress, user, course]);

  const handleLessonComplete = async () => {
    const uid = auth().currentUser?.uid;
    if (!uid || !selectedSection || !selectedLesson) return;

    const sectionId = String(selectedSection.id);
    const lessonId = String(selectedLesson.id);

    try {
      // ✅ Use "html" ID
      await markLessonComplete(uid, "html", sectionId, lessonId);

      const idx = selectedSection.lessons.findIndex(
        (l: any) => String(l.id) === lessonId
      );
      const next = selectedSection.lessons[idx + 1];

      if (next) {
        await unlockNextLesson(uid, "html", sectionId, String(next.id));
       const nextLessonFull = getFullLesson(selectedSection, String(next.id));
      setSelectedLesson(nextLessonFull);
      } else {
        setSelectedLesson(null); 
      }
    } catch (err) {
      console.error("handleLessonComplete error", err);
    }
  };

  const handleBack = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (selectedLesson) {
        setSelectedLesson(null);
    } else if (selectedSection && course?.sections?.length > 1) {
        setSelectedSection(null);
    } else {
        handleBackPress();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  // Fallback UI if file missing
  if (!course) {
    return (
        <View style={styles.loadingContainer}>
            <Text style={{color: colors.textSecondary, marginBottom: 10}}>
                Course Content Not Found
            </Text>
            <TouchableOpacity onPress={handleBackPress}>
                <Text style={{color: colors.primary, fontWeight: 'bold'}}>Go Back</Text>
            </TouchableOpacity>
        </View>
    )
  }

  return (
    <View style={styles.container}>
      {showBackAnim && (
        <View style={styles.backAnimOverlay}>
          <LottieView
            ref={animationRef}
            source={require("../Assets/backAnimation.json")}
            autoPlay
            loop={false}
            style={styles.backAnim}
          />
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Image
            source={require("../Assets/back.png")}
            style={[styles.backIcon, { tintColor: colors.icon }]}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {selectedLesson ? selectedLesson.title : "HTML5 Architect"}
        </Text>
      </View>

      {/* VIEW 1: Section List */}
      {!selectedSection && !selectedLesson && (
        <FlatList
          data={course?.sections || []}
          keyExtractor={(item: any) => String(item.id)}
          ListHeaderComponent={
            <Text style={styles.courseProgress}>Overall Progress: {overallProgress}%</Text>
          }
          renderItem={({ item }: any) => {
            const progress = calculateSectionProgress(item);
            return (
              <TouchableOpacity
                style={styles.sectionCard}
                onPress={() => setSelectedSection(item)}
              >
                <View style={styles.sectionContent}>
                  <Text style={styles.sectionTitle}>{item.title}</Text>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${progress}%`, backgroundColor: colors.accent }, // Orange/Red for HTML
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>{progress}% completed</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* VIEW 2: Roadmap */}
      {selectedSection && !selectedLesson && (
        <CourseRoadmap
          title="HTML"
          subtitle={selectedSection.title}
          progress={calculateSectionProgress(selectedSection)}
          iconLanguage={require("../Assets/html.png")} // ✅ Use HTML Icon
          levels={selectedSection.lessons.map((lesson: any, i: number) => ({
            id: String(lesson.id),
            title: lesson.title,
            unlocked: lessonStates[lesson.id]?.unlocked || i === 0,
            completed: lessonStates[lesson.id]?.completed || false,
          }))}
          onLevelPress={(level) => {
            const unlocked =
              lessonStates[level.id]?.unlocked ||
              selectedSection.lessons[0].id === level.id;
            
            if (!unlocked) return;
            
            const full = getFullLesson(selectedSection, String(level.id));
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setSelectedLesson(full);
          }}
          onCenterPress={() => console.log("AI Help")}
        />
      )}

      {/* VIEW 3: Interactive Lesson */}
      {selectedLesson && (
        <LessonView
          courseId="html" // ✅ "html"
          sectionId={String(selectedSection.id)}
          lessonId={String(selectedLesson.id)}
          lessonContent={selectedLesson}
          onBack={() => setSelectedLesson(null)}
          onComplete={handleLessonComplete}
        />
      )}
    </View>
  );
}

// 3. Style Generator
const styleGenerator = (colors: any) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background 
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border || "#222",
    backgroundColor: colors.background,
    zIndex: 10,
  },
  backIcon: { 
    width: 24, 
    height: 24, 
    marginRight: 15,
    resizeMode: 'contain' 
  },
  headerTitle: { 
    fontSize: 18, 
    color: colors.textPrimary, 
    fontFamily: "Poppins-SemiBold",
    flex: 1, 
  },
  courseProgress: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 15,
    fontFamily: "Poppins-Medium",
    textAlign: 'center'
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border || "#333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionContent: { flex: 1 },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    marginBottom: 10,
  },
  progressBarContainer: {
    width: "100%",
    height: 6,
    backgroundColor: colors.border || "#2D2D55",
    borderRadius: 10,
    marginBottom: 8,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 10,
  },
  progressText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: "Poppins-Regular",
  },
  listContent: { padding: 20 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background
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
  backAnim: { width: 180, height: 180 },
});