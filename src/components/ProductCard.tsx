import React from 'react';
import {
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Animated, { 
  FadeInUp, 
  SlideInLeft,
  SlideInRight,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onDelete?: (productId: number) => void;
  showDeleteButton?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onDelete,
  showDeleteButton = false,
}) => {
  const scale = useSharedValue(1);
  const deleteButtonScale = useSharedValue(0);
  const shimmer = useSharedValue(0);
  const deleteButtonOpacity = useSharedValue(0);
  const cardElevation = useSharedValue(2);

  React.useEffect(() => {
    if (showDeleteButton) {
      deleteButtonScale.value = withSequence(
        withTiming(1.2, { duration: 200 }),
        withSpring(1, { damping: 15, stiffness: 150 })
      );
      deleteButtonOpacity.value = withTiming(1, { duration: 300 });
    } else {
      deleteButtonScale.value = withTiming(0, { duration: 200 });
      deleteButtonOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [showDeleteButton, deleteButtonScale, deleteButtonOpacity]);

  // Shimmer effect - always initialize
  React.useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ scale: scale.value }],
      elevation: cardElevation.value,
      shadowOpacity: interpolate(cardElevation.value, [2, 8], [0.1, 0.3]),
    };
  });

  const deleteButtonAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { scale: deleteButtonScale.value },
        { rotateZ: `${interpolate(deleteButtonScale.value, [0, 1], [0, 360], Extrapolate.CLAMP)}deg` }
      ],
      opacity: deleteButtonOpacity.value,
    };
  });

  const shimmerStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.8, 0.3]),
    };
  });

  const handlePressIn = () => {
    'worklet';
    scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
    cardElevation.value = withTiming(8, { duration: 100 });
  };

  const handlePressOut = () => {
    'worklet';
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    cardElevation.value = withSpring(2, { damping: 15, stiffness: 150 });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Animate deletion
            scale.value = withSequence(
              withTiming(1.1, { duration: 150 }),
              withTiming(0, { duration: 300 }),
              withTiming(0, { duration: 0 }, () => {
                runOnJS(() => {
                  onDelete?.(product.id);
                })();
              })
            );
          },
        },
      ]
    );
  };


  return (
    <Animated.View 
      entering={FadeInUp.delay(100).springify()}
      style={styles.wrapper}
    >
      <Animated.View 
        style={[styles.container, animatedStyle]}
      >
        <TouchableOpacity
          style={styles.card}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
        <Animated.View style={[styles.imageContainer, shimmerStyle]}>
          <Image source={{ uri: product.thumbnail }} style={styles.thumbnail} />
          <Animated.View 
            style={styles.shimmerOverlay}
            entering={SlideInLeft.delay(500).duration(1000)}
          />
        </Animated.View>
        
        <Animated.View 
          style={styles.content}
          entering={SlideInRight.delay(200).springify()}
        >
          <Text style={styles.title} numberOfLines={2}>
            {product.title}
          </Text>
          <Text style={styles.brand}>{product.brand}</Text>
          
          <Animated.View 
            style={styles.priceContainer}
            entering={ZoomIn.delay(400).springify()}
          >
            <Text style={styles.price}>${product.price}</Text>
            {product.discountPercentage > 0 && (
              <Animated.Text 
                style={styles.discount}
                entering={ZoomIn.delay(600).springify()}
              >
                -{product.discountPercentage}%
              </Animated.Text>
            )}
          </Animated.View>
          
          <Animated.View 
            style={styles.ratingContainer}
            entering={FadeInUp.delay(800).springify()}
          >
            <Icon name="star" size={16} color="#fbbf24" />
            <Text style={styles.rating}>{product.rating}</Text>
            <Text style={styles.stock}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </Text>
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>

      {showDeleteButton && (
        <Animated.View 
          style={[styles.deleteButton, deleteButtonAnimatedStyle]}
          entering={ZoomIn.delay(1000).springify()}
        >
          <TouchableOpacity
            style={styles.deleteButtonTouchable}
            onPress={handleDelete}
            onPressIn={() => {
              deleteButtonScale.value = withSpring(0.9);
            }}
            onPressOut={() => {
              deleteButtonScale.value = withSpring(1);
            }}
          >
            <Icon name="delete" size={20} color="#ffffff" />
          </TouchableOpacity>
        </Animated.View>
      )}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    transform: [{ perspective: 1000 }],
  },
  card: {
    flexDirection: 'row',
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  thumbnail: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 6,
    lineHeight: 24,
  },
  brand: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: '#059669',
    marginRight: 12,
  },
  discount: {
    fontSize: 12,
    color: '#ffffff',
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontWeight: '600',
    overflow: 'hidden',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rating: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  stock: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 24,
    width: 48,
    height: 48,
    elevation: 8,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  deleteButtonTouchable: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ef4444',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProductCard;
