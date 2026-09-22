import AsyncStorage from "@react-native-async-storage/async-storage";
import localPython from "../Assets/data/pythonCourse.json";
import localHtml from "../Assets/data/htmlCourse.json"; 
import localCss from "../Assets/data/cssCourse.json"; 
import localJavascript from "../Assets/data/javascriptCourse.json"; 

const CACHE_PREFIX = "course_";

export async function getCachedCourse(courseId: string) {
  try {
    const data = await AsyncStorage.getItem(CACHE_PREFIX + courseId);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function saveCachedCourse(courseId: string, data: any) {
  try {
    await AsyncStorage.setItem(CACHE_PREFIX + courseId, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to cache course", e);
  }
}

export async function loadCourse(courseId: string) {
  
  if (courseId === "python" || courseId === "python_linear_mastery") {
    await saveCachedCourse(courseId, localPython); 
    return localPython; // Always return fresh JSON
  }

  // Normal caching for others
  const cached = await getCachedCourse(courseId);
  if (cached) return cached;

  if (courseId === "html" || courseId === "html_linear_mastery") {
    await saveCachedCourse(courseId, localHtml);
    return localHtml;
  }
  if (courseId === "css" || courseId === "css_linear_mastery") {
    await saveCachedCourse(courseId, localCss);
    return localCss;
  }
  if (courseId === "javascript" || courseId === "javascript_linear_mastery") {
    await saveCachedCourse(courseId, localJavascript);
    return localJavascript;
  }

  return null;
}