import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useProductsByCategory } from '../hooks/useProducts';
import { useAppLock } from '../hooks/useAppLock';
import ProductCard from '../components/ProductCard';
import OfflineBanner from '../components/OfflineBanner';
import { RootStackParamList, Product } from '../types';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

type CategoryScreenRouteProp = RouteProp<RootStackParamList, 'Category'>;

const CategoryScreen: React.FC = () => {
  const route = useRoute<CategoryScreenRouteProp>();
  const { category } = route.params;
  const { data, isLoading, error, refetch, isFetching } = useProductsByCategory(category);
  const { updateActivityTime } = useAppLock();
  const { isOnline } = useSelector((state: RootState) => state.app);

  useEffect(() => {
    updateActivityTime();
  }, [updateActivityTime]);

  const handleRefresh = () => {
    refetch();
    updateActivityTime();
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard product={item} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="category" size={64} color="#9ca3af" />
      <Text style={styles.emptyStateTitle}>No Products in {category}</Text>
      <Text style={styles.emptyStateText}>
        {error ? 'Failed to load products' : 'No products available in this category'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <OfflineBanner visible={!isOnline} />
      
      <View style={styles.header}>
        <Text style={styles.title}>{category}</Text>
        <Text style={styles.subtitle}>
          {data ? `${data.total} products` : 'Loading...'}
        </Text>
      </View>

      {isLoading && !data ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : (
        <FlatList
          data={data?.products || []}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textTransform: 'capitalize',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
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
});

export default CategoryScreen;

