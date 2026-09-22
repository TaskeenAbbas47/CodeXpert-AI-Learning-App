import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
} from 'react-native';
import LottieView from 'lottie-react-native';

interface ErrorModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export default function ErrorModal({ visible, title, message, onClose }: ErrorModalProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      animationRef.current?.play();
    } else {
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start();
    }
  }, [visible, fadeAnim]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <View style={styles.box}>
          <LottieView
            ref={animationRef}
            source={require('../Assets/Error.json')}
            autoPlay
            loop={false}
            style={styles.lottie}
          />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    backgroundColor: '#1F1F3A',
    width: '80%',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D2D55',
  },
  lottie: {
    width: 120,
    height: 120,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginTop: 10,
  },
  message: {
    color: '#CCCCE0',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 10,
    fontFamily: 'Poppins-Regular',
  },
  button: {
    backgroundColor: '#E94B4B',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
});
