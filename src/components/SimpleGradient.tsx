import React from 'react';
import { View, StyleSheet } from 'react-native';

interface SimpleGradientProps {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: any;
  children?: React.ReactNode;
}

const SimpleGradient: React.FC<SimpleGradientProps> = ({ 
  colors, 
  start = { x: 0, y: 0 }, 
  end = { x: 1, y: 1 }, 
  style, 
  children 
}) => {
  return (
    <View style={[styles.container, { backgroundColor: colors[0] }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SimpleGradient;
