import firestore from "@react-native-firebase/firestore";

/**
 * Checks if specific progress documents exist in Firestore.
 * Useful for debugging why a lesson might be locked.
 */
export async function verifyProgressPath(uid: string | undefined, courseId: string, sectionId: string, lessonId?: string) {
  try {
    if (!uid) {
      console.warn("verifyProgressPath: No User ID provided.");
      return { sectionExists: false, lessonExists: false };
    }

    console.log(`[Debug] Checking: ${courseId} -> Section ${sectionId} -> Lesson ${lessonId || "N/A"}`);

    const base = firestore()
      .collection("users")
      .doc(uid)
      .collection("progress")
      .doc(courseId)
      .collection("sections")
      .doc(String(sectionId));

    const sectionSnap = await base.get();
    let lessonData = null;
    let lessonExists = false;

    if (lessonId) {
      const lessonSnap = await base.collection("lessons").doc(String(lessonId)).get();
      lessonExists = lessonSnap.exists();
      lessonData = lessonSnap.data();
    }

    return { 
        sectionExists: sectionSnap.exists, 
        lessonExists, 
        lessonData 
    };

  } catch (err) {
    console.error("verifyProgressPath crashed", err);
    throw err;
  }
}

/**
 * ✅ NEW: Deletes all progress for a specific course.
 * Use this to reset the "HTML" or "Python" course to 0% for testing.
 */
export async function resetCourseProgress(uid: string, courseId: string) {
    if (!uid) return;
    
    console.log(`[Debug] Resetting course: ${courseId}...`);
    
    try {
        const courseRef = firestore().collection("users").doc(uid).collection("progress").doc(courseId);
        
        // 1. Delete the main course document (overall progress)
        await courseRef.delete();

        // 2. Note: Firestore collections must be deleted document by document.
        // Doing a full recursive delete client-side is expensive.
        // For simple testing, deleting the main doc and letting the UI default to 0 is often enough,
        // OR you manually overwrite specific sections to { unlocked: false }.
        
        console.log(`[Debug] Course ${courseId} metadata reset.`);
        return true;
    } catch (e) {
        console.error("Reset failed", e);
        return false;
    }
}