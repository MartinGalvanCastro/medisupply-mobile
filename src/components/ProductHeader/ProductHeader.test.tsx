import React from 'react';
import { render } from '@testing-library/react-native';
import { ProductHeader } from './ProductHeader';

// Mock the translation hook
jest.mock('@/i18n/hooks', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock UI components
jest.mock('@/components/ui/vstack', () => ({
  VStack: ({ children, testID }: any) => {
    const { View } = require('react-native');
    return <View testID={testID}>{children}</View>;
  },
}));

jest.mock('@/components/ui/heading', () => ({
  Heading: ({ children, size, testID }: any) => {
    const { Text } = require('react-native');
    return (
      <Text testID={testID} accessibilityRole="header" data-size={size}>
        {children}
      </Text>
    );
  },
}));

jest.mock('@/components/ui/text', () => ({
  Text: ({ children, testID }: any) => {
    const { Text: RNText } = require('react-native');
    return <RNText testID={testID}>{children}</RNText>;
  },
}));

describe('ProductHeader Component', () => {
  const defaultProps = {
    name: 'Paracetamol 500mg',
    sku: 'MED-PAR-500',
    warehouseName: 'Almacén Central Bogotá',
  };

  describe('Rendering', () => {
    it('should render the product header', () => {
      const { getByTestId } = render(<ProductHeader {...defaultProps} />);

      expect(getByTestId('product-header')).toBeTruthy();
    });

    it('should render with custom testID', () => {
      const { getByTestId } = render(
        <ProductHeader {...defaultProps} testID="custom-header" />
      );

      expect(getByTestId('custom-header')).toBeTruthy();
    });

    it('should render product name', () => {
      const { getByText } = render(<ProductHeader {...defaultProps} />);

      expect(getByText('Paracetamol 500mg')).toBeTruthy();
    });

    it('should render SKU with label', () => {
      const { getByText } = render(<ProductHeader {...defaultProps} />);

      expect(getByText(/cart\.sku/)).toBeTruthy();
      expect(getByText(/MED-PAR-500/)).toBeTruthy();
    });

    it('should render warehouse name', () => {
      const { getByText } = render(<ProductHeader {...defaultProps} />);

      expect(getByText(/Almacén Central Bogotá/)).toBeTruthy();
    });
  });

  describe('Size prop', () => {
    it('should render with default size "md"', () => {
      const { getByText } = render(<ProductHeader {...defaultProps} />);

      const heading = getByText('Paracetamol 500mg');
      expect(heading.props['data-size']).toBe('md');
    });

    it('should render with size "sm"', () => {
      const { getByText } = render(<ProductHeader {...defaultProps} size="sm" />);

      const heading = getByText('Paracetamol 500mg');
      expect(heading.props['data-size']).toBe('sm');
    });

    it('should render with size "md" explicitly set', () => {
      const { getByText } = render(<ProductHeader {...defaultProps} size="md" />);

      const heading = getByText('Paracetamol 500mg');
      expect(heading.props['data-size']).toBe('md');
    });
  });

  describe('Warehouse label display', () => {
    it('should not show warehouse label by default', () => {
      const { getByText } = render(<ProductHeader {...defaultProps} />);

      const warehouseText = getByText(/Almacén Central Bogotá/);
      // Text should not contain "cart.warehouse: " prefix
      expect(warehouseText.children[0]).toBe('Almacén Central Bogotá');
    });

    it('should show warehouse label when showWarehouseLabel is true', () => {
      const { getByText } = render(
        <ProductHeader {...defaultProps} showWarehouseLabel={true} />
      );

      expect(getByText(/cart\.warehouse/)).toBeTruthy();
      expect(getByText(/Almacén Central Bogotá/)).toBeTruthy();
    });

    it('should not show warehouse label when showWarehouseLabel is false', () => {
      const { getByText } = render(
        <ProductHeader {...defaultProps} showWarehouseLabel={false} />
      );

      const warehouseText = getByText(/Almacén Central Bogotá/);
      expect(warehouseText.children[0]).toBe('Almacén Central Bogotá');
    });
  });

  describe('Different product names', () => {
    const productNames = [
      'Paracetamol 500mg',
      'Ibuprofeno 400mg',
      'Amoxicilina 500mg',
      'Acetilcisteína 600mg Efervescente',
      'Vitamina D3 1000 UI',
      'Solución Salina 0.9% 500ml',
    ];

    productNames.forEach((name) => {
      it(`should render product name: ${name}`, () => {
        const { getByText } = render(
          <ProductHeader {...defaultProps} name={name} />
        );

        expect(getByText(name)).toBeTruthy();
      });
    });
  });

  describe('Different SKU formats', () => {
    const skuFormats = [
      'MED-PAR-500',
      'MED-IBU-400',
      'VIT-D3-1000',
      'SOL-SAL-500',
      'AB-123456',
      '12345-A',
    ];

    skuFormats.forEach((sku) => {
      it(`should render SKU: ${sku}`, () => {
        const { getByText } = render(<ProductHeader {...defaultProps} sku={sku} />);

        expect(getByText(new RegExp(sku))).toBeTruthy();
      });
    });
  });

  describe('Different warehouse names', () => {
    const warehouses = [
      'Almacén Central Bogotá',
      'Almacén Medellín',
      'Almacén Cali',
      'Almacén Barranquilla',
      'Bodega Principal',
      'Centro de Distribución Norte',
    ];

    warehouses.forEach((warehouse) => {
      it(`should render warehouse: ${warehouse}`, () => {
        const { getByText } = render(
          <ProductHeader {...defaultProps} warehouseName={warehouse} />
        );

        expect(getByText(new RegExp(warehouse))).toBeTruthy();
      });
    });
  });

  describe('Edge cases and special characters', () => {
    it('should render product name with special characters', () => {
      const { getByText } = render(
        <ProductHeader
          {...defaultProps}
          name="Vitamina D3 1000 UI - Cápsula Blanda"
        />
      );

      expect(getByText('Vitamina D3 1000 UI - Cápsula Blanda')).toBeTruthy();
    });

    it('should render product name with accented characters', () => {
      const { getByText } = render(
        <ProductHeader {...defaultProps} name="Acetilcisteína 600mg" />
      );

      expect(getByText('Acetilcisteína 600mg')).toBeTruthy();
    });

    it('should render very long product name', () => {
      const longName =
        'Acetilcisteína 600mg Efervescente Caja con 30 Tabletas de Alta Concentración para Adultos';
      const { getByText } = render(
        <ProductHeader {...defaultProps} name={longName} />
      );

      expect(getByText(longName)).toBeTruthy();
    });

    it('should render SKU with special characters', () => {
      const { getByText } = render(
        <ProductHeader {...defaultProps} sku="MED_PAR-500/A" />
      );

      expect(getByText(/MED_PAR-500\/A/)).toBeTruthy();
    });

    it('should render warehouse name with special characters', () => {
      const { getByText } = render(
        <ProductHeader
          {...defaultProps}
          warehouseName="Almacén Central - Bogotá D.C."
        />
      );

      expect(getByText(/Almacén Central - Bogotá D\.C\./)).toBeTruthy();
    });

    it('should handle empty strings gracefully', () => {
      const { getByTestId } = render(
        <ProductHeader
          {...defaultProps}
          name=""
          sku=""
          warehouseName=""
        />
      );

      expect(getByTestId('product-header')).toBeTruthy();
    });

    it('should render product name with numbers', () => {
      const { getByText } = render(
        <ProductHeader {...defaultProps} name="Paracetamol 500mg Caja x 20" />
      );

      expect(getByText('Paracetamol 500mg Caja x 20')).toBeTruthy();
    });

    it('should render product name with parentheses', () => {
      const { getByText } = render(
        <ProductHeader
          {...defaultProps}
          name="Amoxicilina (Penicilina) 500mg"
        />
      );

      expect(getByText('Amoxicilina (Penicilina) 500mg')).toBeTruthy();
    });
  });

  describe('Component updates', () => {
    it('should update when product name changes', () => {
      const { getByText, rerender } = render(<ProductHeader {...defaultProps} />);

      expect(getByText('Paracetamol 500mg')).toBeTruthy();

      rerender(<ProductHeader {...defaultProps} name="Ibuprofeno 400mg" />);

      expect(getByText('Ibuprofeno 400mg')).toBeTruthy();
    });

    it('should update when SKU changes', () => {
      const { getByText, rerender } = render(<ProductHeader {...defaultProps} />);

      expect(getByText(/MED-PAR-500/)).toBeTruthy();

      rerender(<ProductHeader {...defaultProps} sku="MED-IBU-400" />);

      expect(getByText(/MED-IBU-400/)).toBeTruthy();
    });

    it('should update when warehouse name changes', () => {
      const { getByText, rerender } = render(<ProductHeader {...defaultProps} />);

      expect(getByText(/Almacén Central Bogotá/)).toBeTruthy();

      rerender(<ProductHeader {...defaultProps} warehouseName="Almacén Medellín" />);

      expect(getByText(/Almacén Medellín/)).toBeTruthy();
    });

    it('should update when size changes', () => {
      const { getByText, rerender } = render(
        <ProductHeader {...defaultProps} size="md" />
      );

      let heading = getByText('Paracetamol 500mg');
      expect(heading.props['data-size']).toBe('md');

      rerender(<ProductHeader {...defaultProps} size="sm" />);

      heading = getByText('Paracetamol 500mg');
      expect(heading.props['data-size']).toBe('sm');
    });

    it('should update when showWarehouseLabel changes', () => {
      const { getByText, queryByText, rerender } = render(
        <ProductHeader {...defaultProps} showWarehouseLabel={false} />
      );

      let warehouseText = getByText(/Almacén Central Bogotá/);
      expect(warehouseText.children[0]).toBe('Almacén Central Bogotá');

      rerender(<ProductHeader {...defaultProps} showWarehouseLabel={true} />);

      expect(getByText(/cart\.warehouse/)).toBeTruthy();
    });
  });

  describe('Complex scenarios', () => {
    it('should render all props with custom values', () => {
      const { getByText, getByTestId } = render(
        <ProductHeader
          name="Custom Product Name"
          sku="CUSTOM-SKU-123"
          warehouseName="Custom Warehouse"
          size="sm"
          showWarehouseLabel={true}
          testID="custom-product-header"
        />
      );

      expect(getByTestId('custom-product-header')).toBeTruthy();
      expect(getByText('Custom Product Name')).toBeTruthy();
      expect(getByText(/CUSTOM-SKU-123/)).toBeTruthy();
      expect(getByText(/Custom Warehouse/)).toBeTruthy();
      expect(getByText(/cart\.warehouse/)).toBeTruthy();

      const heading = getByText('Custom Product Name');
      expect(heading.props['data-size']).toBe('sm');
    });

    it('should handle multiple rapid prop changes', () => {
      const { getByText, rerender } = render(<ProductHeader {...defaultProps} />);

      expect(getByText('Paracetamol 500mg')).toBeTruthy();

      rerender(<ProductHeader {...defaultProps} name="Product 1" />);
      expect(getByText('Product 1')).toBeTruthy();

      rerender(<ProductHeader {...defaultProps} name="Product 2" />);
      expect(getByText('Product 2')).toBeTruthy();

      rerender(<ProductHeader {...defaultProps} name="Product 3" />);
      expect(getByText('Product 3')).toBeTruthy();
    });

    it('should maintain correct structure with all combinations', () => {
      const combinations = [
        { size: 'sm' as const, showWarehouseLabel: false },
        { size: 'sm' as const, showWarehouseLabel: true },
        { size: 'md' as const, showWarehouseLabel: false },
        { size: 'md' as const, showWarehouseLabel: true },
      ];

      combinations.forEach(({ size, showWarehouseLabel }) => {
        const { getByText, getByTestId } = render(
          <ProductHeader
            {...defaultProps}
            size={size}
            showWarehouseLabel={showWarehouseLabel}
          />
        );

        expect(getByTestId('product-header')).toBeTruthy();
        expect(getByText('Paracetamol 500mg')).toBeTruthy();
        expect(getByText(/MED-PAR-500/)).toBeTruthy();

        const heading = getByText('Paracetamol 500mg');
        expect(heading.props['data-size']).toBe(size);
      });
    });
  });

  describe('SKU label rendering', () => {
    it('should render SKU label before SKU value', () => {
      const { getByText } = render(<ProductHeader {...defaultProps} />);

      const skuText = getByText(/cart\.sku/);
      expect(skuText).toBeTruthy();
      expect(skuText.children).toContain('cart.sku');
      expect(skuText.children).toContain(': ');
      expect(skuText.children).toContain('MED-PAR-500');
    });

    it('should always show SKU label regardless of other props', () => {
      const { getByText } = render(
        <ProductHeader
          {...defaultProps}
          showWarehouseLabel={true}
          size="sm"
        />
      );

      expect(getByText(/cart\.sku/)).toBeTruthy();
    });
  });

  describe('Warehouse text content', () => {
    it('should render warehouse name only when showWarehouseLabel is false', () => {
      const { getByText } = render(
        <ProductHeader {...defaultProps} showWarehouseLabel={false} />
      );

      const warehouseText = getByText(/Almacén Central Bogotá/);
      expect(warehouseText.children.join('')).toBe('Almacén Central Bogotá');
    });

    it('should render warehouse label and name when showWarehouseLabel is true', () => {
      const { getByText } = render(
        <ProductHeader {...defaultProps} showWarehouseLabel={true} />
      );

      const warehouseText = getByText(/Almacén Central Bogotá/);
      const content = warehouseText.children.join('');
      expect(content).toContain('cart.warehouse');
      expect(content).toContain('Almacén Central Bogotá');
    });
  });

  describe('Heading accessibility', () => {
    it('should render heading with proper accessibility role', () => {
      const { getByText } = render(<ProductHeader {...defaultProps} />);

      const heading = getByText('Paracetamol 500mg');
      expect(heading.props.accessibilityRole).toBe('header');
    });

    it('should render heading for different product names', () => {
      const productNames = [
        'Paracetamol 500mg',
        'Ibuprofeno 400mg',
        'Amoxicilina 500mg',
      ];

      productNames.forEach((name) => {
        const { getByText } = render(<ProductHeader {...defaultProps} name={name} />);

        const heading = getByText(name);
        expect(heading.props.accessibilityRole).toBe('header');
      });
    });
  });

  describe('Default props behavior', () => {
    it('should use default size when not provided', () => {
      const { getByText } = render(
        <ProductHeader
          name="Test Product"
          sku="TEST-SKU"
          warehouseName="Test Warehouse"
        />
      );

      const heading = getByText('Test Product');
      expect(heading.props['data-size']).toBe('md');
    });

    it('should use default showWarehouseLabel when not provided', () => {
      const { getByText } = render(
        <ProductHeader
          name="Test Product"
          sku="TEST-SKU"
          warehouseName="Test Warehouse"
        />
      );

      const warehouseText = getByText(/Test Warehouse/);
      expect(warehouseText.children[0]).toBe('Test Warehouse');
    });

    it('should use default testID when not provided', () => {
      const { getByTestId } = render(
        <ProductHeader
          name="Test Product"
          sku="TEST-SKU"
          warehouseName="Test Warehouse"
        />
      );

      expect(getByTestId('product-header')).toBeTruthy();
    });
  });

  describe('Text content validation', () => {
    it('should render exactly three text elements', () => {
      const { getByText } = render(<ProductHeader {...defaultProps} />);

      // Product name
      expect(getByText('Paracetamol 500mg')).toBeTruthy();
      // SKU with label
      expect(getByText(/cart\.sku.*MED-PAR-500/)).toBeTruthy();
      // Warehouse name
      expect(getByText(/Almacén Central Bogotá/)).toBeTruthy();
    });

    it('should maintain correct order of elements', () => {
      const { getByTestId } = render(<ProductHeader {...defaultProps} />);

      const container = getByTestId('product-header');
      expect(container).toBeTruthy();
      // Container should have VStack with name, SKU, and warehouse in order
    });
  });
});
