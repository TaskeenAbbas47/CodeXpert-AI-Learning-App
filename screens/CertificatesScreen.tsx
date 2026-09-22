/* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable react-native/no-inline-styles */
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   FlatList,
//   ActivityIndicator,
//   Modal,
//   SafeAreaView
// } from "react-native";
// import LottieView from "lottie-react-native";
// import { useNavigation } from "@react-navigation/native";
// import { useBackWithAnim } from "../hooks/useBackWithAnim";
// import auth from "@react-native-firebase/auth";
// import firestore from "@react-native-firebase/firestore";
// import { WebView } from 'react-native-webview'; // 👈 NEW: For in-app viewing

// import * as Print from 'expo-print';
// import * as Sharing from 'expo-sharing';

// import { useThemeStyles } from "../hooks/useThemeStyles";

// const COURSE_TITLES: Record<string, string> = {
//   python: "Python Track",
//   html: "HTML5 Fundamentals",
//   css: "CSS3 Styling",
//   javascript: "Modern JavaScript",
//   ml: "Machine Learning Track",
// };

// const getCourseColor = (courseId: string) => {
//   const id = courseId.toLowerCase();
//   if (id.includes("python")) return "#FF9800"; 
//   if (id.includes("html")) return "#E34F26";   
//   if (id.includes("css")) return "#1572B6";    
//   if (id.includes("java") || id.includes("js")) return "#F7DF1E"; 
//   return "#1F1F39"; 
// };

// const MOTIVATIONAL_QUOTES = [
//   "Every expert was once a beginner. Keep pushing!",
//   "The only way to learn a new programming language is by writing programs in it.",
//   "Small progress is still progress. Your certificate is waiting.",
//   "Don't watch the clock; do what it does. Keep going.",
//   "It always seems impossible until it's done.",
//   "Code is like humor. When you have to explain it, it’s bad. Write clean code!",
// ];

// type Certificate = {
//   id: string;
//   courseId: string;
//   dateEarned: any; 
// };

// export default function CertificatesScreen() {
//   const { styles, colors } = useThemeStyles(styleGenerator);
//   const navigation = useNavigation<any>();

//   const [loading, setLoading] = useState(true);
//   const [certificates, setCertificates] = useState<Certificate[]>([]);
//   const [quote, setQuote] = useState("");
//   const [showBackAnim, setShowBackAnim] = useState(false);
//   const [isGenerating, setIsGenerating] = useState(false);

//   // Real User Data
//   const [realUserName, setRealUserName] = useState("CodeXpert Student");

//   // Custom Alert Modal State
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertMessage, setAlertMessage] = useState("");

//   // In-App Preview Modal State
//   const [previewVisible, setPreviewVisible] = useState(false);
//   const [previewHtml, setPreviewHtml] = useState("");
//   const [selectedCertForPdf, setSelectedCertForPdf] = useState<Certificate | null>(null);

//   const playBackAnim = () =>
//     new Promise<void>((resolve) => {
//       setShowBackAnim(true);
//       setTimeout(() => resolve(), 600);
//     });

//   const { handleBackPress } = useBackWithAnim(playBackAnim, "HomeScreen");

//   useEffect(() => {
//     const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
//     setQuote(randomQuote);

//     const user = auth().currentUser;
//     if (!user) return;

//     // Fetch the real user name from Firestore profile
//     firestore()
//       .collection("users")
//       .doc(user.uid)
//       .get()
//       .then((doc) => {
//         if (doc.exists()) {
//           const userData = doc.data();
//           // Checks for 'name' or 'fullName' fields in your database
//           setRealUserName(userData?.name || userData?.fullName || user.displayName || "CodeXpert Student");
//         }
//       })
//       .catch((err) => console.log("Failed to fetch user name:", err));

//     // Listen for certificates
//     const unsubscribe = firestore()
//       .collection("users")
//       .doc(user.uid)
//       .collection("certificates")
//       .orderBy("issuedAt", "desc")
//       .onSnapshot((snapshot) => {
//         const fetchedCerts: Certificate[] = [];
//         snapshot.forEach((doc) => {
//           const data = doc.data();
//           fetchedCerts.push({
//             id: doc.id,
//             courseId: data.courseName || data.courseId || doc.id, 
//             dateEarned: data.issuedAt ? data.issuedAt.toDate().getTime() : Date.now(), 
//           });
//         });
//         setCertificates(fetchedCerts);
//         setLoading(false);
//       }, (error) => {
//         console.error("Error fetching certificates:", error);
//         setLoading(false);
//       });

//     return () => unsubscribe();
//   }, []);

//   const showAlert = (message: string) => {
//     setAlertMessage(message);
//     setAlertVisible(true);
//   };

//   // Centralized HTML Generator so Preview and PDF match exactly
//   const generateCertificateHTML = (cert: Certificate) => {
//     const courseTitle = COURSE_TITLES[cert.courseId] || cert.courseId.toUpperCase();
//     const issueDate = new Date(cert.dateEarned).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });

//     return `
//     <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=1100, minimum-scale=0.1" />
//   <style>
//     @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Poppins:wght@400;600;700&display=swap');
    
//     @page { size: A4 landscape; margin: 0; }
    
//     /* Make the background transparent so it blends with your modal */
//     body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: transparent; }
    
//     /* Lock the exact dimensions of an A4 paper in pixels */
//     .certificate-wrapper { width: 1100px; height: 780px; background: #fff; position: relative; box-sizing: border-box; padding: 25px; box-shadow: 0 15px 40px rgba(0,0,0,0.4); }
//     .border-thick { width: 100%; height: 100%; border: 12px solid #d4af37; box-sizing: border-box; padding: 10px; position: relative; }
//     .border-thin { width: 100%; height: 100%; border: 2px solid #d4af37; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; align-items: center; padding: 40px 40px 45px 40px; position: relative; background-image: radial-gradient(#f4f4f4 1px, transparent 1px); background-size: 20px 20px; }
    
//     .corner { position: absolute; width: 45px; height: 45px; border: 4px solid #d4af37; }
//     .top-left { top: 25px; left: 25px; border-bottom: none; border-right: none; }
//     .top-right { top: 25px; right: 25px; border-bottom: none; border-left: none; }
//     .bottom-left { bottom: 25px; left: 25px; border-top: none; border-right: none; }
//     .bottom-right { bottom: 25px; right: 25px; border-top: none; border-left: none; }
    
//     .top-section { text-align: center; display: flex; flex-direction: column; align-items: center; margin-top: 20px; }
//     .middle-section { text-align: center; display: flex; flex-direction: column; align-items: center; width: 80%; }
//     .bottom-section { display: flex; justify-content: space-between; align-items: center; width: 90%; margin-bottom: 20px; }
    
//     /* Locked Font Sizes */
//     .title { font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 50px; color: #1f1f39; margin: 0; letter-spacing: 8px; }
//     .subtitle { font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 18px; color: #1f1f39; letter-spacing: 10px; margin: 5px 0 0 0; }
//     .presented-to { font-family: 'Poppins', sans-serif; font-weight: 400; font-size: 14px; color: #1f1f39; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 20px; }
//     .name { font-family: 'Great Vibes', cursive; font-size: 72px; color: #1f1f39; margin: 0; border-bottom: 2px solid #1f1f39; padding-bottom: 5px; width: 100%; line-height: 1; white-space: nowrap; }
//     .reason { font-family: 'Poppins', sans-serif; font-weight: 400; font-size: 14px; color: #1f1f39; margin-top: 30px; line-height: 1.6; }
//     .course { font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 32px; color: #1f1f39; margin-top: 20px; margin-bottom: 0; }
    
//     .signature-box { width: 300px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; }
//     .sig-line { width: 250px; border-bottom: 1px solid #1f1f39; margin-bottom: 8px; }
//     .sig-text { font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 15px; color: #1f1f39; display: block; margin-bottom: 5px; }
//     .sig-label { font-family: 'Poppins', sans-serif; font-weight: 400; font-size: 10px; color: #1f1f39; text-transform: uppercase; letter-spacing: 1px; }
    
//     .authority-signature { 
//       max-height: 150px; 
//       width: auto; 
//       max-width: 350px; 
//       object-fit: contain; 
//       margin-bottom: -20px; 
//       z-index: 1; 
//     }

//     /* Locked Seal Sizes */
//     .seal { width: 110px; height: 110px; background: linear-gradient(135deg, #F3E2A9 0%, #D4AF37 50%, #AA7700 100%); border-radius: 50%; display: flex; justify-content: center; align-items: center; position: relative; box-shadow: 0 5px 15px rgba(0,0,0,0.3), inset 0 0 10px rgba(255,255,255,0.6); border: 2px solid #a67312; }
//     .seal::before { content: ''; position: absolute; top: 6%; left: 6%; right: 6%; bottom: 6%; border: 1.5px dashed #fff; border-radius: 50%; background: radial-gradient(circle, #D4AF37 40%, #c18a22 100%); box-shadow: inset 0 0 5px rgba(0,0,0,0.2); }
//     .seal-content { position: relative; z-index: 2; text-align: center; color: #fff; text-shadow: 1px 1px 3px rgba(0,0,0,0.5); display: flex; flex-direction: column; align-items: center; }
//     .seal-top { font-family: 'Poppins', sans-serif; font-size: 8px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; margin-bottom: 2px;}
//     .seal-mid { font-family: 'Poppins', sans-serif; font-size: 20px; font-weight: 700; line-height: 1; margin: 0; }
//     .seal-bot { font-family: 'Poppins', sans-serif; font-size: 7px; letter-spacing: 1px; text-transform: uppercase; border-top: 1px solid rgba(255,255,255,0.5); padding-top: 2px; margin-top: 3px;}
//   </style>
// </head>
// <body>
//   <div class="certificate-wrapper">
//     <div class="border-thick">
//       <div class="border-thin">
//         <div class="corner top-left"></div><div class="corner top-right"></div>
//         <div class="corner bottom-left"></div><div class="corner bottom-right"></div>
        
//         <div class="top-section">
//           <h1 class="title">CERTIFICATE</h1>
//           <h2 class="subtitle">OF COMPLETION</h2>
//         </div>
        
//         <div class="middle-section">
//           <p class="presented-to">This certificate is proudly presented to</p>
//           <h2 class="name">${realUserName}</h2>
//           <p class="reason">For successfully completing the comprehensive curriculum and demonstrating outstanding mastery in the following field of study:</p>
//           <h3 class="course">${courseTitle}</h3>
//         </div>
        
//         <div class="bottom-section">
//           <div class="signature-box">
//             <span class="sig-text">${issueDate}</span>
//             <div class="sig-line"></div>
//             <span class="sig-label">Date Issued</span>
//           </div>
          
//           <div class="seal">
//             <div class="seal-content">
//               <span class="seal-top">Official</span>
//               <span class="seal-mid">Code<br/>Xpert</span>
//               <span class="seal-bot">Certified</span>
//             </div>
//           </div>
          
//           <div class="signature-box">
//            <img src='data:image/png;base64,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' alt="Authorised Signature" class="authority-signature" />
//             <div class="sig-line"></div>
//             <span class="sig-text">CodeXpert</span>
//             <span class="sig-label">Issuing Authority</span>
//           </div>
//         </div>

//       </div>
//     </div>
//   </div>
// </body>
// </html>
//     `;
//   };

//   // 1. Opens the In-App Preview Modal
//   const handleOpenPreview = (cert: Certificate) => {
//     setSelectedCertForPdf(cert);
//     setPreviewHtml(generateCertificateHTML(cert));
//     setPreviewVisible(true);
//   };

//   // 2. Generates the actual PDF file from the preview
//   const handleDownloadPDF = async () => {
//     if (!selectedCertForPdf) return;
    
//     setIsGenerating(true); 
//     try {
//       const { uri } = await Print.printToFileAsync({
//         html: previewHtml,
//         base64: false,
//       });
      
//       await Sharing.shareAsync(uri, {
//         mimeType: 'application/pdf',
//         dialogTitle: 'Save your Certificate',
//         UTI: 'com.adobe.pdf' 
//       });

//       setIsGenerating(false);
//     } catch (error) {
//       console.error("PDF Gen Error:", error);
//       setIsGenerating(false);
//       showAlert("Oops! Something went wrong while generating your certificate.");
//     }
//   };

//   const renderItem = ({ item }: { item: Certificate }) => {
//     const title = COURSE_TITLES[item.courseId] || item.courseId.toUpperCase();
//     const date = new Date(item.dateEarned).toLocaleDateString();
//     const themeColor = getCourseColor(item.courseId);

//     return (
//       <TouchableOpacity 
//         style={[styles.card, { borderColor: `${themeColor}40` }]}
//         onPress={() => handleOpenPreview(item)} // 👈 Now opens preview on click
//         activeOpacity={0.7}
//       >
//         <View style={styles.cardLeft}>
//             <View style={[styles.iconContainer, { backgroundColor: `${themeColor}15`, borderColor: `${themeColor}50` }]}>
//                 <Image source={require("../Assets/certificate.png")} style={[styles.certIcon, { tintColor: themeColor }]} resizeMode="contain" />
//             </View>
//             <View style={styles.textContainer}>
//                 <Text style={styles.certTitle}>{title}</Text>
//                 <Text style={styles.certSubtitle}>Issued: {date}</Text>
//                 <Text style={[styles.certSubtitle, { color: themeColor, marginTop: 4, fontSize: 10, fontFamily: 'Poppins-SemiBold' }]}>Tap to view</Text>
//             </View>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       {showBackAnim && (
//         <View style={styles.backAnimOverlay}>
//           <LottieView source={require("../Assets/backAnimation.json")} autoPlay loop={false} style={styles.backAnim} />
//         </View>
//       )}

//       {/* --- IN-APP PREVIEW MODAL --- */}
//       <Modal visible={previewVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setPreviewVisible(false)}>
        
//         <SafeAreaView style={styles.previewContainer}>
          
//           {/* Header */}
//           <View style={styles.previewHeader}>
//             <TouchableOpacity onPress={() => setPreviewVisible(false)} style={styles.closeBtn}>
//               <Text style={styles.closeBtnText}>Close</Text>
//             </TouchableOpacity>
//             <Text style={styles.previewTitle}>Certificate Preview</Text>
//             <View style={{ width: 50 }} /> 
            
//           </View>

//           {/* Webview displays the HTML certificate beautifully */}
//           <WebView 
//             source={{ html: previewHtml }} 
//             style={styles.webview} 
//             scalesPageToFit={true}
//             showsHorizontalScrollIndicator={false}
//             showsVerticalScrollIndicator={false}

//           />

//           {/* Download Button */}
//           <View style={styles.previewFooter}>
//             <TouchableOpacity 
//               style={styles.downloadBtn} 
//               onPress={handleDownloadPDF}
//               disabled={isGenerating}
//             >
//               {isGenerating ? (
//                 <ActivityIndicator color="#fff" />
//               ) : (
//                 <Text style={styles.downloadBtnText}>Save / Share as PDF</Text>
//               )}
//             </TouchableOpacity>
//           </View>
//         </SafeAreaView>
//       </Modal>

//       {/* CUSTOM ALERT MODAL */}
//       <Modal transparent visible={alertVisible} animationType="fade" onRequestClose={() => setAlertVisible(false)}>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Notice</Text>
//             <Text style={styles.modalText}>{alertMessage}</Text>
//             <TouchableOpacity onPress={() => setAlertVisible(false)} style={styles.modalBtn}>
//               <Text style={styles.modalBtnText}>Got it</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       {/* Main Screen Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={handleBackPress}>
//           <Image source={require("../Assets/back.png")} style={[styles.backIcon, { tintColor: colors.icon }]} />
//         </TouchableOpacity>
//         <Text style={styles.headerText}>My Certificates</Text>
//       </View>

//       {/* Content */}
//       {loading ? (
//         <View style={styles.center}>
//             <ActivityIndicator size="large" color="#1F1F39" />
//         </View>
//       ) : certificates.length === 0 ? (
//         <View style={styles.emptyState}>
//             <LottieView source={require("../Assets/nothing.json")} autoPlay loop style={styles.emptyAnim} />
//             <Text style={styles.emptyTitle}>No Certificates Yet</Text>
//             <Text style={styles.quoteText}>“{quote}”</Text>
//             <TouchableOpacity style={styles.startBtn} onPress={() => navigation.navigate("HomeScreen")}>
//                 <Text style={styles.startBtnText}>Start Learning</Text>
//             </TouchableOpacity>
//         </View>
//       ) : (
//         <FlatList
//           data={certificates}
//           keyExtractor={(item) => item.id}
//           renderItem={renderItem}
//           contentContainerStyle={styles.list}
//           showsVerticalScrollIndicator={false}
//         />
//       )}
//     </View>
//   );
// }

// const styleGenerator = (colors: any) => StyleSheet.create({
//   container: { flex: 1, backgroundColor: colors.background, padding: 20 },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   header: { flexDirection: "row", alignItems: "center", marginBottom: 20, paddingBottom: 10, },
//   backIcon: { width: 24, height: 24, marginRight: 15, resizeMode: "contain" },
//   headerText: { color: colors.textPrimary, fontSize: 22, fontFamily: "Poppins-SemiBold" },
//   list: { paddingBottom: 40 },
//   card: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, elevation: 3, },
//   cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, },
//   iconContainer: { width: 50, height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center", marginRight: 14, borderWidth: 1, },
//   certIcon: { width: 28, height: 28, },
//   textContainer: { flex: 1, },
//   certTitle: { color: colors.textPrimary, fontSize: 16, fontFamily: "Poppins-SemiBold", marginBottom: 2, },
//   certSubtitle: { color: colors.textSecondary, fontSize: 12, fontFamily: "Poppins-Regular", },
//   emptyState: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: -40, paddingHorizontal: 20 },
//   emptyAnim: { width: 250, height: 250, },
//   emptyTitle: { color: colors.textPrimary, fontSize: 20, fontFamily: "Poppins-Bold", marginBottom: 10 },
//   quoteText: { color: colors.textSecondary, fontSize: 15, fontFamily: "Poppins-Italic", fontStyle: 'italic', textAlign: "center", marginBottom: 30, lineHeight: 24, opacity: 0.8 },
//   startBtn: { backgroundColor: "#1F1F39", paddingVertical: 14, paddingHorizontal: 30, borderRadius: 30, elevation: 5 },
//   startBtnText: { color: "#fff", fontFamily: "Poppins-SemiBold", fontSize: 16, },
//   backAnimOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.background, justifyContent: "center", alignItems: "center", zIndex: 100, },
//   backAnim: { width: 200, height: 200 },
//   modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center', },
//   modalContent: { width: '85%', backgroundColor: colors.card, borderRadius: 20, padding: 25, alignItems: 'center', elevation: 10, borderWidth: 1, borderColor: '#1F1F3920', },
//   modalTitle: { fontFamily: 'Poppins-Bold', fontSize: 20, color: '#1F1F39', marginBottom: 10, },
//   modalText: { fontFamily: 'Poppins-Regular', fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 20, lineHeight: 22, },
//   modalBtn: { backgroundColor: '#1F1F39', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 25, width: '100%', alignItems: 'center', },
//   modalBtnText: { color: '#FFF', fontFamily: 'Poppins-SemiBold', fontSize: 16, },
  
//   // Preview Modal Styles
//   previewContainer: { flex: 1, backgroundColor: '#f5f5f5' },
//   previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e0e0e0' },
//   closeBtn: { padding: 5 },
//   closeBtnText: { color: '#FF3B30', fontSize: 16, fontFamily: 'Poppins-Medium' },
//   previewTitle: { fontSize: 16, fontFamily: 'Poppins-SemiBold', color: '#1F1F39' },
//   webview: { flex: 1, backgroundColor: '#2a2a2a' },
//   previewFooter: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#e0e0e0' },
//   downloadBtn: { backgroundColor: '#1F1F39', padding: 16, borderRadius: 12, alignItems: 'center' },
//   downloadBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Poppins-SemiBold' }
// });
/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Modal,
  SafeAreaView
} from "react-native";
import LottieView from "lottie-react-native";
import { useNavigation } from "@react-navigation/native";
import { useBackWithAnim } from "../hooks/useBackWithAnim";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { WebView } from 'react-native-webview';

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { useThemeStyles } from "../hooks/useThemeStyles";

const COURSE_TITLES: Record<string, string> = {
  python: "Python Track",
  html: "HTML5 Fundamentals",
  css: "CSS3 Styling",
  javascript: "Modern JavaScript",
  ml: "Machine Learning Track",
};

const getCourseColor = (courseId: string) => {
  const id = courseId.toLowerCase();
  if (id.includes("python")) return "#FF9800"; 
  if (id.includes("html")) return "#E34F26";   
  if (id.includes("css")) return "#1572B6";    
  if (id.includes("java") || id.includes("js")) return "#F7DF1E"; 
  return "#1F1F39"; 
};

const MOTIVATIONAL_QUOTES = [
  "Every expert was once a beginner. Keep pushing!",
  "The only way to learn a new programming language is by writing programs in it.",
  "Small progress is still progress. Your certificate is waiting.",
  "Don't watch the clock; do what it does. Keep going.",
  "It always seems impossible until it's done.",
  "Code is like humor. When you have to explain it, it’s bad. Write clean code!",
];

type Certificate = {
  id: string;
  courseId: string;
  dateEarned: any; 
};

export default function CertificatesScreen() {
  const { styles, colors } = useThemeStyles(styleGenerator);
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [quote, setQuote] = useState("");
  const [showBackAnim, setShowBackAnim] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize with a generic string but update immediately in useEffect
  const [realUserName, setRealUserName] = useState("Student");

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [selectedCertForPdf, setSelectedCertForPdf] = useState<Certificate | null>(null);

  const playBackAnim = () =>
    new Promise<void>((resolve) => {
      setShowBackAnim(true);
      setTimeout(() => resolve(), 600);
    });

  const { handleBackPress } = useBackWithAnim(playBackAnim, "HomeScreen");

  useEffect(() => {
    const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    setQuote(randomQuote);

    const user = auth().currentUser;
    if (!user) return;

    // STEP 1: Immediate fallback from Auth to avoid "CodeXpert Student"
    if (user.displayName) {
      setRealUserName(user.displayName);
    }

    // STEP 2: Fetch the definitive name from Firestore
    const unsubscribeUser = firestore()
      .collection("users")
      .doc(user.uid)
      .onSnapshot((doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          const fetchedName = userData?.name || userData?.fullName || user.displayName || "CodeXpert Student";
          setRealUserName(fetchedName);
        }
      }, (err) => console.log("Failed to fetch user name:", err));

    // STEP 3: Listen for certificates
    const unsubscribeCerts = firestore()
      .collection("users")
      .doc(user.uid)
      .collection("certificates")
      .orderBy("issuedAt", "desc")
      .onSnapshot((snapshot) => {
        const fetchedCerts: Certificate[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          fetchedCerts.push({
            id: doc.id,
            courseId: data.courseName || data.courseId || doc.id, 
            dateEarned: data.issuedAt ? data.issuedAt.toDate().getTime() : Date.now(), 
          });
        });
        setCertificates(fetchedCerts);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching certificates:", error);
        setLoading(false);
      });

    return () => {
      unsubscribeUser();
      unsubscribeCerts();
    };
  }, []);

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const generateCertificateHTML = (cert: Certificate) => {
    const courseTitle = COURSE_TITLES[cert.courseId] || cert.courseId.toUpperCase();
    const issueDate = new Date(cert.dateEarned).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1100, minimum-scale=0.1" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Poppins:wght@400;600;700&display=swap');
    @page { size: A4 landscape; margin: 0; }
    body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: transparent; }
    .certificate-wrapper { width: 1100px; height: 780px; background: #fff; position: relative; box-sizing: border-box; padding: 25px; box-shadow: 0 15px 40px rgba(0,0,0,0.4); }
    .border-thick { width: 100%; height: 100%; border: 12px solid #d4af37; box-sizing: border-box; padding: 10px; position: relative; }
    .border-thin { width: 100%; height: 100%; border: 2px solid #d4af37; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; align-items: center; padding: 40px 40px 45px 40px; position: relative; background-image: radial-gradient(#f4f4f4 1px, transparent 1px); background-size: 20px 20px; }
    .corner { position: absolute; width: 45px; height: 45px; border: 4px solid #d4af37; }
    .top-left { top: 25px; left: 25px; border-bottom: none; border-right: none; }
    .top-right { top: 25px; right: 25px; border-bottom: none; border-left: none; }
    .bottom-left { bottom: 25px; left: 25px; border-top: none; border-right: none; }
    .bottom-right { bottom: 25px; right: 25px; border-top: none; border-left: none; }
    .title { font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 50px; color: #1f1f39; margin: 0; letter-spacing: 8px; }
    .subtitle { font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 18px; color: #1f1f39; letter-spacing: 10px; margin: 5px 0 0 0; }
    .presented-to { font-family: 'Poppins', sans-serif; font-weight: 400; font-size: 14px; color: #1f1f39; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 20px; }
    .name { font-family: 'Great Vibes', cursive; font-size: 72px; color: #1f1f39; margin: 0; border-bottom: 2px solid #1f1f39; padding-bottom: 5px; width: 100%; line-height: 1; white-space: nowrap; text-align:center; }
    .reason { font-family: 'Poppins', sans-serif; font-weight: 400; font-size: 14px; color: #1f1f39; margin-top: 30px; line-height: 1.6; text-align: center; }
    .course { font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 32px; color: #1f1f39; margin-top: 20px; margin-bottom: 0; text-align: center; }
    .bottom-section { display: flex; justify-content: space-between; align-items: center; width: 90%; margin-bottom: 20px; }
    .signature-box { width: 300px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; }
    .sig-line { width: 250px; border-bottom: 1px solid #1f1f39; margin-bottom: 8px; }
    .sig-text { font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 15px; color: #1f1f39; display: block; margin-bottom: 5px; }
    .sig-label { font-family: 'Poppins', sans-serif; font-weight: 400; font-size: 10px; color: #1f1f39; text-transform: uppercase; letter-spacing: 1px; }
    .seal { width: 110px; height: 110px; background: linear-gradient(135deg, #F3E2A9 0%, #D4AF37 50%, #AA7700 100%); border-radius: 50%; display: flex; justify-content: center; align-items: center; position: relative; border: 2px solid #a67312; }
    .seal-mid { font-family: 'Poppins', sans-serif; font-size: 20px; font-weight: 700; color: #fff; }
  </style>
</head>
<body>
  <div class="certificate-wrapper">
    <div class="border-thick">
      <div class="border-thin">
        <div class="corner top-left"></div><div class="corner top-right"></div>
        <div class="corner bottom-left"></div><div class="corner bottom-right"></div>
        <div class="top-section" style="text-align:center;">
          <h1 class="title">CERTIFICATE</h1>
          <h2 class="subtitle">OF COMPLETION</h2>
        </div>
        <div class="middle-section" style="text-align:center; width:80%;">
          <p class="presented-to">This certificate is proudly presented to</p>
          <h2 class="name">${realUserName}</h2>
          <p class="reason">For successfully completing the comprehensive curriculum and demonstrating outstanding mastery in the following field of study:</p>
          <h3 class="course">${courseTitle}</h3>
        </div>
        <div class="bottom-section">
          <div class="signature-box">
            <span class="sig-text">${issueDate}</span>
            <div class="sig-line"></div>
            <span class="sig-label">Date Issued</span>
          </div>
          <div class="seal"><div class="seal-mid">CodeXpert</div></div>
          <div class="signature-box">
            <div class="sig-line"></div>
            <span class="sig-text">CodeXpert</span>
            <span class="sig-label">Issuing Authority</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  };

  const handleOpenPreview = (cert: Certificate) => {
    setSelectedCertForPdf(cert);
    // Re-generate HTML with current realUserName state
    setPreviewHtml(generateCertificateHTML(cert));
    setPreviewVisible(true);
  };

  const handleDownloadPDF = async () => {
    if (!selectedCertForPdf) return;
    setIsGenerating(true); 
    try {
      const { uri } = await Print.printToFileAsync({
        html: previewHtml,
        base64: false,
      });
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Save your Certificate',
        UTI: 'com.adobe.pdf' 
      });
      setIsGenerating(false);
    } catch (error) {
      setIsGenerating(false);
      showAlert("Oops! Something went wrong.");
    }
  };

  const renderItem = ({ item }: { item: Certificate }) => {
    const title = COURSE_TITLES[item.courseId] || item.courseId.toUpperCase();
    const date = new Date(item.dateEarned).toLocaleDateString();
    const themeColor = getCourseColor(item.courseId);

    return (
      <TouchableOpacity 
        style={[styles.card, { borderColor: `${themeColor}40` }]}
        onPress={() => handleOpenPreview(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardLeft}>
            <View style={[styles.iconContainer, { backgroundColor: `${themeColor}15`, borderColor: `${themeColor}50` }]}>
                <Image source={require("../Assets/certificate.png")} style={[styles.certIcon, { tintColor: themeColor }]} resizeMode="contain" />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.certTitle}>{title}</Text>
                <Text style={styles.certSubtitle}>Issued: {date}</Text>
                <Text style={[styles.certSubtitle, { color: themeColor, marginTop: 4, fontSize: 10, fontFamily: 'Poppins-SemiBold' }]}>Tap to view</Text>
            </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {showBackAnim && (
        <View style={styles.backAnimOverlay}>
          <LottieView source={require("../Assets/backAnimation.json")} autoPlay loop={false} style={styles.backAnim} />
        </View>
      )}

      <Modal visible={previewVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setPreviewVisible(false)}>
        <SafeAreaView style={styles.previewContainer}>
          <View style={styles.previewHeader}>
            <TouchableOpacity onPress={() => setPreviewVisible(false)} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.previewTitle}>Certificate Preview</Text>
            <View style={{ width: 50 }} /> 
          </View>
          <WebView source={{ html: previewHtml }} style={styles.webview} scalesPageToFit={true} />
          <View style={styles.previewFooter}>
            <TouchableOpacity style={styles.downloadBtn} onPress={handleDownloadPDF} disabled={isGenerating}>
              {isGenerating ? <ActivityIndicator color="#fff" /> : <Text style={styles.downloadBtnText}>Save / Share as PDF</Text>}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal transparent visible={alertVisible} animationType="fade" onRequestClose={() => setAlertVisible(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}><Text style={styles.modalBtnText}>Notice</Text><Text style={styles.modalText}>{alertMessage}</Text></View></View>
      </Modal>

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Image source={require("../Assets/back.png")} style={[styles.backIcon, { tintColor: colors.icon }]} />
        </TouchableOpacity>
        <Text style={styles.headerText}>My Certificates</Text>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#1F1F39" /></View>
      ) : certificates.length === 0 ? (
        <View style={styles.emptyState}>
            <LottieView source={require("../Assets/nothing.json")} autoPlay loop style={styles.emptyAnim} />
            <Text style={styles.emptyTitle}>No Certificates Yet</Text>
            <Text style={styles.quoteText}>“{quote}”</Text>
        </View>
      ) : (
        <FlatList data={certificates} keyExtractor={(item) => item.id} renderItem={renderItem} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} />
      )}
    </View>
  );
}

const styleGenerator = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20, paddingBottom: 10, },
  backIcon: { width: 24, height: 24, marginRight: 15, resizeMode: "contain" },
  headerText: { color: colors.textPrimary, fontSize: 22, fontFamily: "Poppins-SemiBold" },
  list: { paddingBottom: 40 },
  card: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, elevation: 3, },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, },
  iconContainer: { width: 50, height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center", marginRight: 14, borderWidth: 1, },
  certIcon: { width: 28, height: 28, },
  textContainer: { flex: 1, },
  certTitle: { color: colors.textPrimary, fontSize: 16, fontFamily: "Poppins-SemiBold", marginBottom: 2, },
  certSubtitle: { color: colors.textSecondary, fontSize: 12, fontFamily: "Poppins-Regular", },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: -40, paddingHorizontal: 20 },
  emptyAnim: { width: 250, height: 250, },
  emptyTitle: { color: colors.textPrimary, fontSize: 20, fontFamily: "Poppins-Bold", marginBottom: 10 },
  quoteText: { color: colors.textSecondary, fontSize: 15, fontFamily: "Poppins-Italic", fontStyle: 'italic', textAlign: "center", marginBottom: 30, lineHeight: 24, opacity: 0.8 },
  backAnimOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.background, justifyContent: "center", alignItems: "center", zIndex: 100, },
  backAnim: { width: 200, height: 200 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center', },
  modalContent: { width: '85%', backgroundColor: colors.card, borderRadius: 20, padding: 25, alignItems: 'center', elevation: 10, borderWidth: 1, borderColor: '#1F1F3920', },
  modalText: { fontFamily: 'Poppins-Regular', fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 20, lineHeight: 22, },
  modalBtnText: { color: '#1F1F39', fontFamily: 'Poppins-SemiBold', fontSize: 16, },
  previewContainer: { flex: 1, backgroundColor: '#f5f5f5' },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e0e0e0' },
  closeBtn: { padding: 5 },
  closeBtnText: { color: '#FF3B30', fontSize: 16, fontFamily: 'Poppins-Medium' },
  previewTitle: { fontSize: 16, fontFamily: 'Poppins-SemiBold', color: '#1F1F39' },
  webview: { flex: 1, backgroundColor: '#fff' },
  previewFooter: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#e0e0e0' },
  downloadBtn: { backgroundColor: '#1F1F39', padding: 16, borderRadius: 12, alignItems: 'center' },
  downloadBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Poppins-SemiBold' }
});