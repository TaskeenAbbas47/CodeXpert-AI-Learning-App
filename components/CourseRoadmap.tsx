// /* eslint-disable react-native/no-inline-styles */
// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   FlatList,
//   Dimensions,
// } from "react-native";
// import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
// import { useThemeStyles } from "../hooks/useThemeStyles";

// const { width } = Dimensions.get("window");

// export type LevelType = {
//   id: string;
//   title: string;
//   unlocked: boolean;
//   completed?: boolean; // ✅ Added to track completion status
// };

// type Props = {
//   title: string;
//   subtitle: string;
//   progress: number;
//   levels: LevelType[];
//   onLevelPress: (level: LevelType) => void;
//   iconCenter?: any;
//   onCenterPress?: () => void;
//   iconLanguage?: any;
// };

// export default function CourseRoadmap({
//   subtitle,
//   progress,
//   levels,
//   onLevelPress,
//   // iconCenter = require("../Assets/assist1.png"),
//   // onCenterPress,
//   iconLanguage,
// }: Props) {
  
//   const { styles, colors } = useThemeStyles(styleGenerator);

//   // Helper: Shorten titles like "Module 1: Basics" -> "Basics"
//   const formatLevelTitle = (text: string) => {
//     if (!text) return "Lesson";
//     const parts = text.split(": ");
//     return parts.length > 1 ? parts[1] : text;
//   };

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.headerCompact}>
//         <View style={styles.headerLeft}>
//           {iconLanguage ? (
//             <Image source={iconLanguage} style={styles.langIcon} />
//           ) : (
//             <MaterialCommunityIcons name="language-python" size={24} color={colors.primary} />
//           )}
//         </View>

//         <View style={styles.headerMid}>
//           <Text style={styles.headerTitle} numberOfLines={1}>
//             {subtitle}
//           </Text>
//         </View>

//         <View style={styles.progressBadge}>
//           <Text style={styles.progressText}>{progress}%</Text>
//         </View>
//       </View>

//       {/* Levels Grid */}
//       <FlatList
//         data={levels}
//         numColumns={2}
//         keyExtractor={(item) => item.id}
//         contentContainerStyle={styles.gridContainer}
//         showsVerticalScrollIndicator={false}
//         renderItem={({ item }) => {
          
//           // --- Icon Logic ---
//           let iconName = "lock-outline";
//           let iconColor = colors.textSecondary;
//           let boxStyle = styles.levelBox;

//           if (item.completed) {
//             iconName = "check-decagram"; // ✅ Star/Check for Complete
//             iconColor = colors.success; // Green/Gold
//             boxStyle = styles.levelBoxCompleted;
//           } else if (item.unlocked) {
//             iconName = "lock-open-variant-outline"; // ✅ Open Lock for Current
//             iconColor = colors.primary; // Blue
//             boxStyle = styles.levelBoxUnlocked;
//           }

//           return (
//             <TouchableOpacity
//               style={[boxStyle]}
//               disabled={!item.unlocked}
//               onPress={() => onLevelPress(item)}
//             >
//               <MaterialCommunityIcons 
//                 name={iconName} 
//                 size={32} 
//                 color={iconColor} 
//                 style={{ marginBottom: 10 }}
//               />
              
//               <Text style={styles.levelNum}>Level {item.id}</Text>
              
//               <Text
//                 style={[
//                   styles.levelText,
//                   item.unlocked && { color: colors.textPrimary },
//                 ]}
//                 numberOfLines={2}
//               >
//                 {formatLevelTitle(item.title)}
//               </Text>
//             </TouchableOpacity>
//           );
//         }}
//       />

//       {/* Floating Center Button */}
//       {/* {onCenterPress && (
//         <TouchableOpacity
//           style={styles.centerButton}
//           onPress={onCenterPress}
//         >
//           <Image source={iconCenter} style={styles.centerButtonIcon} />
//         </TouchableOpacity>
//       )} */}
//     </View>
//   );
// }

// // Style Generator
// const styleGenerator = (colors: any) => StyleSheet.create({
//   container: { flex: 1, backgroundColor: colors.background, alignItems: "center" },

//   // --- Header ---
//   headerCompact: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     width: "92%",
//     marginTop: 20,
//     backgroundColor: colors.card,
//     borderRadius: 12,
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderWidth: 1,
//     borderColor: colors.border || 'transparent',
//   },
//   headerLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },
//   langIcon: {
//     width: 26,
//     height: 26,
//     resizeMode: "contain",
//   },
//   headerMid: {
//     flex: 1,
//     marginHorizontal: 10,
//   },
//   headerTitle: {
//     color: colors.textPrimary,
//     fontSize: 14,
//     fontFamily: "Poppins-SemiBold",
//   },
//   progressBadge: {
//     backgroundColor: colors.background,
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: colors.primary,
//   },
//   progressText: {
//     color: colors.primary,
//     fontSize: 12,
//     fontFamily: "Poppins-Bold",
//   },

//   // --- Levels Grid ---
//   gridContainer: {
//     alignItems: "center",
//     paddingTop: 20,
//     paddingBottom: 100,
//   },
//   // Base Box (Locked)
//   levelBox: {
//     width: width * 0.42,
//     height: 140,
//     backgroundColor: colors.card,
//     borderRadius: 16,
//     justifyContent: "center",
//     alignItems: "center",
//     margin: 8,
//     borderWidth: 2,
//     borderColor: colors.border || "#333", // Dark border for locked
//     padding: 10,
//     opacity: 0.7,
//   },
//   // Unlocked (Active)
//   levelBoxUnlocked: {
//     width: width * 0.42,
//     height: 140,
//     backgroundColor: colors.card,
//     borderRadius: 16,
//     justifyContent: "center",
//     alignItems: "center",
//     margin: 8,
//     padding: 10,
//     borderWidth: 2,
//     borderColor: colors.primary, // Highlight border
//     opacity: 1,
//     shadowColor: colors.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 5,
//     elevation: 4,
//   },
//   // Completed
//   levelBoxCompleted: {
//     width: width * 0.42,
//     height: 140,
//     backgroundColor: colors.card,
//     borderRadius: 16,
//     justifyContent: "center",
//     alignItems: "center",
//     margin: 8,
//     padding: 10,
//     borderWidth: 2,
//     borderColor: colors.success, // Green border
//     opacity: 1,
//   },

//   levelNum: {
//     color: colors.textSecondary,
//     fontSize: 10,
//     textTransform: 'uppercase',
//     fontFamily: "Poppins-Bold",
//     marginBottom: 4
//   },
//   levelText: {
//     fontSize: 13,
//     color: colors.textSecondary,
//     fontFamily: "Poppins-Medium",
//     textAlign: "center",
//   },

//   // --- Floating Button ---
//   centerButton: {
//     position: "absolute",
//     bottom: 30,
//     alignSelf: "center",
//     backgroundColor: colors.card,
//     borderRadius: 40,
//     padding: 16,
//     borderWidth: 2,
//     borderColor: colors.primary,
//     elevation: 8,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//   },
//   centerButtonIcon: {
//     width: 32,
//     height: 32,
//     tintColor: colors.primary,
//   },
// });
/* eslint-disable react-native/no-inline-styles */
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useThemeStyles } from "../hooks/useThemeStyles";

const { width } = Dimensions.get("window");

export type LevelType = {
  id: string;
  title: string;
  unlocked: boolean;
  completed?: boolean; 
  isFinalLesson?: boolean; // 🟢 ADDED: Let the type know this might exist
};

type Props = {
  title: string;
  subtitle: string;
  progress: number;
  levels: LevelType[];
  onLevelPress: (level: LevelType) => void;
  iconCenter?: any;
  onCenterPress?: () => void;
  iconLanguage?: any;
};

export default function CourseRoadmap({
  subtitle,
  progress,
  levels,
  onLevelPress,
  iconLanguage,
}: Props) {
  
  const { styles, colors } = useThemeStyles(styleGenerator);

  const formatLevelTitle = (text: string) => {
    if (!text) return "Lesson";
    const parts = text.split(": ");
    return parts.length > 1 ? parts[1] : text;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerCompact}>
        <View style={styles.headerLeft}>
          {iconLanguage ? (
            <Image source={iconLanguage} style={styles.langIcon} />
          ) : (
            <MaterialCommunityIcons name="language-python" size={24} color={colors.primary} />
          )}
        </View>

        <View style={styles.headerMid}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>

        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>
      </View>

      {/* Levels Grid */}
      <FlatList
        data={levels}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
        // 🟢 ADDED: We use 'index' to figure out if it's the last item
        renderItem={({ item, index }) => {
          
          let iconName = "lock-outline";
          let iconColor = colors.textSecondary;
          let boxStyle = styles.levelBox;

          if (item.completed) {
            iconName = "check-decagram"; 
            iconColor = colors.success; 
            boxStyle = styles.levelBoxCompleted;
          } else if (item.unlocked) {
            iconName = "lock-open-variant-outline"; 
            iconColor = colors.primary; 
            boxStyle = styles.levelBoxUnlocked;
          }

          
          const isLastLesson = index === levels.length - 1;

          return (
            <TouchableOpacity
              style={[boxStyle]}
              disabled={!item.unlocked}
              onPress={() => {

                const lessonWithFlag = { ...item, isFinalLesson: isLastLesson };
                onLevelPress(lessonWithFlag);
              }}
            >
              <MaterialCommunityIcons 
                name={iconName} 
                size={32} 
                color={iconColor} 
                style={{ marginBottom: 10 }}
              />
              
              <Text style={styles.levelNum}>Level {item.id}</Text>
              
              <Text
                style={[
                  styles.levelText,
                  item.unlocked && { color: colors.textPrimary },
                ]}
                numberOfLines={2}
              >
                {formatLevelTitle(item.title)}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

// Style Generator
const styleGenerator = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: "center" },

  headerCompact: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "92%",
    marginTop: 20,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border || 'transparent',
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  langIcon: { width: 26, height: 26, resizeMode: "contain" },
  headerMid: { flex: 1, marginHorizontal: 10 },
  headerTitle: { color: colors.textPrimary, fontSize: 14, fontFamily: "Poppins-SemiBold" },
  progressBadge: { backgroundColor: colors.background, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: colors.primary },
  progressText: { color: colors.primary, fontSize: 12, fontFamily: "Poppins-Bold" },

  gridContainer: { alignItems: "center", paddingTop: 20, paddingBottom: 100 },
  levelBox: { width: width * 0.42, height: 140, backgroundColor: colors.card, borderRadius: 16, justifyContent: "center", alignItems: "center", margin: 8, borderWidth: 2, borderColor: colors.border || "#333", padding: 10, opacity: 0.7 },
  levelBoxUnlocked: { width: width * 0.42, height: 140, backgroundColor: colors.card, borderRadius: 16, justifyContent: "center", alignItems: "center", margin: 8, padding: 10, borderWidth: 2, borderColor: colors.primary, opacity: 1, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 5, elevation: 4 },
  levelBoxCompleted: { width: width * 0.42, height: 140, backgroundColor: colors.card, borderRadius: 16, justifyContent: "center", alignItems: "center", margin: 8, padding: 10, borderWidth: 2, borderColor: colors.success, opacity: 1 },

  levelNum: { color: colors.textSecondary, fontSize: 10, textTransform: 'uppercase', fontFamily: "Poppins-Bold", marginBottom: 4 },
  levelText: { fontSize: 13, color: colors.textSecondary, fontFamily: "Poppins-Medium", textAlign: "center" },
});