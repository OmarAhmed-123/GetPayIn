import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface OfflineBannerProps {
  visible: boolean;
}

const OfflineBanner: React.FC<OfflineBannerProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Icon name="wifi-off" size={16} color="#ffffff" />
      <Text style={styles.text}>You're offline. Some features may be limited.</Text>
    </View>
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
