/* eslint-disable react-native/no-inline-styles */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
  Keyboard,
  Modal,
} from "react-native";
import Markdown from "react-native-markdown-display";
import LottieView from "lottie-react-native";
import { useBackWithAnim } from "../hooks/useBackWithAnim";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

// 1. Import Theme Hook
import { useThemeStyles } from "../hooks/useThemeStyles";

type Message = {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp?: number;
  isThinking?: boolean; 
};

const API_URL = "http://localhost:8000/ask";

// ✅ List of Pre-Saved Responses
const PRE_SAVED_RESPONSES: Record<string, string> = {
  "hi": "Hello! I am XpertAi. How can I help you with your code today?",
  "hello": "Hi there! Ready to solve some coding problems?",
  "who are you": "I am XpertAi, your personal AI coding assistant.",
  "help": "I can help you debug code, explain concepts, or write scripts. Just ask!",
  "thanks": "You're welcome! Happy coding. 🚀",
};

//  Updated Thinking Bubble: Larger, Bold & Italic
const ThinkingBubble = ({ styles, colors }: { styles: any, colors: any }) => {
  const [loadingText, setLoadingText] = useState("Analyzing...");
  
  useEffect(() => {
    const texts = [
      "Analyzing your question...",   
      "Searching knowledge base...",  
      "Gathering key details...",     
      "Writing response...",          
    ];
    let i = 0;
    const interval = setInterval(() => {
      setLoadingText(texts[i]);
      i = (i + 1) % texts.length;
    }, 800); 
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.messageBubble, styles.aiBubble, styles.thinkingBubbleLayout]}>
      <LottieView 
        source={require("../Assets/think.json")} 
        autoPlay 
        loop 
        speed={1.75} 
        style={{ width: 50, height: 50}} 
      />
      {/*  Updated Text Styles Here */}
      <Text style={{ 
        color: colors.textSecondary, 
        fontSize: 15,               // Increased size
        marginLeft: 10, 
        fontStyle: 'italic',        // Italic
        fontFamily: "Poppins-SemiBold" // Bold (using the font family)
      }}>
        {loadingText}
      </Text>
    </View>
  );
};

const AIAssistantScreen = () => {
  const { styles, colors } = useThemeStyles(styleGenerator);
  const markdownStyles = useMemo(() => getMarkdownStyles(colors), [colors]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false); 
  const [showBackAnim, setShowBackAnim] = useState(false);
  
  // Selection Mode State
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const flatListRef = useRef<FlatList<any> | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const user = auth().currentUser;
  const chatRef = user ? firestore().collection("users").doc(user.uid).collection("chats") : null;

  const playBackAnim = () =>
    new Promise<void>((resolve) => {
      setShowBackAnim(true);
      setTimeout(() => resolve(), 600);
    });

  const { handleBackPress } = useBackWithAnim(playBackAnim, "HomeScreen");

  // --- Auto-Hide Success Modal ---
  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => setShowSuccessModal(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessModal]);

  // --- Firestore Listener ---
  useEffect(() => {
    if (!chatRef) {
      setMessages([]);
      return;
    }
    const q = chatRef.orderBy("timestamp", "asc");
    const unsubscribe = q.onSnapshot(
      (snapshot) => {
        try {
          const loaded: Message[] = snapshot.docs.map((doc) => {
            const d = doc.data() as Partial<Message>;
            return {
              id: doc.id,
              text: (d.text as string) || "",
              sender: (d.sender as "user" | "ai") || "ai",
              timestamp: d.timestamp as number | undefined,
            };
          });
          
          if (isTyping) {
            setMessages([...loaded, { id: 'thinking-placeholder', text: '', sender: 'ai', isThinking: true }]);
          } else {
            setMessages(loaded);
          }
        } catch (mapErr) {
          console.error("❌ Error mapping docs", mapErr);
        }
      },
      (error) => console.error("❌ Firestore listener error:", error)
    );
    return () => {
      try { unsubscribe(); } catch (e) { console.warn(e); }
    };
  }, [chatRef, isTyping]);

  const scrollToBottom = useCallback((animated = true) => {
    try {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated });
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;
    if (isAtBottom) setTimeout(() => scrollToBottom(true), 50);
  }, [messages, isAtBottom, scrollToBottom]);

  useEffect(() => {
    const onShow = () => setTimeout(() => scrollToBottom(true), 100);
    const kShow = Keyboard.addListener("keyboardDidShow", onShow);
    return () => kShow.remove();
  }, [scrollToBottom]);

  // --- Selection Logic ---
  const handleLongPress = (id: string) => {
    if (id === 'thinking-placeholder') return;
    setSelectionMode(true);
    toggleSelection(id);
  };

  const toggleSelection = (id: string) => {
    if (id === 'thinking-placeholder') return;
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
        if (newSet.size === 0) setSelectionMode(false);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const validMessages = messages.filter(m => !m.isThinking);
    const allSelected = validMessages.length > 0 && selectedIds.size === validMessages.length;
    
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      const allIds = new Set(validMessages.map((m) => m.id));
      setSelectedIds(allIds);
    }
  };

  const cancelSelection = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const confirmDelete = () => {
    if (selectedIds.size === 0) return;
    setShowDeleteModal(true);
  };

  const performDelete = async () => {
    setShowDeleteModal(false);
    if (!chatRef) return;
    
    try {
      const batch = firestore().batch();
      selectedIds.forEach((id) => {
        const doc = chatRef.doc(id);
        batch.delete(doc);
      });
      await batch.commit();
      cancelSelection();
      setTimeout(() => setShowSuccessModal(true), 300);
    } catch (error) {
      Alert.alert("Error", "Failed to delete messages.");
    }
  };

  // --- Sending Logic ---
  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isTyping) return;
    
    if (!user || !chatRef) {
      Alert.alert("Login Required", "Please log in to use XpertAi.");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: trimmedInput,
      sender: "user",
      timestamp: Date.now(),
    };

    setInput("");
    
    try {
      await chatRef.doc(userMessage.id).set(userMessage);
    } catch (err) {
      return;
    }

    const lowerText = trimmedInput.toLowerCase();
    const preSavedAnswer = PRE_SAVED_RESPONSES[lowerText];

    if (preSavedAnswer) {
      const aiMessage: Message = {
        id: Date.now().toString() + "-ai",
        text: preSavedAnswer,
        sender: "ai",
        timestamp: Date.now(),
      };
      await chatRef.doc(aiMessage.id).set(aiMessage);
      return;
    }

    setIsTyping(true); 
    setTimeout(() => setIsAtBottom(true), 30);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage.text }),
      });
      if (!response.ok) throw new Error(`Server error ${response.status}`);
      const data = await response.json();

      const aiMessage: Message = {
        id: Date.now().toString() + "-ai",
        text: data?.answer || "⚠️ No response from AI",
        sender: "ai",
        timestamp: Date.now(),
      };
      await chatRef.doc(aiMessage.id).set(aiMessage);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString() + "-error",
        text: "❌ Error connecting to server.",
        sender: "ai",
        timestamp: Date.now(),
      };
      await chatRef.doc(errorMessage.id).set(errorMessage);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDayLabel = (timestamp: number) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) return "Today";
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderItem = ({ item, index }: { item: Message; index: number }) => {
    if (item.isThinking) {
      return (
        <View style={styles.messageRow}>
           <ThinkingBubble styles={styles} colors={colors} />
        </View>
      );
    }

    const isSelected = selectedIds.has(item.id);
    const showDayHeader = 
      index === 0 || 
      getDayLabel(item.timestamp || 0) !== getDayLabel(messages[index - 1]?.timestamp || 0);

    return (
      <View>
        {showDayHeader && item.timestamp && (
          <View style={styles.dayHeaderContainer}>
            <Text style={styles.dayHeaderText}>{getDayLabel(item.timestamp)}</Text>
          </View>
        )}
        
        <TouchableOpacity
          activeOpacity={0.9}
          onLongPress={() => handleLongPress(item.id)}
          onPress={() => { if (selectionMode) toggleSelection(item.id); }}
          style={styles.messageRow}
        >
          {selectionMode && (
            <View style={styles.selectionIndicatorContainer}>
              <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                {isSelected && <Image source={require("../Assets/check.png")} style={styles.checkIcon} />}
              </View>
            </View>
          )}

          <View
            style={[
              styles.messageBubble,
              item.sender === "user" ? styles.userBubble : styles.aiBubble,
              isSelected && styles.selectedBubbleScale
            ]}
          >
            {item.sender === "ai" ? (
              <Markdown style={markdownStyles}>{item.text}</Markdown>
            ) : (
              <Text style={styles.messageText}>{item.text}</Text>
            )}
            
            <Text style={[
              styles.timestamp, 
              item.sender === "user" ? styles.timestampUser : styles.timestampAi
            ]}>
              {formatTime(item.timestamp)}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const onScroll = (e: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const paddingToBottom = 120;
    const isBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    setIsAtBottom(isBottom);
  };

  const validMsgs = messages.filter(m => !m.isThinking);
  const isAllSelected = validMsgs.length > 0 && selectedIds.size === validMsgs.length;

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.loginText}>Please log in to use XpertAi.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showBackAnim && (
        <View style={styles.backAnimOverlay}>
          <LottieView 
            source={require("../Assets/backAnimation.json")} 
            autoPlay 
            loop={false} 
            speed={1.75} 
            style={styles.backAnim} 
          />
        </View>
      )}

      {/* Header */}
      <View style={[styles.header, selectionMode && styles.headerSelection]}>
        {selectionMode ? (
          <>
            <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
              <TouchableOpacity onPress={cancelSelection}>
                <Image source={require("../Assets/close.png")} style={styles.headerIcon} />
              </TouchableOpacity>
              <Text style={styles.headerTitleSelected}>{selectedIds.size} Selected</Text>
            </View>
            
            <View style={styles.headerRightActions}>
              <TouchableOpacity onPress={handleSelectAll} style={styles.selectAllBtn}>
                <Text style={[
                  styles.selectAllText, 
                  isAllSelected ? { color: colors.primary } : { color: colors.textSecondary }
                ]}>
                  {isAllSelected ? "Deselect All" : "Select All"}
                </Text>
                <Image 
                  source={require("../Assets/check.png")} 
                  style={[
                    styles.headerIconSmall, 
                    { tintColor: isAllSelected ? colors.primary : colors.textSecondary }
                  ]} 
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={confirmDelete} style={{ marginLeft: 15 }}>
                <Image 
                  source={require("../Assets/delete.png")} 
                  style={[styles.headerIcon, { tintColor: colors.accent }]} 
                />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={styles.headerCenterContainer}>
              <Text style={styles.headerTitle}>XpertAi</Text>
            </View>

            <TouchableOpacity onPress={handleBackPress} style={styles.headerLeftButton}>
              <Image source={require("../Assets/back.png")} style={styles.backIcon} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {messages.length === 0 ? (
        <View style={styles.emptyState}>
          <LottieView source={require("../Assets/chat.json")} autoPlay loop style={styles.illustration} />
          <Text style={styles.description}>Hi! I'm XpertAi. Ask me anything related to Coding Languages.</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => { if (isAtBottom) scrollToBottom(true); }}
          onLayout={() => { if (isAtBottom) scrollToBottom(false); }}
          onScroll={onScroll}
          scrollEventThrottle={100}
        />
      )}

      {!selectionMode && (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Ask me anything..."
              placeholderTextColor={colors.textSecondary}
              value={input}
              onChangeText={setInput}
              editable={!isTyping}
            />
            <TouchableOpacity
              onPress={handleSend}
              style={[styles.sendButton, isTyping && styles.sendButtonDisabled]}
              disabled={isTyping}
            >
              {isTyping ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Image source={require("../Assets/send.png")} style={styles.sendIcon} />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* --- Delete Confirmation Modal --- */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContent}>
            <View style={styles.warningIconContainer}>
               <Image source={require("../Assets/delete.png")} style={styles.warningIcon} />
            </View>
            <Text style={styles.deleteModalTitle}>Delete Chats?</Text>
            <Text style={styles.deleteModalText}>
              Are you sure you want to delete {selectedIds.size} selected message(s)?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowDeleteModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={performDelete}>
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- Success Modal --- */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
             <LottieView 
               source={require("../Assets/success.json")} 
               autoPlay 
               loop={false} 
               style={styles.successAnim} 
             />
             <Text style={styles.successText}>Deleted!</Text>
          </View>
        </View>
      </Modal>

    </View>
  );
};

export default AIAssistantScreen;

// 3. Styles Generator
const styleGenerator = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loginText: {
    color: colors.textPrimary,
    textAlign: "center",
    marginTop: 100,
    fontSize: 16,
  },
  
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border || "#222",
    justifyContent: 'space-between',
    height: 60,
    position: 'relative', 
  },
  headerSelection: {
    backgroundColor: colors.card, 
  },
  headerCenterContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  headerLeftButton: {
    zIndex: 10,
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    color: colors.textPrimary,
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
  },
  headerTitleSelected: {
    fontSize: 18,
    color: colors.textPrimary,
    fontFamily: "Poppins-SemiBold",
    marginLeft: 10,
  },
  
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background, 
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  selectAllText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    marginRight: 6,
  },
  backIcon: {
    width: 26,
    height: 26,
    tintColor: colors.textPrimary,
    resizeMode: "contain",
  },
  headerIcon: {
    width: 24,
    height: 24,
    tintColor: colors.textPrimary,
    resizeMode: "contain",
  },
  headerIconSmall: {
    width: 16,
    height: 16,
    resizeMode: "contain",
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  illustration: {
    width: 250,
    height: 250,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 10,
    fontFamily: "Poppins-Regular",
  },

  // Chat List
  chatContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
  },
  dayHeaderContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  dayHeaderText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden'
  },
  
  // Message Selection & Layout
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectionIndicatorContainer: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  radioCircleSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkIcon: {
    width: 12,
    height: 12,
    tintColor: '#fff',
  },
  selectedBubbleScale: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },

  messageBubble: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 12,
    minWidth: 80,
  },
  userBubble: {
    backgroundColor: colors.chatUserBg,
    marginLeft: 'auto',
    borderBottomRightRadius: 0,
  },
  aiBubble: {
    backgroundColor: colors.chatAiBg,
    marginRight: 'auto',
    borderBottomLeftRadius: 0,
  },
  thinkingBubbleLayout: {
    flexDirection: 'row', 
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  messageText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
  
  // Timestamps
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
    opacity: 0.7,
    fontFamily: "Poppins-Regular",
  },
  timestampUser: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  timestampAi: {
    color: colors.textPrimary,
  },

  // Input
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    padding: 8,
    margin: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.border || "transparent",
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    paddingHorizontal: 12,
    fontFamily: "Poppins-Regular",
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 8,
    marginLeft: 6,
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
  },
  sendButtonDisabled: {
    backgroundColor: colors.buttonMuted,
    opacity: 0.7,
  },
  sendIcon: {
    width: 20,
    height: 20,
    tintColor: "#FFFFFF",
    resizeMode: "contain",
  },

  // Overlays
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
  backAnim: {
    width: 200,
    height: 200,
  },
  
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteModalContent: {
    width: "80%",
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border || "transparent",
  },
  warningIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 76, 76, 0.1)", 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  warningIcon: {
    width: 30,
    height: 30,
    tintColor: colors.accent,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: colors.textPrimary,
    marginBottom: 10,
  },
  deleteModalText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: colors.buttonMuted,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: "Poppins-SemiBold",
    color: colors.textPrimary,
  },
  deleteBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: colors.accent,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteBtnText: {
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
  },

  successModalContent: {
    width: 150,
    height: 150,
    backgroundColor: colors.card,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border || "transparent",
  },
  successAnim: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  successText: {
    fontFamily: "Poppins-SemiBold",
    color: colors.textPrimary,
    fontSize: 16,
  }
});

const getMarkdownStyles = (colors: any) => ({
  body: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
  strong: {
    fontFamily: "Poppins-SemiBold",
    color: colors.textPrimary,
  },
  code_inline: {
    backgroundColor: colors.codeBg,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    color: colors.codeText,
    fontFamily: "monospace",
  },
  code_block: {
    backgroundColor: colors.codeBg,
    borderRadius: 8,
    padding: 10,
    color: colors.codeText,
    fontFamily: "monospace",
  },
  fence: {
    backgroundColor: colors.codeBg,
    borderRadius: 8,
    padding: 10,
    color: colors.codeText,
    fontFamily: "monospace",
  },
  list_item: {
    color: colors.textPrimary,
    marginVertical: 2,
  },
});