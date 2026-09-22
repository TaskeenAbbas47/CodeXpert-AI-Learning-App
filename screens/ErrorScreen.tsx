/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigator/AppNavigator'; 
import LottieView from 'lottie-react-native';

// 1. Import Theme Hook
import { useThemeStyles } from '../hooks/useThemeStyles';

type Props = NativeStackScreenProps<RootStackParamList, 'ErrorScreen'>;

export default function ErrorScreen({ navigation, route }: Props) {
  // 2. Initialize Hook with the generator below
  const { styles, colors } = useThemeStyles(styleGenerator);

  const errorMessage = route.params?.errorMessage || 'Something went wrong. Please try again!';

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.goBack(); 
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    // 3. Clean JSX (No inline style objects needed now)
    <View style={styles.container}>
      <View style={styles.card}>
        <LottieView
          source={require('../Assets/Error.json')}
          autoPlay
          loop={false}
          style={styles.animation}
        />

        <Text style={styles.title}>Oops!</Text>
        
        <Text style={styles.subtitle}>
          {errorMessage}
        </Text>

        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => navigation.goBack()} 
        >
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// 4. Style Generator Pattern
export const styleGenerator = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Uses dynamic theme color
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.card,       // Uses dynamic theme color
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    width: '80%',
    // Consistent shadow/elevation for Light Mode
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
  errorButton: {
    backgroundColor: colors.accent, // Uses your Red accent color
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff', // Kept white for contrast on Red
    fontWeight: '600',
    fontSize: 16,
  },
});