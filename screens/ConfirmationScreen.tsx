/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigator/AppNavigator';
import LottieView from 'lottie-react-native';
// 1. Import Theme Hook
import { useThemeStyles } from '../hooks/useThemeStyles';

type Props = NativeStackScreenProps<RootStackParamList, 'Confirmation'>;

export default function ConfirmationScreen({ navigation }: Props) {
  // 2. Initialize Hook
  const { styles, colors } = useThemeStyles(styleGenerator);

  // Auto-navigate after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('HomeScreen'); 
    }, 2500); 

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <LottieView
          source={require('../Assets/confirm.json')}
          autoPlay
          loop={true} 
          style={styles.animation}
        />

        <Text style={styles.title}>Success</Text>
        <Text style={styles.subtitle}>Everything is set!</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.replace('HomeScreen')}
        >
          <Text style={styles.buttonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// 3. Style Generator
export const styleGenerator = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundConfirm, // ✅ Specific variable for this screen
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.cardConfirm, // ✅ Specific variable
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    width: '80%',
    // Add shadow for light mode visibility
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  animation: {
    width: 180,
    height: 180,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: colors.buttonConfirm, // ✅ Specific variable
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff', // Keep white text on the blue button
    fontWeight: '600',
    fontSize: 16,
  },
});