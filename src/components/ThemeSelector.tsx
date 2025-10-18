import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  FadeInUp,
  SlideInLeft,
  ZoomIn,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme, Theme } from '../contexts/ThemeContext';

interface ThemeSelectorProps {
  visible: boolean;
  onClose: () => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ visible, onClose }) => {
  const { currentTheme, setTheme, themes } = useTheme();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      scale.value = withTiming(0, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handleThemeSelect = (theme: Theme) => {
    setTheme(theme);
    // Add selection animation
    scale.value = withSequence(
      withTiming(1.1, { duration: 150 }),
      withSpring(1, { damping: 15, stiffness: 150 })
    );
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, animatedStyle]}>
      <Animated.View 
        style={[styles.container, { backgroundColor: currentTheme.colors.surface }]}
        entering={FadeInUp.delay(200).springify()}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: currentTheme.colors.text }]}>
            Choose Theme
          </Text>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: currentTheme.colors.border }]}
            onPress={onClose}
          >
            <Icon name="close" size={24} color={currentTheme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.themesList}
          showsVerticalScrollIndicator={false}
        >
          {themes.map((theme, index) => (
            <Animated.View
              key={theme.name}
              entering={SlideInLeft.delay(300 + index * 100).springify()}
            >
              <TouchableOpacity
                style={[
                  styles.themeItem,
                  {
                    backgroundColor: currentTheme.colors.background,
                    borderColor: theme.name === currentTheme.name 
                      ? theme.colors.primary 
                      : currentTheme.colors.border,
                    borderWidth: theme.name === currentTheme.name ? 2 : 1,
                  }
                ]}
                onPress={() => handleThemeSelect(theme)}
              >
                <View style={styles.themePreview}>
                  <View 
                    style={[
                      styles.colorPreview,
                      { backgroundColor: theme.colors.primary }
                    ]}
                  />
                  <View 
                    style={[
                      styles.colorPreview,
                      { backgroundColor: theme.colors.secondary }
                    ]}
                  />
                  <View 
                    style={[
                      styles.colorPreview,
                      { backgroundColor: theme.colors.accent }
                    ]}
                  />
                </View>
                
                <View style={styles.themeInfo}>
                  <Text style={[styles.themeName, { color: currentTheme.colors.text }]}>
                    {theme.name}
                  </Text>
                  <Text style={[styles.themeDescription, { color: currentTheme.colors.textSecondary }]}>
                    {theme.name === 'Ocean' && 'Cool blues and teals'}
                    {theme.name === 'Sunset' && 'Warm oranges and pinks'}
                    {theme.name === 'Forest' && 'Natural greens and earth tones'}
                    {theme.name === 'Midnight' && 'Deep purples and dark tones'}
                  </Text>
                </View>

                {theme.name === currentTheme.name && (
                  <Animated.View
                    style={[styles.selectedIndicator, { backgroundColor: theme.colors.primary }]}
                    entering={ZoomIn.delay(500).springify()}
                  >
                    <Icon name="check" size={20} color="#ffffff" />
                  </Animated.View>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themesList: {
    maxHeight: 400,
  },
  themeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  themePreview: {
    flexDirection: 'row',
    marginRight: 16,
  },
  colorPreview: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 4,
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 14,
  },
  selectedIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ThemeSelector;
