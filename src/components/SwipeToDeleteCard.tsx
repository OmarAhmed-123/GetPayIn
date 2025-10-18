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
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  Extrapolate,
  FadeInUp,
  SlideInRight,
} from 'react-native-reanimated';
// import {
//   PanGestureHandler,
//   PanGestureHandlerGestureEvent,
// } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import InlineDeleteButton from './InlineDeleteButton';
import { Product } from '../types';

// const { width: screenWidth } = Dimensions.get('window');
// const SWIPE_THRESHOLD = -120;
// const DELETE_THRESHOLD = -200;

interface SwipeToDeleteCardProps {
  product: Product;
  onDelete: (productId: number) => void;
  _onUndo?: (productId: number) => void;
  showDeleteButton?: boolean;
  isDeleted?: boolean;
  isAdmin?: boolean;
}

const SwipeToDeleteCard: React.FC<SwipeToDeleteCardProps> = ({
  product,
  onDelete,
  _onUndo,
  showDeleteButton = false,
  isDeleted = false,
  isAdmin = false,
}) => {
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const deleteButtonOpacity = useSharedValue(0);
  const deleteButtonScale = useSharedValue(0);
  const cardOpacity = useSharedValue(1);
  // const isSwipeActive = useRef(false);

  useEffect(() => {
    if (showDeleteButton) {
      deleteButtonScale.value = withSequence(
        withTiming(1.2, { duration: 200 }),
        withSpring(1, { damping: 15, stiffness: 150 })
      );
      deleteButtonOpacity.value = withTiming(1, { duration: 300 });
    }
  }, [showDeleteButton, deleteButtonScale, deleteButtonOpacity]);

  const handleSwipeLeft = () => {
    'worklet';
    translateX.value = withSpring(-120, { damping: 15, stiffness: 150 });
    deleteButtonOpacity.value = withTiming(1, { duration: 200 });
    deleteButtonScale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  // const handleSwipeRight = () => {
  //   'worklet';
  //   translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
  //   deleteButtonOpacity.value = withTiming(0, { duration: 200 });
  //   deleteButtonScale.value = withTiming(0, { duration: 200 });
  // };

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { translateX: translateX.value },
        { scale: scale.value },
      ],
      opacity: cardOpacity.value,
    };
  });

  // const deleteButtonStyle = useAnimatedStyle(() => {
  //   'worklet';
  //   return {
  //     opacity: deleteButtonOpacity.value,
  //     transform: [{ scale: deleteButtonScale.value }],
  //   };
  // });

  const backgroundStyle = useAnimatedStyle(() => {
    'worklet';
    const progress = interpolate(
      translateX.value,
      [0, -120],
      [0, 1],
      Extrapolate.CLAMP
    );
    
    return {
      opacity: progress,
      transform: [
        {
          scale: interpolate(progress, [0, 1], [0.8, 1], Extrapolate.CLAMP),
        },
      ],
    };
  });

  // const handleDelete = () => {
  //   Alert.alert(
  //     'Delete Product',
  //     `Are you sure you want to delete "${product.title}"?`,
  //     [
  //       {
  //         text: 'Cancel',
  //         style: 'cancel',
  //         onPress: () => {
  //           // Reset position when cancelled
  //           translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
  //           deleteButtonOpacity.value = withTiming(0, { duration: 200 });
  //           deleteButtonScale.value = withTiming(0, { duration: 200 });
  //         },
  //       },
  //       {
  //         text: 'Delete',
  //         style: 'destructive',
  //         onPress: () => {
  //           // Animate deletion
  //           scale.value = withSequence(
  //             withTiming(1.1, { duration: 150 }),
  //             withTiming(0, { duration: 300 }),
  //             withTiming(0, { duration: 0 }, () => {
  //               runOnJS(() => {
  //                 onDelete(product.id);
  //               })();
  //             })
  //           );
  //           cardOpacity.value = withTiming(0, { duration: 300 });
  //         },
  //       },
  //     ]
  //   );
  // };

  const handlePressIn = () => {
    'worklet';
    scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    'worklet';
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  // const resetPosition = () => {
  //   translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
  //   deleteButtonOpacity.value = withTiming(0, { duration: 200 });
  //   deleteButtonScale.value = withTiming(0, { duration: 200 });
  // };

  if (isDeleted) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Background delete area */}
      <Animated.View style={[styles.deleteBackground, backgroundStyle]}>
        <Icon name="delete" size={40} color="#ffffff" />
        <Text style={styles.deleteText}>Delete</Text>
      </Animated.View>

      <Animated.View style={[styles.card, animatedStyle]}>
        <TouchableOpacity
          style={styles.cardContent}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onLongPress={handleSwipeLeft}
          activeOpacity={0.9}
        >
            <Animated.View style={styles.imageContainer}>
              <Animated.Image 
                source={{ uri: product.thumbnail }} 
                style={styles.thumbnail}
                entering={FadeInUp.delay(100).springify()}
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
                entering={FadeInUp.delay(400).springify()}
              >
                <Text style={styles.price}>${product.price}</Text>
                {product.discountPercentage > 0 && (
                  <Animated.Text 
                    style={styles.discount}
                    entering={FadeInUp.delay(600).springify()}
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

          {/* Inline Delete Button for Admin */}
          <InlineDeleteButton
            onDelete={() => onDelete(product.id)}
            productName={product.title}
            visible={showDeleteButton}
            isAdmin={isAdmin}
          />
        </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 20,
    overflow: 'hidden',
  },
  deleteBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 120,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  deleteText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 20,
  },
  imageContainer: {
    marginRight: 16,
  },
  thumbnail: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
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
  floatingDeleteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    borderRadius: 28,
    width: 56,
    height: 56,
    elevation: 12,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    zIndex: 10,
  },
  floatingDeleteButtonTouchable: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ef4444',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
});

export default SwipeToDeleteCard;
