import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProductCard from '../../components/ProductCard';
import { Product } from '../../types';

const mockProduct: Product = {
  id: 1,
  title: 'Test Product',
  description: 'Test Description',
  price: 100,
  discountPercentage: 10,
  rating: 4.5,
  stock: 50,
  brand: 'Test Brand',
  category: 'electronics',
  thumbnail: 'https://example.com/thumb.jpg',
  images: ['https://example.com/img1.jpg'],
};

describe('ProductCard', () => {
  const mockOnDelete = jest.fn();
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render product information correctly', () => {
    const { getByText, getByTestId } = render(
      <ProductCard
        product={mockProduct}
        onDelete={mockOnDelete}
        onPress={mockOnPress}
        showDelete={false}
      />
    );

    expect(getByText('Test Product')).toBeTruthy();
    expect(getByText('Test Brand')).toBeTruthy();
    expect(getByText('$100.00')).toBeTruthy();
    expect(getByText('4.5 ⭐')).toBeTruthy();
    expect(getByTestId('product-thumbnail')).toBeTruthy();
  });

  it('should call onPress when product is pressed', () => {
    const { getByTestId } = render(
      <ProductCard
        product={mockProduct}
        onDelete={mockOnDelete}
        onPress={mockOnPress}
        showDelete={false}
      />
    );

    fireEvent.press(getByTestId('product-card'));

    expect(mockOnPress).toHaveBeenCalledWith(mockProduct);
  });

  it('should show delete button when showDelete is true', () => {
    const { getByTestId } = render(
      <ProductCard
        product={mockProduct}
        onDelete={mockOnDelete}
        onPress={mockOnPress}
        showDelete={true}
      />
    );

    expect(getByTestId('delete-button')).toBeTruthy();
  });

  it('should not show delete button when showDelete is false', () => {
    const { queryByTestId } = render(
      <ProductCard
        product={mockProduct}
        onDelete={mockOnDelete}
        onPress={mockOnPress}
        showDelete={false}
      />
    );

    expect(queryByTestId('delete-button')).toBeNull();
  });

  it('should call onDelete when delete button is pressed', () => {
    const { getByTestId } = render(
      <ProductCard
        product={mockProduct}
        onDelete={mockOnDelete}
        onPress={mockOnPress}
        showDelete={true}
      />
    );

    fireEvent.press(getByTestId('delete-button'));

    expect(mockOnDelete).toHaveBeenCalledWith(mockProduct.id);
  });

  it('should display discount percentage when available', () => {
    const productWithDiscount = {
      ...mockProduct,
      discountPercentage: 20,
    };

    const { getByText } = render(
      <ProductCard
        product={productWithDiscount}
        onDelete={mockOnDelete}
        onPress={mockOnPress}
        showDelete={false}
      />
    );

    expect(getByText('20% OFF')).toBeTruthy();
  });

  it('should display stock information', () => {
    const { getByText } = render(
      <ProductCard
        product={mockProduct}
        onDelete={mockOnDelete}
        onPress={mockOnPress}
        showDelete={false}
      />
    );

    expect(getByText('50 in stock')).toBeTruthy();
  });

  it('should handle low stock display', () => {
    const lowStockProduct = {
      ...mockProduct,
      stock: 2,
    };

    const { getByText } = render(
      <ProductCard
        product={lowStockProduct}
        onDelete={mockOnDelete}
        onPress={mockOnPress}
        showDelete={false}
      />
    );

    expect(getByText('2 in stock')).toBeTruthy();
  });

  it('should handle out of stock display', () => {
    const outOfStockProduct = {
      ...mockProduct,
      stock: 0,
    };

    const { getByText } = render(
      <ProductCard
        product={outOfStockProduct}
        onDelete={mockOnDelete}
        onPress={mockOnPress}
        showDelete={false}
      />
    );

    expect(getByText('Out of stock')).toBeTruthy();
  });
});
