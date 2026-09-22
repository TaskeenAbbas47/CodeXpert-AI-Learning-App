/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Platform,
  Modal,
  RefreshControl,
  Vibration,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import LottieView from "lottie-react-native"; 

import { useThemeStyles } from "../hooks/useThemeStyles";

interface NotificationItem {
  id: string;
  title: string;
  message: string; 
  type: string; 
  isRead: boolean; 
  createdAt: any;  
}

interface Section {
  title: string;
  data: NotificationItem[];
}

export default function Notification() {
  const { styles, colors } = useThemeStyles(styleGenerator);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false); 
  
  const previousUnreadCount = useRef(0); 

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const navigation = useNavigation();
  const user = auth().currentUser;

  const formatTime = (ts: any) => {
    if (!ts) return "Just now"; 
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);

    if (diffMins < 60) return `${Math.max(1, diffMins)} m ago`;
    if (diffHrs < 24) return `${diffHrs} h ago`;
    
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
  };

  const groupNotifications = (notifs: NotificationItem[]) => {
    const today: NotificationItem[] = [];
    const yesterday: NotificationItem[] = [];
    const thisWeek: NotificationItem[] = [];
    const older: NotificationItem[] = [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const weekStart = todayStart - 86400000 * 6;

    notifs.forEach(n => {
      if (!n.createdAt) {
        today.push(n); 
        return;
      }
      const time = n.createdAt.toDate ? n.createdAt.toDate().getTime() : new Date(n.createdAt).getTime();
      
      if (time >= todayStart) today.push(n);
      else if (time >= yesterdayStart) yesterday.push(n);
      else if (time >= weekStart) thisWeek.push(n);
      else older.push(n);
    });

    const newSections: Section[] = [];
    if (today.length) newSections.push({ title: "Today", data: today });
    if (yesterday.length) newSections.push({ title: "Yesterday", data: yesterday });
    if (thisWeek.length) newSections.push({ title: "This Week", data: thisWeek });
    if (older.length) newSections.push({ title: "Older", data: older });

    return newSections;
  };

  useEffect(() => {
    if (!user) return;

    const unsubscribe = firestore()
      .collection("users")
      .doc(user.uid)
      .collection("notifications")
      .orderBy("createdAt", "desc") 
      .onSnapshot(
        (snapshot) => {
          const loaded = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title || "Notification",
              message: data.message || data.detail || "", 
              type: data.type || "general",
              isRead: data.isRead !== undefined ? data.isRead : !(data.unread),
              createdAt: data.createdAt || data.timestamp || new Date(),
            };
          }) as NotificationItem[];
          
          const activeUnread = loaded.filter(n => !n.isRead).length;

          if (activeUnread > previousUnreadCount.current) {
             Vibration.vibrate([0, 400, 200, 400]); 
          }
          previousUnreadCount.current = activeUnread;

          setNotifications(loaded); 
          setUnreadCount(activeUnread);
          setSections(groupNotifications(loaded));
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching notifications:", error);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000); 
  };

  const handleMarkAsRead = async (id: string) => {
    if (!user) return;
    try {
      await firestore()
        .collection("users")
        .doc(user.uid)
        .collection("notifications")
        .doc(id)
        .update({ isRead: true, unread: false }); 
    } catch (e) { console.warn("Failed to mark read", e); }
  };

  const handleMarkAllRead = async () => {
    if (!user || unreadCount === 0) return;
    try {
      const batch = firestore().batch();
      notifications.forEach((n) => {
        if (!n.isRead) {
          const ref = firestore().collection("users").doc(user.uid).collection("notifications").doc(n.id);
          batch.update(ref, { isRead: true, unread: false });
        }
      });
      await batch.commit();
    } catch (e) { console.warn("Failed to mark all as read", e); }
  };

  const handleDeleteSingle = async (id: string) => {
    if (!user) return;
    try {
      await firestore().collection("users").doc(user.uid).collection("notifications").doc(id).delete();
    } catch (e) { console.warn("Failed to delete", e); }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      if (newSet.size === 0) setSelectionMode(false);
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === notifications.length) {
      setSelectedIds(new Set());
      setSelectionMode(false);
    } else {
      const allIds = notifications.map(n => n.id);
      setSelectedIds(new Set(allIds));
    }
  };

  const handleBulkDelete = async () => {
    if (!user) return;
    try {
      const batch = firestore().batch();
      selectedIds.forEach(id => {
        const ref = firestore().collection("users").doc(user.uid).collection("notifications").doc(id);
        batch.delete(ref);
      });
      await batch.commit();
      setSelectedIds(new Set());
      setSelectionMode(false);
      setShowDeleteModal(false);
    } catch (e) { console.warn("Failed bulk delete", e); }
  };

  const getIconInfo = (type: string) => {
    switch (type) {
      case "system": return { icon: require("../Assets/notification.png"), color: "#FF9800" }; 
      case "general": return { icon: require("../Assets/notification.png"), color: "#2196F3" };
      case "success": return { icon: require("../Assets/check.png"), color: "#4CAF50" };
      case "alert": return { icon: require("../Assets/delete.png"), color: "#F44336" };
      default: return { icon: require("../Assets/notification.png"), color: colors.primary };
    }
  };

  const renderRightActions = (id: string) => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteSingle(id)}>
        <Image source={require("../Assets/delete.png")} style={styles.actionIcon} />
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const { icon, color } = getIconInfo(item.type);
    const isUnread = !item.isRead;
    const isSelected = selectedIds.has(item.id);
    
    return (
      <Swipeable renderRightActions={() => renderRightActions(item.id)} enabled={!selectionMode}>
        <TouchableOpacity 
            onLongPress={() => { setSelectionMode(true); toggleSelection(item.id); }}
            onPress={() => {
              if (selectionMode) toggleSelection(item.id);
              else if (isUnread) handleMarkAsRead(item.id);
            }}
            activeOpacity={0.7}
            style={[styles.rowContainer, isUnread && styles.unreadRowBg, isSelected && styles.selectedRowBg]}
        >
            <View style={styles.leftIndicatorContainer}>
                {selectionMode ? (
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected && <Image source={require("../Assets/check.png")} style={styles.radioCheckIcon} />}
                  </View>
                ) : (
                  isUnread && <View style={[styles.unreadDot, { backgroundColor: '#FF4545' }]} />
                )}
            </View>

            <View style={[styles.avatarBox, { backgroundColor: color + '15' }]}>
              <Image source={icon} style={[styles.avatarIcon, { tintColor: color }]} />
            </View>
            
            <View style={styles.textContainer}>
                <Text style={styles.textContent} numberOfLines={2}>
                  <Text style={styles.titleBold}>{item.title} </Text>
                  <Text style={styles.detailRegular}>{item.message}</Text>
                </Text>
                <Text style={styles.timestampText}>{formatTime(item.createdAt)}</Text>
            </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {selectionMode ? (
          <View style={styles.selectionHeaderRow}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={() => { setSelectionMode(false); setSelectedIds(new Set()); }} style={styles.backButton}>
                  <Image source={require("../Assets/close.png")} style={[styles.backIcon, { tintColor: colors.icon }]} />
              </TouchableOpacity>
              <Text style={styles.selectionTitle}>{selectedIds.size} Selected</Text>
            </View>
            
            <View style={styles.headerRightGroup}>
              <TouchableOpacity onPress={handleSelectAll} style={styles.selectAllBtn}>
                  <Text style={styles.selectAllText}>{selectedIds.size === notifications.length ? "Deselect All" : "Select All"}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowDeleteModal(true)} style={styles.trashBtn}>
                  <Image source={require("../Assets/delete.png")} style={[styles.clearIcon, { tintColor: '#FF4545' }]} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View>
            <View style={styles.headerTopRow}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Image source={require("../Assets/back.png")} style={[styles.backIcon, { tintColor: colors.icon }]} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllButton}>
                    <Image source={require("../Assets/check.png")} style={[styles.markAllIcon, { tintColor: colors.primary }]} />
                </TouchableOpacity>
            </View>
            <Text style={styles.hugeTitle}>Notifications</Text>
            <Text style={styles.subtitle}>
                You have <Text style={{ color: colors.primary, fontFamily: 'Poppins-Bold' }}>{unreadCount} unread</Text> notifications.
            </Text>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.centerContainer}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : sections.length === 0 ? (
        <View style={styles.centerContainer}>
            <LottieView source={require("../Assets/nothing.json")} autoPlay loop style={{ width: 250, height: 250 }} />
            <Text style={styles.emptyText}>You're all caught up!</Text>
        </View>
      ) : (
        <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            renderSectionHeader={({ section: { title } }) => <Text style={styles.sectionHeader}>{title}</Text>}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />} 
        />
      )}

      <Modal visible={showDeleteModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
              <View style={[styles.modalCard, {backgroundColor: colors.card}]}>
                  <Text style={[styles.modalTitle, {color: colors.textPrimary}]}>Delete {selectedIds.size} Notification{selectedIds.size > 1 ? 's' : ''}?</Text>
                  <Text style={[styles.modalMessage, {color: colors.textSecondary}]}>This action cannot be undone.</Text>
                  <View style={styles.deleteModalButtons}>
                      <TouchableOpacity onPress={() => setShowDeleteModal(false)} style={[styles.modalButton, {backgroundColor: colors.buttonMuted}]}><Text style={styles.modalButtonText}>Cancel</Text></TouchableOpacity>
                      <TouchableOpacity onPress={handleBulkDelete} style={[styles.modalButton, styles.deleteBtnBg]}><Text style={styles.modalButtonText}>Delete</Text></TouchableOpacity>
                  </View>
              </View>
          </View>
      </Modal>
    </SafeAreaView>
  );
}

export const styleGenerator = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 50 },
  header: { paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 20 : 10, paddingBottom: 15, backgroundColor: colors.background },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  backButton: { padding: 5, marginLeft: -5 },
  backIcon: { width: 24, height: 24, resizeMode: 'contain' },
  markAllButton: { backgroundColor: colors.primary + '15', padding: 10, borderRadius: 20 },
  markAllIcon: { width: 20, height: 20, resizeMode: 'contain' },
  hugeTitle: { fontSize: 32, fontFamily: "Poppins-Bold", color: colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, fontFamily: "Poppins-Regular", color: colors.textSecondary, marginTop: 5 },
  selectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 40 },
  selectionTitle: { fontSize: 18, fontFamily: "Poppins-SemiBold", color: colors.textPrimary, marginLeft: 10 },
  headerRightGroup: { flexDirection: 'row', alignItems: 'center' },
  selectAllBtn: { marginRight: 20 },
  selectAllText: { color: colors.primary, fontFamily: 'Poppins-Bold', fontSize: 14 },
  trashBtn: { padding: 5 },
  clearIcon: { width: 22, height: 22, resizeMode: 'contain' },
  listContent: { paddingBottom: 40 },
  sectionHeader: { fontSize: 18, fontFamily: "Poppins-Bold", color: colors.textPrimary, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, backgroundColor: colors.background },
  rowContainer: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingRight: 20, backgroundColor: colors.background },
  unreadRowBg: { backgroundColor: colors.primary + '08' },
  selectedRowBg: { backgroundColor: colors.primary + '15' },
  leftIndicatorContainer: { width: 35, alignItems: 'center', justifyContent: 'center' },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  radioCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.textSecondary, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
  radioCheckIcon: { width: 10, height: 10, tintColor: '#FFF' },
  radioCircleSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  avatarBox: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarIcon: { width: 26, height: 26, resizeMode: 'contain' },
  textContainer: { flex: 1, justifyContent: 'center' },
  textContent: { lineHeight: 22, marginBottom: 4 },
  titleBold: { fontSize: 15, color: colors.textPrimary, fontFamily: "Poppins-SemiBold" },
  detailRegular: { fontSize: 15, color: colors.textSecondary, fontFamily: "Poppins-Regular" },
  timestampText: { fontSize: 13, color: colors.textSecondary, fontFamily: "Poppins-Regular", opacity: 0.7 },
  actionsContainer: { flexDirection: "row", alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF4545', width: 80 },
  actionButton: { justifyContent: "center", alignItems: "center", width: '100%', height: '100%' },
  deleteButton: { backgroundColor: "#FF4545" },
  actionIcon: { width: 24, height: 24, tintColor: "#fff" },
  emptyText: { color: colors.textPrimary, fontFamily: "Poppins-Bold", fontSize: 18, marginTop: -20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '85%', backgroundColor: '#FFF', borderRadius: 20, padding: 24, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 10, borderWidth: 1, borderColor: colors.border },
  modalTitle: { fontSize: 20, fontFamily: 'Poppins-Bold', marginBottom: 8, textAlign: 'center' }, 
  modalMessage: { fontSize: 14, fontFamily: 'Poppins-Regular', textAlign: 'center', marginBottom: 24, lineHeight: 22 }, 
  deleteModalButtons: { flexDirection: 'row', gap: 10, marginTop: 15, width: '100%' },
  modalButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalButtonText: { color: '#FFF', fontSize: 16, fontFamily: 'Poppins-Bold' },
  deleteBtnBg: { backgroundColor: '#FF4545' },
});