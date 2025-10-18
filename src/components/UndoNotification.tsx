import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  SlideInUp,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
// const { width: screenWidth } = Dimensions.get('window');

interface UndoNotificationProps {
  visible: boolean;
  productName: string;
  onUndo: () => void;
  onDismiss: () => void;
  autoHideDelay?: number;
}

const UndoNotification: React.FC<UndoNotificationProps> = ({
  visible,
  productName,
  onUndo,
  onDismiss,
  autoHideDelay = 5000,
}) => {
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Show animation
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });

      // Start progress bar animation
      progress.value = withTiming(1, { duration: autoHideDelay });

      // Auto hide after delay
      const timer = setTimeout(() => {
        onDismiss();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    } else {
      // Hide animation
      translateY.value = withTiming(100, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
      scale.value = withTiming(0.8, { duration: 300 });
      progress.value = withTiming(0, { duration: 200 });
    }
  }, [visible, autoHideDelay, onDismiss, translateY, opacity, scale, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  const progressStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      width: `${progress.value * 100}%`,
    };
  });

  const handleUndo = () => {
    // Animate button press
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 15, stiffness: 150 })
    );
    
    // Call undo after animation
    setTimeout(() => {
      onUndo();
    }, 100);
  };

  if (!visible) return null;

  return (
    <Animated.View 
      style={[styles.container, animatedStyle]}
      entering={SlideInUp.delay(200).springify()}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icon name="delete" size={24} color="#ef4444" />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>Product Deleted</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            "{productName}" has been removed
          </Text>
        </View>

        <TouchableOpacity
          style={styles.undoButton}
          onPress={handleUndo}
          activeOpacity={0.8}
        >
          <Text style={styles.undoText}>Undo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={onDismiss}
          activeOpacity={0.8}
        >
          <Icon name="close" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <Animated.View style={[styles.progressContainer, progressStyle]} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  undoButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  undoText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 3,
    backgroundColor: '#3b82f6',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
});

export default UndoNotification;
