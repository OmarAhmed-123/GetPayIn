import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  FadeInUp,
  SlideInRight,
  SlideInLeft,
  ZoomIn,
} from 'react-native-reanimated';
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
import {useTheme} from '../contexts/ThemeContext';
// import ProductCard from '../components/ProductCard';
import SwipeToDeleteCard from '../components/SwipeToDeleteCard';
import UndoNotification from '../components/UndoNotification';
import OfflineBanner from '../components/OfflineBanner';
import ThemeSelector from '../components/ThemeSelector';
import {Product, RootStackParamList} from '../types';
import {useSelector} from 'react-redux';
import {RootState} from '../store';

// const { width } = Dimensions.get('window');

type ProductsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const ProductsScreen: React.FC = () => {
  const navigation = useNavigation<ProductsScreenNavigationProp>();
  const {data, isLoading, error, refetch, isFetching} = useProducts();
  const {data: categories} = useCategories();
  const deleteProductMutation = useDeleteProduct();
  const {isSuperAdmin, signOut} = useAuth();
  const {updateActivityTime} = useAppLock();
  const {isOnline} = useSelector((state: RootState) => state.app);
  const {currentTheme} = useTheme();
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [deletedProducts, setDeletedProducts] = useState<Set<number>>(new Set());
  const [undoProduct, setUndoProduct] = useState<{id: number, name: string} | null>(null);
  const [showUndoNotification, setShowUndoNotification] = useState(false);

  // Animation values
  const headerScale = useSharedValue(0);
  const headerOpacity = useSharedValue(0);
  const listTranslateY = useSharedValue(30);
  const listOpacity = useSharedValue(0);

  useEffect(() => {
    // Start animations
    headerScale.value = withSequence(
      withTiming(1.1, { duration: 600 }),
      withSpring(1, { damping: 8, stiffness: 100 })
    );
    headerOpacity.value = withTiming(1, { duration: 800 });
    
    listTranslateY.value = withDelay(400, withSpring(0, { damping: 8, stiffness: 100 }));
    listOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
  }, [headerScale, headerOpacity, listTranslateY, listOpacity]);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
    opacity: headerOpacity.value,
  }));

  const listAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: listTranslateY.value }],
    opacity: listOpacity.value,
  }));

  useEffect(() => {
    updateActivityTime();
  }, [updateActivityTime]);

  const handleRefresh = React.useCallback(() => {
    refetch();
    updateActivityTime();
  }, [refetch, updateActivityTime]);

  const handleDeleteProduct = React.useCallback(async (productId: number) => {
    // Find the product to get its name
    const product = data?.products?.find(p => p.id === productId);
    if (product) {
      try {
        // Call DummyJSON DELETE API
        const result = await deleteProductMutation.mutateAsync(productId);
        
        if (result.isDeleted) {
          // Add to deleted products set for UI update
          setDeletedProducts(prev => new Set([...prev, productId]));
          
          // Show undo notification
          setUndoProduct({ id: productId, name: product.title });
          setShowUndoNotification(true);
          
          // Actually remove from UI after delay (for undo functionality)
          setTimeout(() => {
            if (deletedProducts.has(productId)) {
              // Product is permanently deleted
              console.log(`Product ${productId} deleted successfully`);
            }
          }, 5000); // 5 second delay for undo
        } else {
          Alert.alert('Error', 'Failed to delete product');
        }
      } catch (deleteError) {
        console.error('Delete product error:', deleteError);
        Alert.alert('Error', 'Failed to delete product. Please try again.');
      }
    }
  }, [data?.products, deleteProductMutation, deletedProducts]);

  const handleUndoDelete = React.useCallback((productId: number) => {
    // Remove from deleted products set
    setDeletedProducts(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
    
    // Hide undo notification
    setShowUndoNotification(false);
    setUndoProduct(null);
  }, []);

  const handleDismissUndo = React.useCallback(() => {
    setShowUndoNotification(false);
    setUndoProduct(null);
  }, []);

  const handleSignOut = React.useCallback(() => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Sign Out', style: 'destructive', onPress: signOut},
    ]);
  }, [signOut]);

  const handleCategoryPress = React.useCallback(() => {
    if (categories && categories.length > 0) {
      // Navigate to smartphones category as specified in requirements
      navigation.navigate('Category', {category: 'smartphones'});
    }
  }, [categories, navigation]);

  const renderProduct = React.useCallback(({item}: {item: Product}) => {
    // Don't render if product is deleted
    if (deletedProducts.has(item.id)) {
      return null;
    }
    
    return (
      <SwipeToDeleteCard
        product={item}
        onDelete={handleDeleteProduct}
        showDeleteButton={isSuperAdmin()}
        isDeleted={deletedProducts.has(item.id)}
        isAdmin={isSuperAdmin()}
      />
    );
  }, [handleDeleteProduct, isSuperAdmin, deletedProducts]);

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
    <View style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <OfflineBanner visible={!isOnline} />

      <Animated.View style={[styles.header, headerAnimatedStyle, { backgroundColor: currentTheme.colors.surface }]}>
        <Animated.Text 
          style={[styles.title, { color: currentTheme.colors.text }]}
          entering={FadeInUp.delay(200).springify()}
        >
          All Products
        </Animated.Text>
        <Animated.View 
          style={styles.headerButtons}
          entering={SlideInRight.delay(400).springify()}
        >
          <Animated.View entering={SlideInLeft.delay(600).springify()}>
            <TouchableOpacity
              onPress={handleCategoryPress}
              style={[styles.categoryButton, { backgroundColor: currentTheme.colors.primary }]}
            >
              <Icon name="category" size={24} color="#ffffff" />
            </TouchableOpacity>
          </Animated.View>
          <Animated.View entering={ZoomIn.delay(700).springify()}>
            <TouchableOpacity
              onPress={() => setShowThemeSelector(true)}
              style={[styles.themeButton, { backgroundColor: currentTheme.colors.secondary }]}
            >
              <Icon name="palette" size={24} color="#ffffff" />
            </TouchableOpacity>
          </Animated.View>
          <Animated.View entering={SlideInRight.delay(800).springify()}>
            <TouchableOpacity
              onPress={handleSignOut}
              style={[styles.signOutButton, { backgroundColor: currentTheme.colors.error }]}
            >
              <Icon name="logout" size={24} color="#ffffff" />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Animated.View>

      {isLoading && !data ? (
        <Animated.View 
          style={styles.loadingContainer}
          entering={FadeInUp.delay(1000).springify()}
        >
          <Text style={styles.loadingText}>Loading products...</Text>
        </Animated.View>
      ) : (
        <Animated.View style={[styles.listWrapper, listAnimatedStyle]}>
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
        </Animated.View>
      )}

      {isSuperAdmin() && (
        <Animated.View 
          style={[styles.adminBanner, { backgroundColor: currentTheme.colors.primary }]}
          entering={FadeInUp.delay(1200).springify()}
        >
          <Icon name="admin-panel-settings" size={16} color="#ffffff" />
          <Text style={styles.adminText}>Admin Mode - Delete buttons visible on product cards</Text>
        </Animated.View>
      )}

      <ThemeSelector 
        visible={showThemeSelector} 
        onClose={() => setShowThemeSelector(false)} 
      />

      <UndoNotification
        visible={showUndoNotification}
        productName={undoProduct?.name || ''}
        onUndo={() => undoProduct && handleUndoDelete(undoProduct.id)}
        onDismiss={handleDismissUndo}
        autoHideDelay={5000}
      />
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
  themeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f9ff',
    marginHorizontal: 4,
  },
  signOutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
  },
  listWrapper: {
    flex: 1,
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
