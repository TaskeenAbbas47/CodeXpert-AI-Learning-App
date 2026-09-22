/* eslint-disable react-native/no-inline-styles */
import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  LogBox,
} from "react-native";
import LottieView from "lottie-react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";

import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { useBackWithAnim } from "../hooks/useBackWithAnim";

// 1. Import The Hook
import { useThemeStyles } from "../hooks/useThemeStyles";

type LikedLesson = {
  id: string;
  title: string;
  course: string;
  lessonId?: string;
  thumbnail: any;
  liked: boolean;
  timestamp?: number;
};

const localThumbMap: Record<string, any> = {
  python: require("../Assets/python.png"),
  js: require("../Assets/js.png"),
  javascript: require("../Assets/js.png"),
  html: require("../Assets/html.png"),
  css: require("../Assets/css.png"),
  default: require("../Assets/unlove.png"),
};

const getThumbnailForDoc = (docData: any) => {
  const thumb = docData?.thumbnail;
  if (typeof thumb === "string" && (thumb.startsWith("http") || thumb.startsWith("https"))) {
    return { uri: thumb };
  }

  const course = (docData?.courseId || docData?.course || "").toString().toLowerCase();
  if (course.includes("python")) return localThumbMap.python;
  if (course.includes("js") || course.includes("javascript")) return localThumbMap.js;
  if (course.includes("html")) return localThumbMap.html;
  if (course.includes("css")) return localThumbMap.css;
  return localThumbMap.default;
};

LogBox.ignoreLogs([
  "This method is deprecated (as well as all React Native Firebase namespaced API)",
  "Method called was `collection`",
  "Method called was `doc`",
]);

const LikedScreen = () => {
  const navigation = useNavigation<any>();
  
  // 2. Initialize Theme Hook
  const { styles, colors } = useThemeStyles(styleGenerator);

  const [likedLessons, setLikedLessons] = useState<LikedLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showBackAnim, setShowBackAnim] = useState(false);
  const animationRef = useRef<LottieView | null>(null);

  const playBackAnim = () =>
    new Promise<void>((resolve) => {
      setShowBackAnim(true);
      animationRef.current?.play();
      setTimeout(() => {
        setShowBackAnim(false);
        resolve();
      }, 900);
    });

  const { handleBackPress } = useBackWithAnim(playBackAnim, "HomeScreen");

  const loadFavorites = useCallback(async () => {
    setIsLoading(true);
    const currentUser = auth().currentUser;
    if (!currentUser) {
      setLikedLessons([]);
      setIsLoading(false);
      return;
    }

    try {
      const snap = await firestore()
        .collection("users")
        .doc(currentUser.uid)
        .collection("favorites")
        .get();

      const items: LikedLesson[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        let tsNum = 0;
        if (data.timestamp) {
          if (typeof data.timestamp === "number") tsNum = data.timestamp;
          else if (data.timestamp?.toMillis) tsNum = data.timestamp.toMillis();
        }
        items.push({
          id: doc.id,
          title: data.title || `${data.courseId || "Unknown"} lesson`,
          course: data.courseId || data.course || "unknown",
          lessonId: data.lessonId || undefined,
          thumbnail: getThumbnailForDoc({ ...data, id: doc.id }),
          liked: true,
          timestamp: tsNum,
        });
      });

      items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setLikedLessons(items);
    } catch (e) {
      console.warn("loadFavorites failed", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      setIsLoading(false);
      setLikedLessons([]);
      return;
    }

    const favoritesRef = firestore().collection("users").doc(currentUser.uid).collection("favorites");

    const unsubscribe = favoritesRef.onSnapshot(
      (snap) => {
        const items: LikedLesson[] = [];
        snap.forEach((doc) => {
          const data = doc.data();
          let tsNum = 0;
          if (data.timestamp) {
            if (typeof data.timestamp === "number") tsNum = data.timestamp;
            else if (data.timestamp?.toMillis) tsNum = data.timestamp.toMillis();
          }
          items.push({
            id: doc.id,
            title: data.title || `${data.courseId || "Unknown"} lesson`,
            course: data.courseId || data.course || "unknown",
            lessonId: data.lessonId || undefined,
            thumbnail: getThumbnailForDoc({ ...data, id: doc.id }),
            liked: true,
            timestamp: tsNum,
          });
        });

        items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setLikedLessons(items);
        setIsLoading(false);
      },
      (err) => {
        console.warn("favorites snapshot error:", err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const unlikeLesson = async (id: string) => {
    setLikedLessons((prev) => prev.filter((item) => item.id !== id));

    const currentUser = auth().currentUser;
    if (!currentUser) return;

    try {
      await firestore().collection("users").doc(currentUser.uid).collection("favorites").doc(id).delete();
    } catch (error) {
      console.error("Failed to remove favorite:", error);
      loadFavorites();
    }
  };

  const renderRightAction = (id: string) => (
    <TouchableOpacity onPress={() => unlikeLesson(id)} style={styles.swipeDelete}>
      <Image source={require("../Assets/unlike.png")} style={[styles.unlikeIcon, { tintColor: colors.accent }]} />
    </TouchableOpacity>
  );

  const openLesson = (item: LikedLesson) => {
    navigation.navigate("PythonCourse", {
      openCourseId: item.course?.toString().toLowerCase() || "python",
      openLessonId: item.lessonId || item.id,
    });
  };

  const renderLesson = ({ item }: { item: LikedLesson }) => (
    <Swipeable renderRightActions={() => renderRightAction(item.id)}>
      <TouchableOpacity activeOpacity={0.8} onPress={() => openLesson(item)}>
        <View style={styles.lessonCard}>
          <View style={styles.lessonInfo}>
            <Image source={item.thumbnail} style={styles.thumbnail} />
            <View style={styles.textContainer}>
              <Text style={styles.lessonTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.courseName}>{item.course}</Text>
            </View>
          </View>
          <Image source={require("../Assets/liked.png")} style={[styles.heartIcon, { tintColor: colors.accent }]} />
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      {showBackAnim && (
        <View style={styles.backAnimOverlay}>
          <LottieView ref={animationRef} source={require("../Assets/backAnimation.json")} autoPlay loop={false} style={styles.backAnim} />
        </View>
      )}

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Image source={require("../Assets/back.png")} style={[styles.backIcon, { tintColor: colors.icon }]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Liked Lessons</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : likedLessons.length === 0 ? (
        <View style={styles.emptyState}>
          <LottieView source={require("../Assets/nothing.json")} autoPlay loop style={styles.emptyAnim} />
          <Text style={styles.emptyText}>No liked lessons yet!</Text>
          <TouchableOpacity style={{ marginTop: 14 }} onPress={() => navigation.navigate("HomeScreen")}>
            <Text style={{ color: colors.primary }}>Browse courses</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={likedLessons}
          renderItem={renderLesson}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          removeClippedSubviews
          initialNumToRender={8}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        />
      )}
    </View>
  );
};

export default LikedScreen;

// 3. Style Generator
export const styleGenerator = (colors: any) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background 
  },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    padding: 14, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.border || "#222" // Use a border color if available, else default dark
  },
  backIcon: { 
    width: 26, 
    height: 26, 
    marginRight: 12, 
    resizeMode: "contain" 
    // tintColor handled inline
  },
  headerTitle: { 
    fontSize: 18, 
    color: colors.textPrimary, 
    fontFamily: "Poppins-SemiBold" 
  },
  listContent: { 
    padding: 16 
  },
  lessonCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border || "#2D2D55",
    // Shadow for light mode
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  lessonInfo: { 
    flexDirection: "row", 
    alignItems: "center", 
    flex: 1 
  },
  thumbnail: { 
    width: 50, 
    height: 50, 
    borderRadius: 10, 
    marginRight: 12 
  },
  textContainer: { 
    flex: 1 
  },
  lessonTitle: { 
    color: colors.textPrimary, 
    fontSize: 14, 
    fontFamily: "Poppins-SemiBold" 
  },
  courseName: { 
    color: colors.textSecondary, 
    fontSize: 12, 
    fontFamily: "Poppins-Regular" 
  },
  heartIcon: { 
    width: 26, 
    height: 26, 
    resizeMode: "contain" 
    // tintColor handled inline (accent)
  },
  swipeDelete: { 
    backgroundColor: "#2B1A1A", // You might want this to be dynamic too, but red bg works for delete
    justifyContent: "center", 
    alignItems: "center", 
    marginVertical: 4, 
    borderRadius: 12, 
    width: 80 
  },
  unlikeIcon: { 
    width: 36, 
    height: 36, 
    // tintColor handled inline
  },
  emptyState: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  emptyAnim: { 
    width: 180, 
    height: 180, 
    marginBottom: 10 
  },
  emptyText: { 
    color: colors.textSecondary, 
    fontSize: 14, 
    fontFamily: "Poppins-Regular" 
  },
  backAnimOverlay: { 
    position: "absolute", 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: colors.background, // Matches theme bg
    justifyContent: "center", 
    alignItems: "center", 
    zIndex: 100 
  },
  backAnim: { 
    width: 200, 
    height: 200 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
});