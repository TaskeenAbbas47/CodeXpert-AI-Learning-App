import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StyleSheet } from "react-native";
import firestore from "@react-native-firebase/firestore";

// --- THE FULL CORRECT DATA (All 25 Lessons + Images) ---
const FULL_PYTHON_DATA = {
  id: "python_linear_mastery",
  title: "Python: Zero to Machine Learning",
  sections: [
    {
      id: "main_track",
      title: "Part 1: Python Foundation",
      lessons: [
        { id: "1", title: "1. Your First Code", content: [{ stepTitle: "The Output Screen", stepDetail: "The Console is the black box...", stepImage: "python_console_visual" }, { stepTitle: "The Print Command", stepDetail: "Type `print('message')`..." }] },
        { id: "2", title: "2. Saving Data", content: [{ stepTitle: "The Box Analogy", stepDetail: "Variables are like boxes...", stepImage: "python_variables_visual" }] },
        { id: "3", title: "3. Types", content: [{ stepTitle: "Text vs Math", stepDetail: "Strings use quotes...", stepImage: "python_variables_visual" }] }, // Reusing variable visual for types context
        { id: "4", title: "4. Input", content: [{ stepTitle: "Asking Questions", stepDetail: "`input()` pauses the program...", stepImage: "python_console_visual" }] },
        { id: "5", title: "5. Logic", content: [{ stepTitle: "The Switch", stepDetail: "True or False...", stepImage: "python_logic_visual" }] },
        { id: "6", title: "6. If/Else", content: [{ stepTitle: "The Fork", stepDetail: "Checks a condition...", stepImage: "python_logic_visual" }] },
        { id: "7", title: "7. Lists", content: [{ stepTitle: "The Shelf", stepDetail: "Lists use []...", stepImage: "python_lists_visual" }] },
        { id: "8", title: "8. For Loops", content: [{ stepTitle: "The Robot Arm", stepDetail: "Goes through a list...", stepImage: "python_loops_visual" }] },
        { id: "9", title: "9. While Loops", content: [{ stepTitle: "Continuous Check", stepDetail: "Runs while true...", stepImage: "python_loops_visual" }] },
        { id: "10", title: "10. Dictionaries", content: [{ stepTitle: "Key-Value", stepDetail: "Use {} and labels...", stepImage: "python_lists_visual" }] }, // Reusing lists visual style logic
        { id: "11", title: "11. Functions", content: [{ stepTitle: "Defining", stepDetail: "Use `def`...", stepImage: "python_functions_visual" }] },
        { id: "12", title: "12. Return", content: [{ stepTitle: "Sending Back", stepDetail: "Return gives data back...", stepImage: "python_functions_visual" }] },
        { id: "13", title: "13. Errors", content: [{ stepTitle: "Safety Net", stepDetail: "Wrap risky code in try/except...", stepImage: "python_error_visual" }] },
        { id: "14", title: "14. Classes", content: [{ stepTitle: "The Blueprint", stepDetail: "Class is a design...", stepImage: "python_classes_visual" }] },
        { id: "15", title: "15. Imports", content: [{ stepTitle: "Superpowers", stepDetail: "Import libraries...", stepImage: "python_imports_visual" }] },
        { id: "16", title: "16. Random", content: [{ stepTitle: "Rolling Dice", stepDetail: "Generate random numbers...", stepImage: "python_imports_visual" }] },
        { id: "17", title: "17. List Comp", content: [{ stepTitle: "One-Liners", stepDetail: "Compact loops...", stepImage: "python_lists_visual" }] },
        { id: "18", title: "18. Files", content: [{ stepTitle: "Opening Files", stepDetail: "Read and write data...", stepImage: "python_console_visual" }] },
        { id: "19", title: "19. F-Strings", content: [{ stepTitle: "The Magic F", stepDetail: "Insert variables...", stepImage: "python_variables_visual" }] },
        { id: "20", title: "20. Project: ATM", content: [{ stepTitle: "The Goal", stepDetail: "Build a banking system...", stepImage: "python_logic_visual" }] },
      ]
    },
    {
      id: "ml_track",
      title: "Part 2: Intro to Machine Learning",
      lessons: [
        { id: "21", title: "21. What is ML?", content: [{ stepTitle: "Traditional vs ML", stepDetail: "Data driven rules...", stepImage: "ml_concept_visual" }] },
        { id: "22", title: "22. NumPy", content: [{ stepTitle: "Super Lists", stepDetail: "Fast math arrays...", stepImage: "ml_numpy_visual" }] },
        { id: "23", title: "23. Pandas", content: [{ stepTitle: "The DataFrame", stepDetail: "Excel for Python...", stepImage: "ml_pandas_visual" }] },
        { id: "24", title: "24. Plotting", content: [{ stepTitle: "Visualizing", stepDetail: "See patterns...", stepImage: "ml_plot_visual" }] },
        { id: "25", title: "25. Prediction", content: [{ stepTitle: "Training", stepDetail: "Fit a line...", stepImage: "ml_linear_visual" }] },
      ]
    }
  ]
};

export default function PythonRecovery() {
  const [status, setStatus] = useState("Ready to Fix");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const runRecovery = async () => {
    setLoading(true);
    setLogs([]);
    setStatus("Starting...");

    try {
      const courseRef = firestore().collection("courses").doc(FULL_PYTHON_DATA.id);
      
      // 1. Update Main Course
      await courseRef.set({ title: FULL_PYTHON_DATA.title }, { merge: true });
      setLogs(prev => [...prev, "✅ Course Title Updated"]);

      for (const section of FULL_PYTHON_DATA.sections) {
        const sectionRef = courseRef.collection("sections").doc(section.id);
        await sectionRef.set({ title: section.title }, { merge: true });
        setLogs(prev => [...prev, `📂 Processing Section: ${section.title}`]);

        for (const lesson of section.lessons) {
          // 2. FORCE UPDATE LESSON CONTENT
          await sectionRef.collection("lessons").doc(lesson.id).set({
            title: lesson.title,
            content: lesson.content, // This contains the IMAGES
          }, { merge: true });
          
          setLogs(prev => [...prev, `   - Fixed Lesson: ${lesson.id}`]);
        }
      }

      setStatus("COMPLETE! ✅");
      Alert.alert("Success", "All Python visuals have been restored. Restart the app.");

    } catch (error) {
      console.error(error);
      setStatus("FAILED ❌");
      Alert.alert("Error", "Something went wrong. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Python Course Fixer</Text>
      <Text style={styles.subtitle}>This will overwrite database content with correct visuals.</Text>

      <TouchableOpacity onPress={runRecovery} disabled={loading} style={styles.btn}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>START RECOVERY</Text>}
      </TouchableOpacity>

      <Text style={styles.status}>Status: {status}</Text>

      <ScrollView style={styles.logs}>
        {logs.map((log, i) => (
          <Text key={i} style={styles.logText}>{log}</Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, backgroundColor: '#111', justifyContent: 'center' },
  title: { fontSize: 24, color: '#FFD43B', fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#aaa', textAlign: 'center', marginBottom: 30 },
  btn: { backgroundColor: '#306998', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  status: { color: '#fff', textAlign: 'center', marginTop: 20, fontSize: 18, fontWeight: 'bold' },
  logs: { marginTop: 20, backgroundColor: '#222', padding: 10, borderRadius: 5, height: 300 },
  logText: { color: '#0f0', fontFamily: 'monospace', fontSize: 12, marginBottom: 4 }
});