/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// 1. Import Theme Hook
import { useThemeStyles } from '../hooks/useThemeStyles';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    image: require('../Assets/illustration01.png'),
    title: 'Learn to Code\nStep by Step',
    description: 'Start your programming journey with guided lessons\nbuilt for beginners and beyond.',
  },
  {
    id: '2',
    image: require('../Assets/illustration_2.png'),
    title: 'Interactive &\nHands-On Learning',
    description: 'Write code, test snippets, and practice instantly\ninside the built-in coding console.',
  },
  {
    id: '3',
    image: require('../Assets/illustration_3.png'),
    title: 'AI-Powered\nSupport & Feedback',
    description: 'Get instant guidance, error help, and smart\nfeedback to improve your skills faster.',
  },
];

export default function Onboarding() {
  const navigation = useNavigation();
  
  // 2. Initialize Hook
  const { styles, colors } = useThemeStyles(styleGenerator);
  
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-loop logic
  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (currentIndex + 1) % slides.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }, 2000); 
    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleSkip = () => {
    navigation.navigate('LoginScreen' as never);
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <View style={styles.container}>
      {/* Skip only for first two slides */}
      {currentIndex < slides.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* FlatList Carousel */}
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Image source={item.image} style={styles.image} resizeMode="contain" />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot, 
              currentIndex === index && styles.activeDot // Dynamic active dot style
            ]}
          />
        ))}
      </View>

      {/* Buttons only on last slide */}
      {currentIndex === slides.length - 1 && (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => navigation.navigate('SignupScreen' as never)}
          >
            <Text style={styles.signupText}>Sign up</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('LoginScreen' as never)}
          >
            <Text style={styles.loginText}>Log in</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// 3. Style Generator
export const styleGenerator = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Dynamic Background
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  skipText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: 230,
    height: 220,
    marginBottom: 20,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 8, // Slightly larger for better visibility
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.buttonMuted || '#555', // Inactive dot color
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: colors.primary, // Active dot uses Primary Blue
    width: 8,
    height: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 40,
  },
  signupButton: {
    backgroundColor: colors.primary, // Dynamic Blue
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },
  signupText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  loginButton: {
    backgroundColor: colors.buttonMuted || '#6b7280', // Dynamic Muted/Grey
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
  },
  loginText: {
    color: '#1d1d36',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
});