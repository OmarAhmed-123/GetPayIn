import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
// **FIX**: Changed alias path to relative path
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
  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(product.id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: product.thumbnail }} style={styles.thumbnail} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        <Text style={styles.brand}>{product.brand}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${product.price}</Text>
          {product.discountPercentage > 0 && (
            <Text style={styles.discount}>
              -{product.discountPercentage}%
            </Text>
          )}
        </View>
        <View style={styles.ratingContainer}>
          <Icon name="star" size={16} color="#fbbf24" />
          <Text style={styles.rating}>{product.rating}</Text>
          <Text style={styles.stock}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </Text>
        </View>
      </View>
      {showDeleteButton && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Icon name="delete" size={20} color="#ef4444" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  brand: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  discount: {
    fontSize: 14,
    color: '#ef4444',
    marginLeft: 8,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  stock: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 12,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
  },
});

export default ProductCard;
