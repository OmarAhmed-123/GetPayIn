import React from 'react';
import { render } from '@testing-library/react-native';
import OfflineBanner from '../../components/OfflineBanner';

describe('OfflineBanner', () => {
  it('should not render when visible is false', () => {
    const { queryByTestId } = render(<OfflineBanner visible={false} />);

    expect(queryByTestId('offline-banner')).toBeNull();
  });

  it('should render when visible is true', () => {
    const { getByTestId, getByText } = render(<OfflineBanner visible={true} />);

    expect(getByTestId('offline-banner')).toBeTruthy();
    expect(getByText('You are offline')).toBeTruthy();
    expect(getByText('Some features may not be available')).toBeTruthy();
  });

  it('should display correct offline message', () => {
    const { getByText } = render(<OfflineBanner visible={true} />);

    expect(getByText('You are offline')).toBeTruthy();
    expect(getByText('Some features may not be available')).toBeTruthy();
  });
});
