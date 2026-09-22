import firestore from "@react-native-firebase/firestore";

// Helper to get the ref
const getLessonRef = (userId: string, courseId: string, sectionId: string, lessonId: string) => {
  return firestore()
    .collection("users")
    .doc(userId)
    .collection("progress")
    .doc(courseId)
    .collection("sections")
    .doc(sectionId)
    .collection("lessons")
    .doc(lessonId);
};

export const markLessonComplete = async (
  userId: string,
  courseId: string,
  sectionId: string,
  lessonId: string
) => {
  try {
    const lessonRef = getLessonRef(userId, courseId, sectionId, lessonId);

    // ✅ Force update: Always ensure it is completed and unlocked
    await lessonRef.set(
      { completed: true, unlocked: true },
      { merge: true }
    );
    console.log(`Lesson ${lessonId} marked complete.`);
  } catch (error) {
    console.error("Error marking lesson complete:", error);
  }
};

export const unlockNextLesson = async (
  userId: string,
  courseId: string,
  sectionId: string,
  nextLessonId: string
) => {
  try {
    const nextLessonRef = getLessonRef(userId, courseId, sectionId, nextLessonId);
    
    const doc = await nextLessonRef.get();
    
    if (doc.exists()) {
        // CRITICAL FIX: If it exists, ONLY unlock it. 
        // Do NOT touch 'completed' status.
        await nextLessonRef.update({ unlocked: true });
    } else {
        // Only if it's brand new do we initialize it
        await nextLessonRef.set(
            { unlocked: true, completed: false },
            { merge: true }
        );
    }
  } catch (error) {
    console.error("Error unlocking next lesson:", error);
  }
};

export const listenToSectionProgress = (
  userId: string,
  courseId: string,
  sectionId: string,
  onProgressUpdate: (data: any) => void
) => {
  return firestore()
    .collection("users")
    .doc(userId)
    .collection("progress")
    .doc(courseId)
    .collection("sections")
    .doc(sectionId)
    .collection("lessons")
    .onSnapshot(
      (snapshot) => {
        const progressData: any = {};
        snapshot.docs.forEach((doc) => {
          progressData[doc.id] = doc.data();
        });
        onProgressUpdate(progressData);
      },
      (error) => console.error("Progress listener error:", error)
    );
};

export const updateOverallCourseProgress = async (
    userId: string,
    courseId: string,
    progress: number
) => {
    try {
        await firestore()
            .collection("users")
            .doc(userId)
            .collection("courses")
            .doc(courseId)
            .set({ progress, lastUpdated: Date.now() }, { merge: true });
    } catch (e) {
        console.warn("Failed to update overall progress", e);
    }
};