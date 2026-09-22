 /* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
  Modal,
  KeyboardAvoidingView,
  FlatList,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native"; 
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import Markdown from "react-native-markdown-display";
import LottieView from "lottie-react-native";
import { useThemeStyles } from "../hooks/useThemeStyles";

// Enable animations for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- 1. ASSET MAPPING ---
const lessonAssetMap: Record<string, any> = {
    "python_console_visual": require("../Assets/lessons/python_console.png"),
    "python_variables_visual": require("../Assets/lessons/python_variables.png"),
    "python_logic_visual": require("../Assets/lessons/python_logic.png"),
    "python_lists_visual": require("../Assets/lessons/python_lists.png"),
    "python_loops_visual": require("../Assets/lessons/python_loops.png"),
    "python_functions_visual": require("../Assets/lessons/python_functions.png"),
    "python_classes_visual": require("../Assets/lessons/python_classes.png"),
    "python_imports_visual": require("../Assets/lessons/python_imports.png"),
    "python_error_visual": require("../Assets/lessons/python_error.png"),
    "ml_concept_visual": require("../Assets/lessons/ml_concept.png"),
    "ml_numpy_visual": require("../Assets/lessons/ml_numpy.png"),
    "ml_pandas_visual": require("../Assets/lessons/ml_pandas.png"),
    "ml_plot_visual": require("../Assets/lessons/ml_plot.png"),
    "ml_linear_visual": require("../Assets/lessons/ml_linear.png"),
    "html_skeleton_visual": require("../Assets/lessons/html_skeleton.png"),
    "heading_hierarchy_visual": require("../Assets/lessons/heading_hierarchy.png"),
    "img_tag_visual": require("../Assets/lessons/img_tag.png"),
    "div_vs_span_visual": require("../Assets/lessons/div_vs_span.png"),
    "input_types_visual": require("../Assets/lessons/input_types.png"),
    "table_structure_visual": require("../Assets/lessons/table_structure.png"),
    "semantic_layout_visual": require("../Assets/lessons/semantic_layout.png"),
    "css_syntax_visual": require("../Assets/lessons/css_syntax.png"),
    "css_selectors_visual": require("../Assets/lessons/css_selectors.png"),
    "css_colors_visual": require("../Assets/lessons/css_colors.png"),
    "css_box_model_visual": require("../Assets/lessons/css_box_model.png"),
    "css_flexbox_visual": require("../Assets/lessons/css_flexbox.png"),
    "css_grid_visual": require("../Assets/lessons/css_grid.png"),
    "css_responsive_visual": require("../Assets/lessons/css_responsive.png"),
    "js_variables_visual": require("../Assets/lessons/js_variables.png"),
    "js_function_visual": require("../Assets/lessons/js_function.png"),
    "js_logic_visual": require("../Assets/lessons/js_logic.png"),
    "js_loop_visual": require("../Assets/lessons/js_loop.png"),
    "js_dom_tree_visual": require("../Assets/lessons/js_dom_tree.png"),
    "js_events_visual": require("../Assets/lessons/js_events.png"),
    "js_async_visual": require("../Assets/lessons/js_async.png"),
};

type Phase = 'reading' | 'quiz' | 'console' | 'complete';
type FeedbackType = 'success' | 'error' | 'info' | 'complete';

interface FeedbackState {
    visible: boolean;
    type: FeedbackType;
    title: string;
    message: string;
    buttonText: string;
    autoAction?: boolean; 
    onAction: () => void;
}

type Message = {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp?: number;
  isThinking?: boolean; 
};

type LessonViewProps = {
  courseId: string;
  sectionId: string;
  lessonId: string;
  isFinalLesson?: boolean; 
  lessonContent: {
    id?: string;
    course?: string;
    section?: string;
    title?: string;
    overview?: string;
    content?: { stepTitle: string; stepDetail: string; stepImage?: string }[];
    consoleExercise?: { prompt: string; solution: string; successMessage: string };
    quiz?: { question: string; options: string[]; correctAnswer: string; hint: string };
  };
  onBack?: () => void;
  onComplete?: () => void;
};

const API_URL = "http://127.0.0.1:8000/ask"; 
const CODE_API_URL = "http://127.0.0.1:8000/api/submit-code"; 

const PRE_SAVED_RESPONSES: Record<string, string> = {
  "hi": "Hello! I am XpertAi. How can I help you with your code today?",
  "hello": "Hi there! Ready to solve some coding problems?",
  "who are you": "I am XpertAi, your personal AI coding assistant.",
  "help": "I can help you debug code, explain concepts, or write scripts. Just ask!",
  "thanks": "You're welcome! Happy coding. 🚀",
};

const ThinkingBubble = ({ styles, colors }: { styles: any, colors: any }) => {
  const [loadingText, setLoadingText] = useState("Analyzing...");
  useEffect(() => {
    const texts = ["Analyzing...", "Searching...", "Thinking...", "Writing..."];
    let i = 0;
    const interval = setInterval(() => {
      setLoadingText(texts[i]);
      i = (i + 1) % texts.length;
    }, 800); 
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.messageBubble, styles.aiBubble, styles.thinkingBubbleLayout]}>
      <LottieView source={require("../Assets/think.json")} autoPlay loop speed={1.75} style={{ width: 40, height: 40}} />
      <Text style={[styles.thinkingText, { color: colors.textSecondary }]}>{loadingText}</Text>
    </View>
  );
};

const getMarkdownStyles = (colors: any) => ({
  body: { color: colors.textPrimary, fontSize: 14, fontFamily: "Poppins-Regular" },
  strong: { fontFamily: "Poppins-SemiBold", color: colors.textPrimary },
  code_inline: { backgroundColor: colors.codeBg || '#222', borderRadius: 4, padding: 2, color: '#008000', fontFamily: "monospace" },
  code_block: { backgroundColor: colors.codeBg || '#222', borderRadius: 8, padding: 10, color: '#008000', fontFamily: "monospace" },
  fence: { backgroundColor: colors.codeBg || '#222', borderRadius: 8, padding: 10, color: '#008000', fontFamily: "monospace" },
});

const AIChatModal = ({ visible, onClose, colors, styles }: any) => {
    const markdownStyles = useMemo(() => getMarkdownStyles(colors), [colors]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false); 
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    const flatListRef = useRef<FlatList<any> | null>(null);
    const user = auth().currentUser;
    const chatRef = useMemo(() => user ? firestore().collection("users").doc(user.uid).collection("chats") : null, [user]);

    useEffect(() => {
        if (!chatRef || !visible) return;
        const q = chatRef.orderBy("timestamp", "asc");
        const unsubscribe = q.onSnapshot(snapshot => {
            const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
            if (isTyping) {
                setMessages([...loaded, { id: 'thinking', text: '', sender: 'ai', isThinking: true }]);
            } else {
                setMessages(loaded);
            }
        });
        return () => unsubscribe();
    }, [chatRef, visible, isTyping]);

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || isTyping || !chatRef || !user) return; 
        
        const userMsg: Message = { id: Date.now().toString(), text: trimmed, sender: 'user', timestamp: Date.now() };
        setInput("");
        await chatRef.doc(userMsg.id).set(userMsg);

        if (PRE_SAVED_RESPONSES[trimmed.toLowerCase()]) {
            await chatRef.doc(Date.now() + 'ai').set({
                id: Date.now() + 'ai', text: PRE_SAVED_RESPONSES[trimmed.toLowerCase()], sender: 'ai', timestamp: Date.now()
            });
            return;
        }

        setIsTyping(true);
        try {
            const response = await fetch(API_URL, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: trimmed, user_id: user.uid }),
            });
            const data = await response.json();
            await chatRef.doc(Date.now() + 'ai').set({
                id: Date.now() + 'ai', text: data.answer || "Error", sender: 'ai', timestamp: Date.now()
            });
        } catch (e) {
            await chatRef.doc(Date.now() + 'err').set({
                id: Date.now() + 'err', text: "Connection Error.", sender: 'ai', timestamp: Date.now()
            });
        } finally {
            setIsTyping(false);
        }
    };

    const handleDelete = async () => {
        if (!chatRef) return;
        const batch = firestore().batch();
        selectedIds.forEach(id => batch.delete(chatRef.doc(id)));
        await batch.commit();
        setSelectedIds(new Set());
        setSelectionMode(false);
        setShowDeleteModal(false);
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
            if (newSet.size === 0) setSelectionMode(false);
            return newSet;
        });
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <KeyboardAvoidingView style={[styles.flexOne, { backgroundColor: colors.background }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <SafeAreaView style={styles.flexOne}>
                    <View style={styles.chatContainer}>
                        <View style={[styles.chatHeader, { borderBottomColor: colors.border }]}>
                            {selectionMode ? (
                                <View style={styles.selectionHeaderRow}>
                                    <TouchableOpacity onPress={() => { setSelectionMode(false); setSelectedIds(new Set()); }}>
                                        <Image source={require("../Assets/close.png")} style={styles.icon} />
                                    </TouchableOpacity>
                                    <Text style={styles.headerTitle}>{selectedIds.size} Selected</Text>
                                    <TouchableOpacity onPress={() => setShowDeleteModal(true)}>
                                        <Image source={require("../Assets/delete.png")} style={[styles.icon, styles.iconRed]} />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <>
                                    <Text style={styles.chatTitle}>XpertAI</Text>
                                    <TouchableOpacity onPress={onClose} style={styles.closeChatBtn}>
                                        <Image source={require("../Assets/close.png")} style={styles.icon} />
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>

                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            keyExtractor={item => item.id}
                            style={styles.flexOne}
                            contentContainerStyle={styles.chatContent}
                            keyboardShouldPersistTaps="handled"
                            onContentSizeChange={() => {
                                if (messages.length > 0) flatListRef.current?.scrollToEnd({ animated: true });
                            }}
                            renderItem={({ item }) => {
                                if (item.isThinking) return <ThinkingBubble styles={styles} colors={colors} />;
                                const isSelected = selectedIds.has(item.id);
                                return (
                                    <TouchableOpacity 
                                        activeOpacity={0.9} 
                                        onLongPress={() => { setSelectionMode(true); toggleSelection(item.id); }}
                                        onPress={() => selectionMode && toggleSelection(item.id)}
                                        style={[styles.messageRow, isSelected && styles.messageSelectedOpacity]}
                                    >
                                        {selectionMode && (
                                            <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                                                {isSelected && <Image source={require("../Assets/check.png")} style={styles.radioCheckIcon} />}
                                            </View>
                                        )}
                                        <View style={[
                                            styles.messageBubble, 
                                            item.sender === 'user' ? styles.userBubble : styles.aiBubble,
                                            item.sender === 'ai' && { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }
                                        ]}>
                                            {item.sender === 'ai' ? (
                                                <Markdown style={markdownStyles}>{item.text}</Markdown>
                                            ) : (
                                                <Text style={styles.userText}>{item.text}</Text>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                );
                            }}
                        />

                        {!selectionMode && (
                            <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <TextInput 
                                    style={[styles.input, { color: colors.textPrimary }]}
                                    placeholder="Ask about this lesson..."
                                    placeholderTextColor={colors.textSecondary}
                                    value={input}
                                    onChangeText={setInput}
                                    onSubmitEditing={handleSend}
                                />
                                <TouchableOpacity onPress={handleSend} style={[styles.sendButton, { backgroundColor: colors.primary }]}>
                                    <Image source={require("../Assets/send.png")} style={styles.sendIcon} />
                                </TouchableOpacity>
                            </View>
                        )}

                        <Modal visible={showDeleteModal} transparent animationType="fade">
                            <View style={styles.modalOverlay}>
                                <View style={[styles.modalCard, {backgroundColor: colors.card}]}>
                                    <Text style={[styles.modalTitle, {color: colors.textPrimary}]}>Delete Messages?</Text>
                                    <View style={styles.deleteModalButtons}>
                                        <TouchableOpacity onPress={() => setShowDeleteModal(false)} style={[styles.modalButton, {backgroundColor: colors.buttonMuted}]}><Text style={styles.modalButtonText}>Cancel</Text></TouchableOpacity>
                                        <TouchableOpacity onPress={handleDelete} style={[styles.modalButton, {backgroundColor: '#FF4545'}]}><Text style={styles.modalButtonText}>Delete</Text></TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                    </View>
                </SafeAreaView>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default function LessonView({
  courseId: _courseId,
  sectionId: _sectionId,
  lessonId,
  lessonContent,
  isFinalLesson = false, 
  onBack,
  onComplete,
}: LessonViewProps) {
  const { styles, colors } = useThemeStyles(styleGenerator);
  const navigation = useNavigation<any>(); 

  const [activePhase, setActivePhase] = useState<Phase>('reading');
  const [stepIndex, setStepIndex] = useState(0); 
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [userCode, setUserCode] = useState("");
  const [isConsoleRunning, setIsConsoleRunning] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState("");
  const [isLoved, setIsLoved] = useState(false);
  const [savingLove, setSavingLove] = useState(false);
  
  const [feedback, setFeedback] = useState<FeedbackState>({ visible: false, type: 'success', title: '', message: '', buttonText: '', autoAction: false, onAction: () => {}, });
  const [aiModalVisible, setAiModalVisible] = useState(false); 
  const [unlockedAchievement, setUnlockedAchievement] = useState<any>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false); 

  const user = auth().currentUser;
  const totalContentSteps = lessonContent?.content?.length || 0;
  const currentContent = lessonContent?.content?.[stepIndex];

  const safeCourse = _courseId || lessonContent?.course || "default_course";
  const safeSection = _sectionId || lessonContent?.section || "default_section";
  const fallbackTitle = lessonContent?.title ? lessonContent.title.replace(/[^a-zA-Z0-9]/g, '_') : "default_lesson";
  const safeLesson = lessonId || lessonContent?.id || fallbackTitle;
  const uniqueDocId = `${safeCourse}_${safeSection}_${safeLesson}`.toLowerCase();

  useEffect(() => {
    setStepIndex(0); 
    setUserCode(""); 
    setConsoleOutput(""); 
    setSelectedQuizOption(null); 
    setShowHint(false); 
    setActivePhase('reading'); 
    setIsLoved(false); 
    setFeedback({ visible: false, type: 'success', title: '', message: '', buttonText: '', autoAction: false, onAction: () => {} }); 
    setUnlockedAchievement(null);
    setShowCertificateModal(false);

    let mounted = true;
    (async () => {
      if (!user) return;
      try {
        const doc = await firestore().collection("users").doc(user.uid).collection("favorites").doc(uniqueDocId).get();
        if (mounted && doc.exists()) setIsLoved(true);
      } catch (e) {}
    })();
    return () => { mounted = false; };
  }, [uniqueDocId, user]); 

  const showModal = (type: FeedbackType, title: string, message: string, btnText: string, autoAction: boolean, action: () => void) => {
      setFeedback({ visible: true, type, title, message, buttonText: btnText, autoAction, onAction: () => { setFeedback(prev => ({ ...prev, visible: false })); action(); } });
  };

  const determineNextPhase = () => {
    if (activePhase === 'reading') {
        if (lessonContent.quiz) return 'quiz';
        if (lessonContent.consoleExercise) return 'console';
        return 'complete';
    } 
    if (activePhase === 'quiz') {
        if (lessonContent.consoleExercise) return 'console';
        return 'complete';
    } 
    return 'complete';
  };

  const handlePhaseTransition = () => {
    const next = determineNextPhase();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (next === 'complete') handleMarkComplete();
    else setActivePhase(next as Phase);
  };

  const handleReadingNext = () => {
    if (stepIndex < totalContentSteps - 1) { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setStepIndex(s => s + 1); } 
    else handlePhaseTransition();
  };

  const handleReadingPrev = () => {
    if (stepIndex > 0) { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setStepIndex(s => s - 1); }
  };

  const handleQuizSelect = (option: string) => {
    setSelectedQuizOption(option);
    if (option === lessonContent.quiz?.correctAnswer) {
        const nextPhase = determineNextPhase();
        if (nextPhase === 'complete') handleMarkComplete(); 
        else showModal('success', 'Correct!', 'That is the right answer.', 'Next', true, () => handlePhaseTransition());
    } else {
        showModal('error', 'Not Quite...', 'Try again or check the hint.', 'Try Again', false, () => {});
    }
  };

  const handleRunCode = async () => {
    if (!userCode.trim()) { 
        showModal('error', 'Empty Input', 'Please type some code first.', 'Okay', false, () => {}); 
        return; 
    }
    
    setIsConsoleRunning(true); 
    setConsoleOutput("Evaluating code...");

    try {
        const response = await fetch(CODE_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                code: userCode,
                language: safeCourse.toLowerCase(),
                problem: lessonContent.consoleExercise?.prompt || "Solve the exercise."
            }),
        });

        const data = await response.json();

        if (data.is_correct) {
            const successMsg = lessonContent.consoleExercise?.successMessage || "Code ran successfully.";
            setConsoleOutput(`✅ PASS\n${data.console_output}`);
            
            const nextPhase = determineNextPhase();
            if (nextPhase === 'complete') {
                handleMarkComplete();
            } else {
                showModal('success', 'Great Job!', successMsg, 'Continue', true, () => handlePhaseTransition());
            }
        } else {
            setConsoleOutput(`❌ [${data.error_type}]\n${data.console_output}`);
        }
    } catch (error) {
        setConsoleOutput(`❌ Network Error: Could not connect to the compiler.`);
    } finally {
        setIsConsoleRunning(false);
    }
  };

  const handleMarkComplete = async () => {
      if (!user) {
          showModal('complete', 'Lesson Mastered!', 'You have successfully completed this lesson.', 'Continue', true, () => { onBack && onBack(); });
          return;
      }

      const lessonRef = firestore().collection("users").doc(user.uid).collection("completedLessons").doc(uniqueDocId);
      const userRef = firestore().collection("users").doc(user.uid);

      try {
          const lessonDoc = await lessonRef.get();
          const alreadyMastered = lessonDoc.exists() && lessonDoc.data()?.pointsAwarded;
          const formattedCourseName = safeCourse.charAt(0).toUpperCase() + safeCourse.slice(1);

          // --------------------------------------------------------
          // --- ROBUST NAME EXTRACTION WITH DEBUG LOGS ---
          const userProfileDoc = await userRef.get();
          let finalUserName = "CodeXpert Student";

          console.log("--- CERTIFICATE GENERATION DEBUG ---");
          console.log("1. Current User UID:", user.uid);
          console.log("2. Does user profile exist in DB?", userProfileDoc.exists);

          if (userProfileDoc.exists()) {
              const userData = userProfileDoc.data() || {};
              console.log("3. Fetched Data from Firestore:", userData);

              // Prioritizing the exact fields from your screenshot
              finalUserName = 
                userData.name || 
                (userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : null) ||
                userData.fullName || 
                userData.username || 
                user.displayName || 
                (user.email ? user.email.split('@')[0] : "CodeXpert Student");
          } else {
              finalUserName = user.displayName || (user.email ? user.email.split('@')[0] : "CodeXpert Student");
          }
          
          console.log("4. Final Name applied to Certificate:", finalUserName);
          console.log("------------------------------------");
          // --------------------------------------------------------

          if (isFinalLesson) {
              const batch = firestore().batch();
              
              if (!alreadyMastered) {
                  batch.set(userRef, { totalPoints: firestore.FieldValue.increment(54) }, { merge: true });
                  batch.set(lessonRef, { completedAt: firestore.FieldValue.serverTimestamp(), pointsAwarded: true }, { merge: true });
              }

              const certRef = firestore().collection("users").doc(user.uid).collection("certificates").doc(`${safeCourse}_${safeSection}`.toLowerCase());
              
              // Updates certificate with the fresh name
              batch.set(certRef, {
                  courseId: safeCourse,
                  sectionId: safeSection,
                  courseName: `${formattedCourseName} Completion`,
                  issuedAt: firestore.FieldValue.serverTimestamp(),
                  certificateId: `CX-${Math.floor(100000 + Math.random() * 900000)}`, 
                  userName: finalUserName, 
              });

              const notificationRef = firestore().collection("users").doc(user.uid).collection("notifications").doc();
              batch.set(notificationRef, {
                  title: 'Certificate Earned! 🎓',
                  message: `Congratulations! You have officially completed the ${formattedCourseName} module and earned a certificate.`,
                  createdAt: firestore.FieldValue.serverTimestamp(),
                  isRead: false,
                  type: 'certificate'
              });

              await batch.commit();
              setShowCertificateModal(true);
              return;
          }

          if (!alreadyMastered) {
              const batch = firestore().batch();
              batch.set(lessonRef, { completedAt: firestore.FieldValue.serverTimestamp(), pointsAwarded: true }, { merge: true });
              batch.set(userRef, { totalPoints: firestore.FieldValue.increment(4) }, { merge: true });
              await batch.commit();

              showModal('success', 'Lesson Mastered!', '+4 XP Earned!', 'Continue', true, () => { onComplete && onComplete(); });
          } else {
              showModal('complete', 'Lesson Reviewed!', 'You already mastered this lesson.', 'Continue', true, () => { 
                  onComplete ? onComplete() : (onBack && onBack());
              });
          }
      } catch (error) {
          console.error("Error:", error);
          onComplete && onComplete();
      }
  };

  const handleLove = async () => { 
      if (!user) return; setSavingLove(true);
      try {
        const ref = firestore().collection("users").doc(user.uid).collection("favorites").doc(uniqueDocId);
        if (isLoved) { await ref.delete(); setIsLoved(false); } 
        else { await ref.set({ courseId: safeCourse, sectionId: safeSection, lessonId: safeLesson, title: lessonContent?.title, timestamp: Date.now() }); setIsLoved(true); }
      } catch (e) { console.warn(e); } finally { setSavingLove(false); }
  };

  return (
    <View style={styles.container}>
      
      <Modal transparent animationType="fade" visible={showCertificateModal} onRequestClose={() => setShowCertificateModal(false)}>
        <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, styles.certModalBorder]}>
                <LottieView source={require("../Assets/Certificate.json")} autoPlay loop style={{ width: 150, height: 150, marginTop: -30 }} />
                <Text style={styles.certTitle}>Congratulations!</Text>
                <Text style={styles.certSubtitle}>You have officially mastered this course.</Text>
                <Text style={styles.certDetailText}>Your Certificate of Appreciation has been added to your profile.</Text>
                <TouchableOpacity 
                    style={styles.certBtn} 
                    onPress={() => {
                        setShowCertificateModal(false);
                        if (user) onComplete && onComplete();
                        else onBack && onBack();
                        navigation.navigate("Certificates");
                    }}
                >
                    <Text style={styles.certBtnText}>Claim Certificate</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

      <Modal transparent animationType="fade" visible={!!unlockedAchievement} onRequestClose={() => setUnlockedAchievement(null)}>
        <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, styles.achievementModalBorder]}>
                <View style={[styles.modalIconContainer, styles.achievementIconBg]}>
                    <Image source={unlockedAchievement?.icon || require("../Assets/check.png")} style={[styles.modalIcon, styles.achievementIcon]} />
                </View>
                <Text style={[styles.modalTitle, styles.achievementTitle]}>Achievement Unlocked!</Text>
                <Text style={[styles.modalMessage, styles.achievementSubtitle]}>
                    {unlockedAchievement?.title}
                </Text>
                <Text style={[styles.modalMessage, styles.achievementPoints]}>
                    You reached {unlockedAchievement?.points} Total Points!
                </Text>
                <TouchableOpacity 
                    style={[styles.modalButton, styles.achievementBtnBg]} 
                    onPress={() => {
                        setUnlockedAchievement(null);
                        if (user) onComplete && onComplete();
                        else onBack && onBack();
                    }}
                >
                    <Text style={[styles.modalButtonText, styles.achievementBtnText]}>Claim Reward</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

      <Modal transparent animationType="fade" visible={feedback.visible} onRequestClose={()=>{}}>
        <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { borderColor: colors.border }]}> 
                <View style={[styles.modalIconContainer, { backgroundColor: (feedback.type==='error'?'#FF4545':colors.success) + '20' }]}>
                         <Image source={feedback.type === 'error' ? require("../Assets/close.png") : require("../Assets/check.png")} 
                        style={[styles.modalIcon, { tintColor: feedback.type==='error'?'#FF4545':colors.success }]} />
                </View>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{feedback.title}</Text>
                <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>{feedback.message}</Text>
                 <TouchableOpacity style={[styles.modalButton, { backgroundColor: feedback.type==='error'?'#FF4545':colors.primary }]} onPress={feedback.onAction}>
                    <Text style={styles.modalButtonText}>{feedback.buttonText} {feedback.autoAction && "..."}</Text>
                 </TouchableOpacity>
            </View>
        </View>
      </Modal>

      <AIChatModal visible={aiModalVisible} onClose={() => setAiModalVisible(false)} colors={colors} styles={styles} />

      <View style={styles.topBar}>
        <View style={styles.topLeftGroup}>
            <TouchableOpacity onPress={onBack}>
                <Image source={require("../Assets/close.png")} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAiModalVisible(true)} style={styles.aiButton}>
                <Image source={require("../Assets/assist1.png")} style={styles.aiIcon} />
                <Text style={styles.aiText}>XpertAI</Text>
            </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleLove} disabled={savingLove}>
          <Image source={require("../Assets/heart.png")} style={[styles.icon, isLoved && styles.loved]} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.lessonTitle}>{lessonContent.title}</Text>

        {activePhase === 'reading' && (
          <View style={styles.card}>
            <View style={styles.stepHeader}><Text style={styles.stepCounter}>Step {stepIndex + 1} of {totalContentSteps}</Text></View>
            <Text style={styles.stepTitle}>{currentContent?.stepTitle}</Text>
            <Text style={styles.stepDetail}>{currentContent?.stepDetail}</Text>
            {currentContent?.stepImage && lessonAssetMap[currentContent.stepImage] && (<Image source={lessonAssetMap[currentContent.stepImage]} style={styles.stepImage} resizeMode="contain" />)}
            <View style={styles.navRow}>
              <TouchableOpacity onPress={handleReadingPrev} disabled={stepIndex === 0} style={[styles.navBtn, stepIndex === 0 && styles.navBtnDisabled]}><Text style={styles.navText}>Back</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleReadingNext} style={styles.primaryBtnSmall}>
                <Text style={styles.primaryBtnText}>{stepIndex === totalContentSteps - 1 ? (lessonContent.quiz || lessonContent.consoleExercise ? "Start Practice" : "Finish") : "Next"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activePhase === 'quiz' && lessonContent.quiz && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>🧠 Knowledge Check</Text>
            <View style={styles.card}>
              <Text style={styles.quizQuestion}>{lessonContent.quiz.question}</Text>
              {lessonContent.quiz.options.map((option, index) => {
                const isSelected = selectedQuizOption === option;
                return (
                  <TouchableOpacity key={index} style={[styles.quizOption, isSelected && styles.quizOptionSelected]} onPress={() => handleQuizSelect(option)}>
                    <Text style={[styles.quizOptionText, isSelected && {color: colors.primary}]}>{option}</Text>
                    {isSelected ? <View style={styles.radioFilled} /> : <View style={styles.radioEmpty} />}
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity onPress={() => setShowHint(!showHint)} style={styles.hintBtn}><Text style={styles.hintBtnText}>{showHint ? "Hide Hint" : "Need a Hint?"}</Text></TouchableOpacity>
              {showHint && (<View style={styles.hintBox}><Text style={styles.hintText}>💡 {lessonContent.quiz.hint}</Text></View>)}
            </View>
          </View>
        )}

        {activePhase === 'console' && lessonContent.consoleExercise && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>💻 Console Exercise</Text>
            <View style={styles.consoleCard}>
              <Text style={styles.promptText}>{lessonContent.consoleExercise.prompt}</Text>
              <View style={styles.codeWrapper}>
                <TextInput style={styles.codeInput} multiline placeholder="Type code here..." placeholderTextColor="#666" value={userCode} onChangeText={setUserCode} autoCapitalize="none" autoCorrect={false} />
              </View>
              {consoleOutput ? (<View style={styles.outputBox}><Text style={styles.outputText}>{consoleOutput}</Text></View>) : null}
              <TouchableOpacity style={[styles.runBtn, isConsoleRunning && styles.disabledBtn]} onPress={handleRunCode} disabled={isConsoleRunning}>
                {isConsoleRunning ? <ActivityIndicator color="#fff" /> : <Text style={styles.runBtnText}>Run Code ▶</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styleGenerator = (colors: any) => StyleSheet.create({
  flexOne: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.background },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: 'center', padding: 20 },
  topLeftGroup: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  icon: { width: 24, height: 24, tintColor: colors.icon },
  loved: { tintColor: "#FF4545" },
  
  aiButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: colors.primary + '40' },
  aiIcon: { width: 18, height: 18, marginRight: 6 },
  aiText: { color: colors.primary, fontSize: 13, fontFamily: "Poppins-SemiBold" },

  scroll: { padding: 20 },
  lessonTitle: { color: colors.primary, fontSize: 22, fontFamily: "Poppins-Bold", marginBottom: 20 },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border || "transparent" },
  stepHeader: { marginBottom: 10 },
  stepCounter: { color: colors.primary, fontSize: 12, fontFamily: "Poppins-Bold" },
  stepTitle: { color: colors.textPrimary, fontSize: 18, fontFamily: "Poppins-SemiBold", marginBottom: 8 },
  stepDetail: { color: colors.textSecondary, fontSize: 15, lineHeight: 24, fontFamily: "Poppins-Regular" },
  stepImage: { width: '100%', height: 150, marginTop: 15, borderRadius: 8, backgroundColor: colors.background },
  navRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 25, alignItems: 'center' },
  navBtn: { padding: 10, borderRadius: 8, backgroundColor: colors.buttonMuted },
  navBtnDisabled: { opacity: 0.3 },
  navText: { color: colors.textPrimary, fontFamily: "Poppins-Medium" },
  primaryBtnSmall: { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  primaryBtnText: { color: "#FFF", fontFamily: "Poppins-SemiBold" },
  sectionContainer: { marginTop: 10 },
  sectionHeader: { color: colors.textPrimary, fontSize: 18, fontFamily: "Poppins-Bold", marginBottom: 15 },
  quizQuestion: { color: colors.textPrimary, fontSize: 16, fontFamily: "Poppins-Medium", marginBottom: 15 },
  quizOption: { backgroundColor: colors.background, padding: 16, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  quizOptionSelected: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  quizOptionText: { color: colors.textPrimary, fontFamily: "Poppins-Regular", fontSize: 14 },
  radioEmpty: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.textSecondary },
  radioFilled: { width: 20, height: 20, borderRadius: 10, borderWidth: 6, borderColor: colors.primary },
  hintBtn: { marginTop: 10 },
  hintBtnText: { color: colors.textSecondary, textDecorationLine: 'underline' },
  hintBox: { marginTop: 10, padding: 12, backgroundColor: colors.background, borderRadius: 8 },
  hintText: { color: colors.textPrimary, fontStyle: 'italic' },
  consoleCard: { backgroundColor: "#1E1E1E", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "#333" },
  promptText: { color: "#E0E0E0", fontSize: 14, marginBottom: 15, fontFamily: "Poppins-Medium" },
  codeWrapper: { backgroundColor: "#2A2A2A", borderRadius: 10, padding: 10, borderWidth: 1, borderColor: "#444", marginBottom: 15 },
  codeInput: { color: "#00FF88", fontSize: 15, fontFamily: "monospace", minHeight: 80, textAlignVertical: 'top' },
  runBtn: { backgroundColor: colors.success, padding: 14, borderRadius: 10, alignItems: "center" },
  runBtnText: { color: "#FFF", fontFamily: "Poppins-Bold", fontSize: 16 },
  disabledBtn: { opacity: 0.7 },
  outputBox: { marginBottom: 15, padding: 10, backgroundColor: "#000", borderRadius: 8, borderWidth:1, borderColor: "#333" },
  outputText: { color: "#00FF88", fontFamily: "monospace", fontSize: 13 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '85%', backgroundColor: colors.card, borderRadius: 20, padding: 24, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 10, borderWidth: 1 },
  modalIconContainer: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalIcon: { width: 32, height: 32, resizeMode: 'contain' },
  modalTitle: { fontSize: 20, fontFamily: 'Poppins-Bold', marginBottom: 8, textAlign: 'center' }, 
  modalMessage: { fontSize: 14, fontFamily: 'Poppins-Regular', textAlign: 'center', marginBottom: 24, lineHeight: 22 }, 
  modalButton: { width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalButtonText: { color: '#FFF', fontSize: 16, fontFamily: 'Poppins-Bold' },

  certModalBorder: { borderColor: colors.primary, borderWidth: 2, paddingBottom: 30 },
  certTitle: { color: colors.primary, fontSize: 26, fontFamily: 'Poppins-Bold', marginTop: -10 },
  certSubtitle: { color: colors.textPrimary, fontSize: 16, fontFamily: 'Poppins-SemiBold', textAlign: 'center', marginTop: 5 },
  certDetailText: { color: colors.textSecondary, fontSize: 13, fontFamily: 'Poppins-Regular', textAlign: 'center', marginVertical: 15, paddingHorizontal: 10 },
  certBtn: { backgroundColor: colors.primary, paddingVertical: 15, borderRadius: 12, width: '100%', alignItems: 'center', marginTop: 10 },
  certBtnText: { color: '#FFF', fontSize: 16, fontFamily: 'Poppins-Bold' },

  achievementModalBorder: { borderColor: '#FFD700', borderWidth: 2 },
  achievementIconBg: { backgroundColor: '#FFD70020' },
  achievementIcon: { tintColor: '#FFD700' },
  achievementTitle: { color: '#FFD700', fontFamily: 'Poppins-Bold' },
  achievementSubtitle: { color: colors.textPrimary, fontSize: 16, fontFamily: 'Poppins-SemiBold', marginBottom: 5 },
  achievementPoints: { color: colors.textSecondary, marginBottom: 20 },
  achievementBtnBg: { backgroundColor: '#FFD700' },
  achievementBtnText: { color: '#000' },

  chatContainer: { flex: 1, paddingTop: 20 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  headerTitle: { fontSize: 16, fontFamily: 'Poppins-SemiBold', color: colors.textPrimary },
  chatTitle: { fontSize: 18, fontFamily: 'Poppins-Bold', color: colors.textPrimary },
  closeChatBtn: { padding: 5 },
  messageRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  selectionHeaderRow: { flexDirection:'row', alignItems:'center', flex:1, justifyContent:'space-between' },
  iconRed: { tintColor: '#FF4545' },
  chatContent: { padding: 15, paddingBottom: 20 },
  messageSelectedOpacity: { opacity: 0.7 },
  radioCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.textSecondary, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent', marginRight:10 },
  radioCheckIcon: { width: 10, height: 10, tintColor: '#FFF' },
  radioCircleSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: 2, marginLeft: 'auto' },
  aiBubble: { alignSelf: 'flex-start', borderBottomLeftRadius: 2, marginRight: 'auto' },
  userText: { color: '#FFF', fontFamily: 'Poppins-Regular' },
  thinkingBubbleLayout: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 15 },
  thinkingText: { fontSize: 13, marginLeft: 10, fontStyle: 'italic', fontFamily: "Poppins-SemiBold" },
  inputRow: { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, padding: 8, margin: 12, borderRadius: 25, borderWidth: 1, borderColor: colors.border },
  input: { flex: 1, paddingHorizontal: 12, fontFamily: "Poppins-Regular", fontSize: 15 },
  sendButton: { borderRadius: 20, padding: 8, marginLeft: 6, justifyContent: "center", alignItems: "center", width: 40, height: 40 },
  sendIcon: { width: 18, height: 18, tintColor: '#FFF' },
  modalButtonMuted: { backgroundColor: colors.buttonMuted },
  deleteModalButtons: { flexDirection: 'row', gap: 10, width: '100%', marginTop: 10 },
});