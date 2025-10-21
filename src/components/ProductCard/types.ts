export interface ProductCardProps {
  /**
   * Product ID
   */
  id: string;

  /**
   * Product name
   */
  name: string;

  /**
   * Product description
   */
  description?: string;

  /**
   * Product price
   */
  price?: number;

  /**
   * Available stock quantity
   */
  stock?: number;

  /**
   * Callback when card is pressed
   */
  onPress?: () => void;
}
