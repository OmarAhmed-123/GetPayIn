import React, { useEffect } from 'react';
import {
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
  interpolate,
  Extrapolate,
  FadeInUp,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
interface InlineDeleteButtonProps {
  onDelete: () => void;
  productName: string;
  visible: boolean;
  isAdmin: boolean;
}

const InlineDeleteButton: React.FC<InlineDeleteButtonProps> = ({
  onDelete,
  productName,
  visible,
  isAdmin,
}) => {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible && isAdmin) {
      // Entrance animation
      scale.value = withSequence(
        withTiming(0.8, { duration: 200 }),
        withSpring(1, { damping: 15, stiffness: 150 })
      );
      
      opacity.value = withTiming(1, { duration: 300 });
      
      // Rotation animation
      rotation.value = withSequence(
        withTiming(360, { duration: 600 }),
        withTiming(0, { duration: 0 })
      );

      // Pulse animation for attention
      pulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500 }),
          withTiming(0, { duration: 1500 })
        ),
        3, // Only pulse 3 times then stop
        true
      );
    } else {
      scale.value = withTiming(0, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, isAdmin, scale, rotation, pulse, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
      opacity: opacity.value,
    };
  });

  const pulseStyle = useAnimatedStyle(() => {
    'worklet';
    const pulseScale = interpolate(
      pulse.value,
      [0, 1],
      [1, 1.05],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [{ scale: pulseScale }],
    };
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const handleDelete = () => {
    // Button press animation
    buttonScale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withSpring(1, { damping: 15, stiffness: 150 })
    );

    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${productName}"?\n\nThis action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            // Reset button scale
            buttonScale.value = withSpring(1, { damping: 15, stiffness: 150 });
          },
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
      ],
      { cancelable: true }
    );
  };

  if (!visible || !isAdmin) return null;

  return (
    <Animated.View 
      style={[styles.container, animatedStyle]}
      entering={FadeInUp.delay(200).springify()}
    >
      {/* Pulse effect */}
      <Animated.View style={[styles.pulse, pulseStyle]} />
      
      {/* Main button */}
      <Animated.View style={[styles.button, buttonAnimatedStyle]}>
        <TouchableOpacity
          style={styles.buttonTouchable}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <Icon name="delete" size={20} color="#ffffff" />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  pulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ef4444',
    opacity: 0.3,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    elevation: 8,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonTouchable: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ef4444',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
});

export default InlineDeleteButton;
