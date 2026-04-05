export interface CreateOrderInput {
  cart_id: string;
  customer_id: string;
  payment_method_id: string;
  discount_code?: string;
}

export interface CreateOrderOutput {
  order_id: string;
  status: 'confirmed';
  total_cents: number;
  estimated_delivery: string;
}

export interface CartItem {
  item_id: string;
  name: string;
  quantity: number;
  price_cents: number;
}

export interface Pricing {
  subtotal_cents: number;
  discount_cents: number;
  tax_cents: number;
  total_cents: number;
}

export interface Order {
  id: string;
  customer_id: string;
  items: CartItem[];
  pricing: Pricing;
  payment_method_id: string;
  status: 'confirmed';
  estimated_delivery: string;
  created_at: string;
}
