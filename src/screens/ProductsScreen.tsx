import React, {useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  useProducts,
  useDeleteProduct,
  useCategories,
} from '../hooks/useProducts';
import {useAuth} from '../hooks/useAuth';
import {useAppLock} from '../hooks/useAppLock';
import ProductCard from '../components/ProductCard';
import OfflineBanner from '../components/OfflineBanner';
import {Product, RootStackParamList} from '../types';

type ProductsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const ProductsScreen: React.FC = () => {
  const navigation = useNavigation<ProductsScreenNavigationProp>();
  const {data, isLoading, error, refetch, isFetching} = useProducts();
  const {data: categories} = useCategories();
  const deleteProductMutation = useDeleteProduct();
  const {isSuperAdmin, signOut} = useAuth();
  const {updateActivityTime} = useAppLock();

  useEffect(() => {
    updateActivityTime();
  }, [updateActivityTime]);

  const handleRefresh = () => {
    refetch();
    updateActivityTime();
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      await deleteProductMutation.mutateAsync(productId);
      Alert.alert('Success', 'Product deleted successfully');
    } catch {
      Alert.alert('Error', 'Failed to delete product');
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Sign Out', style: 'destructive', onPress: signOut},
    ]);
  };

  const handleCategoryPress = () => {
    if (categories && categories.length > 0) {
      // Navigate to smartphones category as specified in requirements
      navigation.navigate('Category', {category: 'smartphones'});
    }
  };

  const renderProduct = ({item}: {item: Product}) => (
    <ProductCard
      product={item}
      onDelete={handleDeleteProduct}
      showDeleteButton={isSuperAdmin()}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="inventory" size={64} color="#9ca3af" />
      <Text style={styles.emptyStateTitle}>No Products Found</Text>
      <Text style={styles.emptyStateText}>
        {error ? 'Failed to load products' : 'No products available'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <OfflineBanner visible={!data && !isLoading} />

      <View style={styles.header}>
        <Text style={styles.title}>All Products</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={handleCategoryPress}
            style={styles.categoryButton}
          >
            <Icon name="category" size={24} color="#6366f1" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSignOut}
            style={styles.signOutButton}
          >
            <Icon name="logout" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading && !data ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : (
        <FlatList
          data={data?.products || []}
          renderItem={renderProduct}
          keyExtractor={(item: Product) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={handleRefresh}
              colors={['#6366f1']}
              tintColor="#6366f1"
            />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}

      {isSuperAdmin() && (
        <View style={styles.adminBanner}>
          <Icon name="admin-panel-settings" size={16} color="#ffffff" />
          <Text style={styles.adminText}>Admin Mode - Delete enabled</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f9ff',
    marginRight: 8,
  },
  signOutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
  },
  listContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  adminBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  adminText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default ProductsScreen;
