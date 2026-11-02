export interface Product {
  id: string;
  name: string;
  slug: string;
  category: 'intima' | 'pantalones' | 'deportivo' | 'caballero' | 'mujer' | 'hombre' | 'ninos' | 'accesorios' | 'encargo';
  priceUsd: number;
  wholesalePriceUsd?: number;
  salePriceUsd?: number | null;
  costUsd: number;
  sku: string;
  description: string;
  image: string;
  secondaryImage?: string;
  sizes: string[];
  colors: string[];
  stock: number;
  isBespoke: boolean;
  depositRequiredPercent?: number;
  deliveryDays: string;
  featured: boolean;
  tags: string[];
  isNegotiable?: boolean;
  minWholesaleQty?: number;
  supplierOrigin?: string;
  pricingNotice?: string;
  rating?: number;
  reviewCount?: number;
  reviews?: ProductReview[];
}

export interface ProductReview {
  id: string;
  productId: string;
  userName: string;
  userCity: string;
  rating: number; // 1-5
  comment: string;
  fitFeedback?: 'exacta' | 'pequena' | 'grande';
  verifiedBuyer?: boolean;
  createdAt: string;
  helpfulCount?: number;
}

export interface CartItem {
  productId: string;
  product: Product;
  size: string;
  color: string;
  quantity: number;
  priceUsd: number;
  subtotalUsd: number;
  isWholesale?: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  size: string;
  color: string;
  quantity: number;
  priceUsd: number;
  subtotalUsd: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerDoc: string;
  state: string;
  city: string;
  deliveryAddress: string;
  shippingAgency: string;
  shippingAgencyName: string;
  paymentMethod: 'pagoMovil' | 'zelle' | 'binance' | 'transferencia' | 'efectivo';
  paymentRef: string;
  voucherUrl?: string;
  status: 'pendiente' | 'pago_verificado' | 'preparando' | 'enviado' | 'entregado' | 'cancelado';
  createdAt: string;
  items: OrderItem[];
  subtotalUsd: number;
  discountUsd: number;
  shippingFeeUsd: number;
  totalUsd: number;
  totalBs: number;
  notes?: string;
}

export interface StoreConfig {
  storeName: string;
  slogan: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  contactEmail: string;
  bcvRate: number;
  lastBcvUpdate: string;
  bcvSource?: string;
  autoSyncBcv?: boolean;
  paymentMethods: {
    pagoMovil: {
      banco: string;
      telefono: string;
      cedula: string;
      titular: string;
    };
    zelle: {
      email: string;
      titular: string;
    };
    binance: {
      payId: string;
      nickname: string;
      usdtNetwork: string;
    };
    transferencia: {
      banco: string;
      cuenta: string;
      titular: string;
    };
  };
  shippingAgencies: {
    id: string;
    name: string;
    desc: string;
    feeUsd: number;
  }[];
  coupons: {
    code: string;
    discountPercent: number;
    minPurchaseUsd: number;
    active: boolean;
    desc: string;
  }[];
}

export interface TrendInsight {
  title: string;
  category: 'mujer' | 'hombre' | 'ninos' | 'encargo' | 'accesorios';
  opportunityScore: number;
  demandLevel: string;
  targetSeason: string;
  targetAudience: string;
  whyTrending: string;
  targetPurchasePriceUsd: number;
  suggestedRetailPriceUsd: number;
  estimatedMarginPercent: number;
  recommendedStockUnits: number;
  sourcingLocations: string;
  badge: string;
}
