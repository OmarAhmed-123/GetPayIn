import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  interpolate,
  Extrapolate,
  FadeInUp,
  ZoomIn,
  RotateIn,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface DeleteButtonProps {
  onDelete: () => void;
  productName: string;
  visible: boolean;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({
  onDelete,
  productName,
  visible,
}) => {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(0);
  const glow = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      // Entrance animation
      scale.value = withSequence(
        withTiming(0.8, { duration: 200 }),
        withSpring(1, { damping: 15, stiffness: 150 })
      );
      
      // Rotation animation
      rotation.value = withSequence(
        withTiming(360, { duration: 600 }),
        withTiming(0, { duration: 0 })
      );

      // Pulse animation
      pulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(0, { duration: 1000 })
        ),
        -1,
        true
      );

      // Glow animation
      glow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500 }),
          withTiming(0, { duration: 1500 })
        ),
        -1,
        true
      );
    } else {
      scale.value = withTiming(0, { duration: 200 });
    }
  }, [visible, scale, rotation, pulse, glow]);

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
      opacity: scale.value,
    };
  });

  const pulseStyle = useAnimatedStyle(() => {
    'worklet';
    const pulseScale = interpolate(
      pulse.value,
      [0, 1],
      [1, 1.1],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [{ scale: pulseScale }],
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    'worklet';
    const glowOpacity = interpolate(
      glow.value,
      [0, 1],
      [0.3, 0.8],
      Extrapolate.CLAMP
    );
    
    return {
      opacity: glowOpacity,
    };
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const handlePress = () => {
    // Button press animation
    buttonScale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withSpring(1, { damping: 15, stiffness: 150 })
    );

    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${productName}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Delete animation
            scale.value = withSequence(
              withTiming(1.2, { duration: 150 }),
              withTiming(0, { duration: 300 })
            );
            
            // Call delete after animation
            setTimeout(() => {
              onDelete();
            }, 200);
          },
        },
      ]
    );
  };

  if (!visible) return null;

  return (
    <Animated.View 
      style={[styles.container, animatedStyle]}
      entering={FadeInUp.delay(200).springify()}
    >
      {/* Glow effect */}
      <Animated.View style={[styles.glow, glowStyle]} />
      
      {/* Pulse effect */}
      <Animated.View style={[styles.pulse, pulseStyle]} />
      
      {/* Main button */}
      <Animated.View style={[styles.button, buttonAnimatedStyle]}>
        <TouchableOpacity
          style={styles.buttonTouchable}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <Icon name="delete" size={28} color="#ffffff" />
        </TouchableOpacity>
      </Animated.View>
      
      {/* Label */}
      <Animated.Text 
        style={styles.label}
        entering={ZoomIn.delay(400).springify()}
      >
        Delete
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 10,
  },
  glow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ef4444',
    opacity: 0.3,
  },
  pulse: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ef4444',
    opacity: 0.2,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 12,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  buttonTouchable: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ef4444',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  label: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default DeleteButton;
