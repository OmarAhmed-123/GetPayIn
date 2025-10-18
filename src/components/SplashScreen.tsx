import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import SimpleGradient from './SimpleGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface SplashScreenProps {
  onAnimationFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationFinish }) => {
  const logoScale = useSharedValue(0);
  const logoRotation = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(50);
  const gradientOpacity = useSharedValue(1);
  const backgroundScale = useSharedValue(1.2);

  useEffect(() => {
    // Start the animation sequence
    const startAnimation = () => {
      // Background scale animation
      backgroundScale.value = withTiming(1, { duration: 2000 });

      // Logo entrance animation
      logoScale.value = withSequence(
        withTiming(1.2, { duration: 800 }),
        withSpring(1, { damping: 8, stiffness: 100 })
      );
      
      logoRotation.value = withTiming(360, { duration: 1200 });
      logoOpacity.value = withTiming(1, { duration: 1000 });

      // Text animation with delay
      textOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
      textTranslateY.value = withDelay(800, withSpring(0, { damping: 8, stiffness: 100 }));

      // Gradient fade out
      gradientOpacity.value = withDelay(2000, withTiming(0, { duration: 1000 }));

      // Finish animation
      setTimeout(() => {
        runOnJS(onAnimationFinish)();
      }, 3500);
    };

    startAnimation();
  }, [onAnimationFinish]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotation.value}deg` },
    ],
    opacity: logoOpacity.value,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backgroundScale.value }],
    opacity: gradientOpacity.value,
  }));

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      gradientOpacity.value,
      [0, 1],
      [1, 0],
      Extrapolate.CLAMP
    ),
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.background, backgroundAnimatedStyle]}>
        <SimpleGradient
          colors={['#6366f1', '#8b5cf6', '#a855f7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>

      <Animated.View style={[styles.overlay, overlayAnimatedStyle]}>
        <SimpleGradient
          colors={['#1f2937', '#374151']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.overlayGradient}
        />
      </Animated.View>

      <View style={styles.content}>
        <Animated.View style={logoAnimatedStyle}>
          <View style={styles.logoContainer}>
            <Icon name="store" size={80} color="#ffffff" />
            <View style={styles.logoGlow} />
          </View>
        </Animated.View>

        <Animated.View style={textAnimatedStyle}>
          <Text style={styles.title}>Store App</Text>
          <Text style={styles.subtitle}>Modern Shopping Experience</Text>
        </Animated.View>

        <Animated.View style={[styles.loadingContainer, textAnimatedStyle]}>
          <View style={styles.loadingDots}>
            <Animated.View style={[styles.dot, styles.dot1]} />
            <Animated.View style={[styles.dot, styles.dot2]} />
            <Animated.View style={[styles.dot, styles.dot3]} />
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f2937',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayGradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 40,
  },
  logoGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    borderRadius: 60,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
    marginBottom: 60,
    fontWeight: '300',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 100,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366f1',
    marginHorizontal: 4,
  },
  dot1: {
    // Animation will be handled by Reanimated
  },
  dot2: {
    // Animation will be handled by Reanimated
  },
  dot3: {
    // Animation will be handled by Reanimated
  },
});

export default SplashScreen;
