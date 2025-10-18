import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { ProductsResponse, DeleteResponse } from '../types';

export const useProducts = () => {
  return useQuery<ProductsResponse, Error>({
    queryKey: ['products'],
    queryFn: () => apiService.getProducts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
  });
};

export const useCategories = () => {
  return useQuery<string[], Error>({
    queryKey: ['categories'],
    queryFn: () => apiService.getCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (renamed from cacheTime)
  });
};

export const useProductsByCategory = (category: string) => {
  return useQuery<ProductsResponse, Error>({
    queryKey: ['products', 'category', category],
    queryFn: () => apiService.getProductsByCategory(category),
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000, // renamed from cacheTime
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteResponse, Error, number>({
    mutationFn: (productId: number) => apiService.deleteProduct(productId),
    onSuccess: (data, productId) => {
      // Update the products cache
      queryClient.setQueryData<ProductsResponse>(['products'], (oldData) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          products: oldData.products.filter(product => product.id !== productId),
          total: oldData.total - 1,
        };
      });

      // Update category-specific caches
      queryClient.invalidateQueries({ queryKey: ['products', 'category'] });
    },
  });
};
