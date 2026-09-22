import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import * as Progress from "react-native-progress";

// 1. Import Theme Hook
import { useThemeStyles } from "../hooks/useThemeStyles";

type Props = {
  title: string;
  description: string;
  icon?: any;
  progress?: number;
  onPress: () => void;
  grayOut?: boolean;
};

export default function LanguageCard({
  title,
  description,
  icon,
  progress,
  grayOut = false,
  onPress,
}: Props) {
  // 2. Initialize Hook
  const { styles, colors } = useThemeStyles(styleGenerator);

  return (
    <TouchableOpacity
      style={[styles.card, grayOut && styles.grayCard]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        {icon && (
          <Image
            source={icon}
            style={[
              styles.icon,
              grayOut && styles.grayIcon
            ]}
          />
        )}

        <View style={styles.textContainer}>
          <Text style={[styles.title, grayOut && { color: colors.textSecondary }]}>
            {title}
          </Text>

          <Text style={[styles.description, grayOut && { color: colors.textSecondary }]}>
            {description}
          </Text>
        </View>
      </View>

      {progress !== undefined && (
        <View style={styles.progressContainer}>
          <Progress.Bar
            progress={progress / 100}
            width={null}
            height={12}
            color={colors.primary}        // Dynamic Primary Color
            unfilledColor={colors.buttonMuted} // Dynamic Muted Color for track
            borderWidth={0}
            borderRadius={10}
            style={styles.progressBar}
          />
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// 3. Style Generator
const styleGenerator = (colors: any) => StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    // Light Mode Border & Shadow
    borderWidth: 1,
    borderColor: colors.border || 'transparent',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  grayCard: {
    backgroundColor: colors.cardMuted, // Uses the specific muted color defined in theme
    borderColor: 'transparent',
    elevation: 0, // Flatten locked cards
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 12,
    resizeMode: "contain",
    // Note: No tint applied to keep original icon colors
  },
  grayIcon: {
    opacity: 0.5,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: colors.textPrimary,
    fontFamily: "Poppins-SemiBold",
  },
  description: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    fontFamily: "Poppins-Regular",
  },
  progressContainer: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    marginRight: 10,
  },
  progressText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontFamily: "Poppins-Medium",
  },
});