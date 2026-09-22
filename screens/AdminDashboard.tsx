/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Image,
  Alert,
  Modal,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
  RefreshControl,
  Share,
  useColorScheme,
  Dimensions,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { useThemeStyles } from "../hooks/useThemeStyles";

const { width } = Dimensions.get("window");

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ---------------------------------------------------------
// 1. SUB-VIEW: DASHBOARD ANALYTICS
// ---------------------------------------------------------
const AnalyticsView = ({ styles, colors }: any) => {
  const [stats, setStats] = useState({ users: 0, feedbacks: 0, unresolved: 0, certs: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportType, setExportType] = useState("users");
  const [exporting, setExporting] = useState(false);

  const [isSystemOpen, setIsSystemOpen] = useState(false);

  useEffect(() => {
    const unsubUsers = firestore().collection("users").onSnapshot((snapshot) => {
      let studentCount = 0;
      snapshot?.docs?.forEach(doc => {
          if (doc?.data()?.role !== 'admin' && doc?.data()?.email?.toLowerCase() !== 'wetom.k173@gmail.com') {
              studentCount++;
          }
      });
      setStats(prev => ({ ...prev, users: studentCount }));
    });

    const unsubFeedback = firestore().collection("feedback").onSnapshot((snapshot) => {
      let unresolvedCount = 0;
      snapshot?.docs?.forEach(doc => {
        if (doc.data().status !== "resolved") unresolvedCount++;
      });
      setStats(prev => ({ ...prev, feedbacks: snapshot?.size || 0, unresolved: unresolvedCount }));
    });

    const unsubCerts = firestore().collectionGroup("certificates").onSnapshot((snapshot) => {
        if (snapshot) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setStats(prev => ({ ...prev, certs: snapshot.size }));
        }
    });

    return () => {
      unsubUsers();
      unsubFeedback();
      unsubCerts();
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleBroadcast = async () => {
    if (!broadcastMsg.trim()) return Alert.alert("Empty", "Please type a message first.");
    setBroadcasting(true);
    try {
      const usersSnap = await firestore().collection("users").get();
      const batch = firestore().batch(); 
      usersSnap.docs.forEach(doc => {
        if (doc.data().role !== 'admin') {
          const notifRef = firestore().collection("users").doc(doc.id).collection("notifications").doc();
          batch.set(notifRef, {
            title: "📢 Admin Broadcast",
            message: broadcastMsg.trim(),
            createdAt: firestore.FieldValue.serverTimestamp(),
            isRead: false,
            type: "system"
          });
        }
      });
      await batch.commit();
      Alert.alert("Success", "Broadcast pushed to all student accounts!");
      setBroadcastMsg("");
      setIsBroadcastOpen(false);
    } catch (error) {
      Alert.alert("Error", "Could not send broadcast.");
    } finally {
      setBroadcasting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      let csvString = "";
      
      if (exportType === "users") {
        const snap = await firestore().collection("users").get();
        csvString = "Name,Email,Total XP\n";
        snap.docs.forEach(doc => {
          const d = doc.data();
          if (d.role !== 'admin') {
              const name = `${d.firstName || ''} ${d.lastName || ''}`.trim() || d.name || "Student";
              csvString += `"${name}","${d.email}","${d.totalPoints || 0}"\n`;
          }
        });
      } else if (exportType === "feedback") {
        const snap = await firestore().collection("feedback").get();
        csvString = "Category,Device,Status,Message\n";
        snap.docs.forEach(doc => {
          const d = doc.data();
          csvString += `"${d.category}","${d.device}","${d.status}","${d.message}"\n`;
        });
      } else if (exportType === "certificates") {
        const snap = await firestore().collectionGroup("certificates").get();
        csvString = "Student,Course,Certificate ID\n";
        
        // Resolve student names dynamically for CSV too
        await Promise.all(snap.docs.map(async (doc) => {
          const d = doc.data();
          let sName = d.userName || d.studentName;
          if (!sName && doc.ref.path) {
            const pathParts = doc.ref.path.split('/');
            if (pathParts[0] === 'users' && pathParts[1]) {
               const uSnap = await firestore().collection("users").doc(pathParts[1]).get();
               if (uSnap.exists()) {
                 const ud = uSnap.data();
                 sName = `${ud?.firstName || ''} ${ud?.lastName || ''}`.trim() || ud?.name || ud?.email;
               }
            }
          }
          csvString += `"${sName || 'Unknown Student'}","${d.courseName || d.courseId}","${d.certificateId}"\n`;
        }));
      }

      setIsExportOpen(false);
      
      await Share.share({
        message: csvString,
        title: `CodeXpert_Export.csv`
      });

    } catch (e) {
      Alert.alert("Error", "Could not compile data.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.viewContainer} 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
    >
      <Modal visible={isBroadcastOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Global Broadcast</Text>
            <Text style={styles.modalSub}>Push an alert to every student's app notification center.</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Type your message here..."
              placeholderTextColor={colors.textSecondary}
              multiline
              value={broadcastMsg}
              onChangeText={setBroadcastMsg}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]} onPress={() => setIsBroadcastOpen(false)}>
                <Text style={[styles.modalBtnText, { color: colors.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtn} onPress={handleBroadcast} disabled={broadcasting}>
                {broadcasting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.modalBtnText}>Send to All</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isExportOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Export Platform Data</Text>
            <Text style={styles.modalSub}>Compile live database into a shareable CSV format.</Text>
            
            <View style={{ gap: 10, marginBottom: 25 }}>
                {['users', 'feedback', 'certificates'].map((type) => (
                    <TouchableOpacity 
                        key={type}
                        style={[
                            styles.exportOptionBtn, 
                            exportType === type && { borderColor: colors.primary, backgroundColor: colors.primary + '15' }
                        ]}
                        onPress={() => setExportType(type)}
                    >
                        <Text style={[styles.exportOptionText, exportType === type && { color: colors.primary, fontFamily: 'Poppins-Bold' }]}>
                            {type === 'users' ? '👨‍🎓 Student Roster' : type === 'feedback' ? '💬 User Feedback' : '🎓 Issued Certificates'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]} onPress={() => setIsExportOpen(false)}>
                <Text style={[styles.modalBtnText, { color: colors.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtn} onPress={handleExport} disabled={exporting}>
                {exporting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.modalBtnText}>Share CSV</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isSystemOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { borderColor: colors.success, borderWidth: 2 }]}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
              <Text style={{fontSize: 24, marginRight: 10}}>🛡️</Text>
              <Text style={styles.modalTitle}>System Diagnostics</Text>
            </View>
            <View style={{ backgroundColor: colors.background, padding: 15, borderRadius: 10, marginBottom: 20 }}>
              <Text style={[styles.cardDate, { fontFamily: 'Poppins-Bold', color: colors.success, marginBottom: 5 }]}>● ACTIVE CONNECTION</Text>
              <Text style={styles.cardSubtitle}>Database: <Text style={{fontFamily: 'Poppins-Bold', color: colors.textPrimary}}>Cloud Firestore</Text></Text>
              <Text style={styles.cardSubtitle}>Auth: <Text style={{fontFamily: 'Poppins-Bold', color: colors.textPrimary}}>Firebase Authentication</Text></Text>
              <Text style={styles.cardSubtitle}>Server Location: <Text style={{fontFamily: 'Poppins-Bold', color: colors.textPrimary}}>nam5 (us-central)</Text></Text>
              <Text style={styles.cardSubtitle}>Platform Environment: <Text style={{fontFamily: 'Poppins-Bold', color: colors.textPrimary}}>React Native</Text></Text>
            </View>
            <TouchableOpacity style={[styles.modalBtn, { flex: 0, width: '100%', paddingVertical: 14 }]} onPress={() => setIsSystemOpen(false)}>
                <Text style={styles.modalBtnText}>Close Diagnostics</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Text style={styles.sectionTitle}>Platform Overview</Text>
      
      <View style={styles.heroCard}>
        <View style={styles.heroBlobTop} />
        <View style={styles.heroBlobBottom} />
        <Text style={styles.heroLabel}>Total Enrolled Students</Text>
        <Text style={styles.heroValue}>{stats.users}</Text>
        <Text style={styles.heroSubText}>Growing every day!</Text>
      </View>

      <View style={styles.secondaryStatsContainer}>
        <View style={[styles.secondaryCard, { shadowColor: '#FF9800' }]}>
          <View style={[styles.iconCircle, { backgroundColor: '#FF980015' }]}>
            <Text style={{ fontSize: 22 }}>💬</Text>
          </View>
          <Text style={[styles.secondaryValue, { color: '#FF9800' }]}>{stats.unresolved}</Text>
          <Text style={styles.secondaryLabel}>Pending</Text>
        </View>

        <View style={[styles.secondaryCard, { shadowColor: colors.success }]}>
          <View style={[styles.iconCircle, { backgroundColor: colors.success + '15' }]}>
            <Text style={{ fontSize: 22 }}>🎓</Text>
          </View>
          <Text style={[styles.secondaryValue, { color: colors.success }]}>{stats.certs}</Text>
          <Text style={styles.secondaryLabel}>Certs Issued</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 35 }]}>Administrative Actions</Text>
      
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={[styles.actionGridCard, { width: '100%', backgroundColor: colors.primary }]} onPress={() => setIsBroadcastOpen(true)}>
            <View style={styles.actionIconContainer}><Text style={{fontSize: 24}}>📢</Text></View>
            <View>
                <Text style={[styles.actionGridTitle, { color: '#FFF' }]}>Global Broadcast</Text>
                <Text style={[styles.actionGridSub, { color: 'rgba(255,255,255,0.8)' }]}>Send urgent app notifications.</Text>
            </View>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', gap: 15 }}>
            <TouchableOpacity style={[styles.actionGridCard, styles.actionHalfCard, { backgroundColor: colors.card }]} onPress={() => setIsExportOpen(true)}>
                <View style={[styles.actionIconContainer, { backgroundColor: colors.primary + '15' }]}><Text style={{fontSize: 20}}>📊</Text></View>
                <Text style={[styles.actionGridTitle, { color: colors.textPrimary }]}>Export Data</Text>
                <Text style={styles.actionGridSub}>Generate real CSVs</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionGridCard, styles.actionHalfCard, { backgroundColor: colors.card }]} onPress={() => setIsSystemOpen(true)}>
                <View style={[styles.actionIconContainer, { backgroundColor: colors.success + '15' }]}><Text style={{fontSize: 20}}>🛡️</Text></View>
                <Text style={[styles.actionGridTitle, { color: colors.textPrimary }]}>Diagnostics</Text>
                <Text style={styles.actionGridSub}>View server health</Text>
            </TouchableOpacity>
        </View>

      </View>
    </ScrollView>
  );
};

// ---------------------------------------------------------
// 2. SUB-VIEW: FEEDBACK MANAGER
// ---------------------------------------------------------
const FeedbacksView = ({ styles, colors }: any) => {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getMillis = (ts: any) => {
    if (!ts) return 0;
    if (typeof ts.toMillis === 'function') return ts.toMillis();
    if (ts.seconds) return ts.seconds * 1000;
    return new Date(ts).getTime() || 0;
  };

  const formatDate = (ts: any) => {
    if (!ts) return "Just now";
    if (typeof ts.toDate === 'function') return ts.toDate().toLocaleDateString();
    return new Date(ts.seconds ? ts.seconds * 1000 : ts).toLocaleDateString();
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  useEffect(() => {
    const unsubscribe = firestore().collection("feedback").onSnapshot((snapshot) => {
        const fetchedDocs = snapshot?.docs || [];
        let fetched = fetchedDocs.map(doc => ({ id: doc?.id, ...doc?.data() }));
        fetched = fetched.sort((a: any, b: any) => getMillis(b.timestamp) - getMillis(a.timestamp));
        LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
        setFeedbacks(fetched);
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const markCompleted = async (id: string) => {
    try {
      await firestore().collection("feedback").doc(id).update({
        status: "resolved",
        resolvedAt: firestore.FieldValue.serverTimestamp()
      });
    } catch (e) { Alert.alert("Error", "Update failed."); }
  };

  if (loading) return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />;

  return (
    <FlatList
      data={feedbacks}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.viewContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
      renderItem={({ item }) => {
          const isResolved = item.status === "resolved";
          return (
            <View style={[styles.card, isResolved && styles.cardCompleted]}>
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{item.category || "General"}</Text>
                        <Text style={styles.cardSubtitle}>{item.device || "Android"}</Text>
                    </View>
                    <Text style={styles.cardDate}>{formatDate(item.timestamp)}</Text>
                </View>
                <View style={styles.divider} />
                <Text style={styles.cardBody}>{item.message}</Text>
                {!isResolved ? (
                    <TouchableOpacity style={styles.actionBtnPrimary} onPress={() => markCompleted(item.id)}>
                        <Text style={styles.actionBtnTextPrimary}>Mark Resolved</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.resolvedBadge}><Text style={styles.resolvedBadgeText}> Resolved</Text></View>
                )}
            </View>
          );
      }}
      ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyText}>No Feedback Found</Text></View>}
    />
  );
};

// ---------------------------------------------------------
// 3. SUB-VIEW: USER DIRECTORY
// ---------------------------------------------------------
const UsersView = ({ styles, colors }: any) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async () => {
    try {
      const snapshot = await firestore().collection("users").limit(100).get();
      const rawUsers = (snapshot?.docs || [])
          .map(doc => ({ uid: doc?.id, ...(doc?.data() as object) }))
          .filter((user: any) => user.role !== 'admin' && user.email !== 'wetom.k173@gmail.com'); 

      const usersWithCourses = await Promise.all(
        rawUsers.map(async (user: any) => {
          try {
            const coursesSnap = await firestore().collection("users").doc(user.uid).collection("courses").get();
            let enrolledCount = coursesSnap.size; 
            let completedCount = 0;
            
            coursesSnap.forEach(courseDoc => {
              const courseData = courseDoc.data();
              if (courseData.progress === 100) { 
                completedCount++;
              }
            });

            return { ...user, enrolledCount, completedCount };
          } catch (err) {
            return { ...user, enrolledCount: 0, completedCount: 0 };
          }
        })
      );

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setUsers(usersWithCourses);
    } catch (error) { console.warn(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  if (loading) return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />;

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item.uid}
      contentContainerStyle={styles.viewContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
      renderItem={({ item }) => {
        const fullName = `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.name || "Unknown Student";
        const firstLetter = fullName.charAt(0).toUpperCase();
        const joinedDate = item.createdAt ? new Date(item.createdAt.toDate ? item.createdAt.toDate() : (item.createdAt.seconds * 1000 || item.createdAt)).toLocaleDateString() : "Unknown Date";
        
        return (
          <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: colors.primary }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary + '20', width: 50, height: 50, borderRadius: 25 }]}>
                  <Text style={[styles.avatarText, { color: colors.primary, fontSize: 19 }]}>{firstLetter}</Text>
              </View>
              <View style={{ marginLeft: 15, flex: 1 }}>
                  <Text style={[styles.cardTitle, { fontSize: 16 }]}>{fullName}</Text>
                  <Text style={styles.cardSubtitle}>{item.email}</Text>
              </View>
            </View>

            <View style={{ backgroundColor: colors.background, padding: 15, borderRadius: 12, marginTop: 18 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={[styles.cardDate, { fontFamily: 'Poppins-Medium', color: colors.textPrimary }]}>Joined Date:</Text>
                    <Text style={[styles.cardDate, { fontFamily: 'Poppins-Bold', color: colors.textSecondary }]}>{joinedDate}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={[styles.cardDate, { fontFamily: 'Poppins-Medium', color: colors.textPrimary }]}>Total XP:</Text>
                    <Text style={[styles.cardDate, { fontFamily: 'Poppins-Bold', color: colors.primary }]}>{item.totalPoints || 0} XP</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={[styles.cardDate, { fontFamily: 'Poppins-Medium', color: colors.textPrimary }]}>Enrolled Courses:</Text>
                    <Text style={[styles.cardDate, { fontFamily: 'Poppins-Bold', color: colors.textSecondary }]}>{item.enrolledCount}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[styles.cardDate, { fontFamily: 'Poppins-Medium', color: colors.textPrimary }]}>Completed Courses:</Text>
                    <Text style={[styles.cardDate, { fontFamily: 'Poppins-Bold', color: colors.success }]}>{item.completedCount}</Text>
                </View>
            </View>
          </View>
        );
      }}
      ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyText}>No Students Found</Text></View>}
    />
  );
};

// ---------------------------------------------------------
// 4. SUB-VIEW: CERTIFICATES LEDGER (FIXED WITH PATH SPLITTER)
// ---------------------------------------------------------
const CertificatesView = ({ styles, colors }: any) => {
    const [certs, setCerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    useEffect(() => {
        const unsubscribe = firestore()
            .collectionGroup("certificates")
            .orderBy("issuedAt", "desc")
            .onSnapshot(async (snapshot) => {
                    const docs = snapshot?.docs || [];
                    
                    // 👉 FIXED: Deep Path Splitter to ALWAYS find Student Name
                    const fetched = await Promise.all(docs.map(async (doc) => {
                        const data = doc.data();
                        
                        // 1. Try to use the direct field if it exists
                        let fetchedName = data.userName || data.studentName;

                        // 2. If it's missing, climb up the database tree!
                        if (!fetchedName && doc.ref.path) {
                            const pathParts = doc.ref.path.split('/');
                            // Example Path: users/USER_ID/certificates/CERT_ID
                            if (pathParts[0] === 'users' && pathParts[1]) {
                                const userId = pathParts[1];
                                try {
                                    const userSnap = await firestore().collection("users").doc(userId).get();
                                    if (userSnap.exists()) {
                                        const uData = userSnap.data();
                                        // Grab First & Last name directly from the user's root profile
                                        const fullName = `${uData?.firstName || ''} ${uData?.lastName || ''}`.trim() || uData?.name;
                                        if (fullName) {
                                            fetchedName = fullName;
                                        }
                                    }
                                } catch (e) {
                                    console.log("Could not fetch user name:", e);
                                }
                            }
                        }

                        return { 
                            id: doc.id, 
                            ...data,
                            studentName: fetchedName || "Unknown Student"
                        };
                    }));
                    
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setCerts(fetched);
                    setLoading(false);
            }, () => setLoading(false));
        return () => unsubscribe();
    }, []);

    if (loading) return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />;

    return (
        <FlatList
            data={certs}
            keyExtractor={(item, index) => item.id || index.toString()}
            contentContainerStyle={styles.viewContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
            renderItem={({ item }) => (
                <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: colors.success }]}>
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.cardTitle, { color: colors.success }]}>{item.courseName || item.courseId || "Course Completed"}</Text>
                            <Text style={[styles.cardSubtitle, { marginTop: 4 }]}>
                                {/* 👉 Renders the perfectly resolved studentName */}
                                Student: <Text style={{ fontFamily: 'Poppins-Bold', color: colors.textPrimary }}>{item.studentName}</Text>
                            </Text>
                        </View>
                        <Image source={require("../Assets/certificate.png")} style={{ width: 34, height: 34, tintColor: colors.success }} />
                    </View>

                    <View style={{ backgroundColor: colors.background, padding: 12, borderRadius: 8, marginTop: 15 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text style={[styles.cardDate, { fontFamily: 'Poppins-Medium', color: colors.textPrimary }]}>Cert ID:</Text>
                            <Text style={[styles.cardDate, { fontFamily: 'Poppins-Bold', color: colors.textSecondary }]}>{item.certificateId || "N/A"}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={[styles.cardDate, { fontFamily: 'Poppins-Medium', color: colors.textPrimary }]}>Section:</Text>
                            <Text style={[styles.cardDate, { fontFamily: 'Poppins-Bold', color: colors.textSecondary }]}>{item.sectionId || "N/A"}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.cardDate}>
                            {item.issuedAt ? new Date(item.issuedAt.toDate ? item.issuedAt.toDate() : (item.issuedAt.seconds * 1000 || item.issuedAt)).toLocaleDateString() : "Just now"}
                        </Text>
                        <View style={{ backgroundColor: colors.success + '20', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 }}>
                            <Text style={[styles.cardDate, { fontSize: 10, color: colors.success, fontFamily: 'Poppins-Bold' }]}>VERIFIED</Text>
                        </View>
                    </View>

                </View>
            )}
            ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyText}>No Certificates Found</Text></View>}
        />
    );
};

// ---------------------------------------------------------
// MAIN ADMIN SCREEN
// ---------------------------------------------------------
export default function AdminDashboard() {
  const { styles, colors } = useThemeStyles(styleGenerator);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const colorScheme = useColorScheme(); 
  
  const TABS = ["Dashboard", "Feedback", "Users", "Certificates"];

  const handleTabChange = (tab: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case "Dashboard": return <AnalyticsView styles={styles} colors={colors} />;
      case "Feedback": return <FeedbacksView styles={styles} colors={colors} />;
      case "Users": return <UsersView styles={styles} colors={colors} />;
      case "Certificates": return <CertificatesView styles={styles} colors={colors} />;
      default: return <AnalyticsView styles={styles} colors={colors} />;
    }
  };

  return (
    <View style={styles.container}>
      <Modal visible={isMenuOpen} transparent animationType="fade">
          <TouchableOpacity style={styles.menuOverlay} onPress={() => setIsMenuOpen(false)}>
              <TouchableOpacity activeOpacity={1} style={styles.sideMenu}>
                  <View style={styles.menuHeader}>
                      <Image 
                        source={require("../Assets/Spalsh-img.png")} 
                        style={{ 
                            width: 150, 
                            height: 150, 
                            marginBottom: 10, 
                            tintColor: colorScheme === 'light' ? '#1f1f39' : '#FFFFFF' 
                        }} 
                        resizeMode="contain" 
                      />
                      <Text style={styles.menuHeaderTitle}>Admin</Text>
                  </View>
                  <View style={styles.menuItemsContainer}>
                      {TABS.map((tab) => (
                          <TouchableOpacity key={tab} 
                              style={[styles.menuItem, activeTab === tab && { backgroundColor: colors.primary + '15', borderRightWidth: 4, borderRightColor: colors.primary }]}
                              onPress={() => handleTabChange(tab)}>
                              <Text style={[styles.menuItemText, activeTab === tab && { color: colors.primary, fontFamily: 'Poppins-Bold' }]}>{tab}</Text>
                          </TouchableOpacity>
                      ))}
                  </View>
                  <View style={styles.menuFooter}>
                      <TouchableOpacity style={styles.menuLogoutBtn} onPress={() => auth().signOut()}><Text style={styles.menuLogoutText}>Log Out</Text></TouchableOpacity>
                  </View>
              </TouchableOpacity>
          </TouchableOpacity>
      </Modal>

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setIsMenuOpen(true)}><Image source={require("../Assets/menu.png")} style={styles.icon} /></TouchableOpacity>
        <View style={{ marginLeft: 15 }}><Text style={styles.greeting} numberOfLines={1} adjustsFontSizeToFit>Admin Portal</Text><Text style={styles.motivation}>{activeTab}</Text></View>
      </View>

      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {TABS.map((tab) => (
            <TouchableOpacity key={tab} style={[styles.tabButton, activeTab === tab && { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={() => handleTabChange(tab)}>
              <Text style={[styles.tabText, activeTab === tab && { color: "#FFF" }]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.contentArea}>{renderActiveView()}</View>
    </View>
  );
}

const styleGenerator = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: width * 0.05, paddingTop: Platform.OS === 'ios' ? 50 : 40, paddingBottom: 15 },
  greeting: { fontSize: 19, color: colors.textPrimary, fontFamily: "Poppins-Bold" },
  motivation: { fontSize: 12, color: colors.textSecondary, fontFamily: "Poppins-Medium", marginTop: -2 },
  icon: { width: 24, height: 24, tintColor: colors.icon },
  
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sideMenu: { width: '75%', height: '100%', backgroundColor: colors.card, elevation: 20 },
  menuHeader: { padding: 30, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: colors.border },
  menuHeaderTitle: { fontSize: 17, fontFamily: 'Poppins-Bold', color: colors.textPrimary },
  menuItemsContainer: { paddingTop: 20, flex: 1 },
  menuItem: { paddingVertical: 18, paddingHorizontal: 30 },
  menuItemText: { fontSize: 15, fontFamily: 'Poppins-Medium', color: colors.textPrimary },
  menuFooter: { padding: 30, borderTopWidth: 1, borderTopColor: colors.border },
  menuLogoutBtn: { backgroundColor: '#FF454515', padding: 14, borderRadius: 12, alignItems: 'center' },
  menuLogoutText: { color: '#FF4545', fontFamily: 'Poppins-Bold', fontSize: 14 },
  
  tabContainer: { paddingVertical: 10 },
  tabScroll: { paddingHorizontal: width * 0.05, gap: 12 },
  tabButton: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 25, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  tabText: { fontFamily: 'Poppins-Medium', fontSize: 12, color: colors.textSecondary },
  
  contentArea: { flex: 1 },
  viewContainer: { paddingHorizontal: width * 0.05, paddingBottom: 40 },
  sectionTitle: { fontSize: 17, fontFamily: 'Poppins-Bold', color: colors.textPrimary, marginBottom: 15 },

  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 28,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  heroBlobTop: {
    position: 'absolute',
    top: -50,
    right: -20,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  heroBlobBottom: {
    position: 'absolute',
    bottom: -60,
    left: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroLabel: { fontSize: 13, fontFamily: 'Poppins-Medium', color: 'rgba(255,255,255,0.8)' },
  heroValue: { fontSize: 47, fontFamily: 'Poppins-Bold', color: '#FFF', marginVertical: 5 },
  heroSubText: { fontSize: 11, fontFamily: 'Poppins-Regular', color: 'rgba(255,255,255,0.7)' },

  secondaryStatsContainer: { flexDirection: 'row', gap: 15 },
  secondaryCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 6,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    alignItems: 'center',
  },
  iconCircle: {
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 12
  },
  secondaryValue: { fontSize: 25, fontFamily: 'Poppins-Bold' },
  secondaryLabel: { fontSize: 11, fontFamily: 'Poppins-Medium', color: colors.textSecondary, marginTop: 2 },
  
  actionsGrid: { gap: 15 },
  actionGridCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  actionHalfCard: { flex: 1, flexDirection: 'column', alignItems: 'flex-start', padding: 18 },
  actionIconContainer: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 15, marginBottom: 10 },
  actionGridTitle: { fontSize: 15, fontFamily: 'Poppins-Bold', marginBottom: 2 },
  actionGridSub: { fontSize: 10, fontFamily: 'Poppins-Medium', color: colors.textSecondary, lineHeight: 16 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: colors.card, borderRadius: 20, padding: 24, elevation: 15, width: width > 400 ? 360 : "95%", alignSelf: 'center' },
  modalTitle: { fontSize: 19, fontFamily: 'Poppins-Bold', color: colors.textPrimary },
  modalSub: { fontSize: 12, fontFamily: 'Poppins-Regular', color: colors.textSecondary, marginBottom: 20 },
  modalInput: { backgroundColor: colors.background, borderRadius: 12, padding: 15, color: colors.textPrimary, minHeight: 120, textAlignVertical: 'top', marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  modalBtn: { flex: 1, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalBtnText: { color: '#FFF', fontFamily: 'Poppins-SemiBold', fontSize: 13 },
  exportOptionBtn: { padding: 15, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  exportOptionText: { fontSize: 13, fontFamily: 'Poppins-Medium', color: colors.textSecondary },

  card: { backgroundColor: colors.card, borderRadius: 20, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: colors.border },
  cardCompleted: { opacity: 0.5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  cardTitle: { fontSize: 15, fontFamily: 'Poppins-SemiBold', color: colors.textPrimary },
  cardSubtitle: { fontSize: 12, color: colors.textSecondary },
  cardDate: { fontSize: 10, color: colors.textSecondary },
  cardBody: { fontSize: 13, color: colors.textPrimary, lineHeight: 22 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 15 },
  
  avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontFamily: 'Poppins-Bold', fontSize: 17 },
  resolvedBadge: { backgroundColor: colors.success + '15', paddingVertical: 10, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  resolvedBadgeText: { color: colors.success, fontFamily: 'Poppins-SemiBold', fontSize: 13 },
  
  emptyContainer: { flex: 1, alignItems: 'center', marginTop: 50 },
  emptyText: { fontFamily: 'Poppins-Medium', color: colors.textSecondary, fontSize: 15 },
  
  actionBtnPrimary: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 16, alignItems: 'center' }
});