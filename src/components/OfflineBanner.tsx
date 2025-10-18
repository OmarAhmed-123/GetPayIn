import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, { 
  FadeInDown, 
  FadeOutUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface OfflineBannerProps {
  visible: boolean;
}

const OfflineBanner: React.FC<OfflineBannerProps> = ({ visible }) => {
  const iconScale = useSharedValue(1);

  React.useEffect(() => {
    if (visible) {
      iconScale.value = withRepeat(
        withTiming(1.2, { duration: 1000 }),
        -1,
        true
      );
    }
  }, [visible, iconScale]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View 
      style={styles.container}
      entering={FadeInDown.springify()}
      exiting={FadeOutUp.springify()}
    >
      <Animated.View style={iconAnimatedStyle}>
        <Icon name="wifi-off" size={16} color="#ffffff" />
      </Animated.View>
      <Text style={styles.text}>You're offline. Some features may be limited.</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  text: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default OfflineBanner;
