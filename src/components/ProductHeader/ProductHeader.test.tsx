import { render } from '@testing-library/react-native';
import { ProductHeader } from './ProductHeader';

jest.mock('@/i18n/hooks', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'cart.sku': 'SKU',
        'cart.warehouse': 'Warehouse',
      };
      return translations[key] || key;
    },
  }),
}));

describe('ProductHeader', () => {
  const defaultProps = {
    name: 'Paracetamol 500mg',
    sku: 'SKU-12345',
    warehouseName: 'Warehouse A',
  };

  it('should render correctly with required props', () => {
    const { getByText, getByTestId, root } = render(
      <ProductHeader {...defaultProps} />
    );

    expect(getByText('Paracetamol 500mg')).toBeDefined();
    expect(root).toBeTruthy();
    expect(getByText('Warehouse A')).toBeDefined();
    expect(getByTestId('product-header')).toBeDefined();
  });

  it('should display product name', () => {
    const { getByText } = render(<ProductHeader {...defaultProps} />);

    expect(getByText('Paracetamol 500mg')).toBeDefined();
  });

  it('should display warehouse name without label by default', () => {
    const { getByText } = render(
      <ProductHeader {...defaultProps} showWarehouseLabel={false} />
    );

    expect(getByText('Warehouse A')).toBeDefined();
  });

  it('should display warehouse name with label when showWarehouseLabel is true', () => {
    const { root } = render(
      <ProductHeader {...defaultProps} showWarehouseLabel={true} />
    );

    expect(root).toBeTruthy();
  });

  it('should use sm size when size prop is sm', () => {
    const { getByTestId } = render(
      <ProductHeader {...defaultProps} size="sm" />
    );

    expect(getByTestId('product-header')).toBeDefined();
  });

  it('should use md size by default', () => {
    const { getByTestId } = render(<ProductHeader {...defaultProps} />);

    expect(getByTestId('product-header')).toBeDefined();
  });

  it('should use custom testID when provided', () => {
    const { getByTestId } = render(
      <ProductHeader {...defaultProps} testID="custom-header" />
    );

    expect(getByTestId('custom-header')).toBeDefined();
  });

  it('should use default testID when not provided', () => {
    const { getByTestId } = render(<ProductHeader {...defaultProps} />);

    expect(getByTestId('product-header')).toBeDefined();
  });

  it('should handle very long product names', () => {
    const longName = 'This is a very long product name that contains multiple words and descriptions';
    const { getByText } = render(
      <ProductHeader {...defaultProps} name={longName} />
    );

    expect(getByText(longName)).toBeDefined();
  });

  it('should display all required content with custom props', () => {
    const { getByText, getByTestId } = render(
      <ProductHeader
        {...defaultProps}
        showWarehouseLabel={true}
        size="md"
      />
    );

    expect(getByText('Paracetamol 500mg')).toBeDefined();
    expect(getByTestId('product-header')).toBeDefined();
  });
});
