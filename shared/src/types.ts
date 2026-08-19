export type Role =
  | "SUPER_ADMIN"
  | "PRODUCT_MANAGER"
  | "ORDER_MANAGER"
  | "MARKETING_MANAGER"
  | "SUPPORT_STAFF"
  | "CUSTOMER";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "PACKED"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "FAILED"
  | "RETURNED"
  | "REFUNDED";

export type PaymentMethod = "COD" | "BKASH" | "NAGAD" | "SSLCOMMERZ" | "CARD";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type DiscountType = "PERCENTAGE" | "FIXED" | "FREE_DELIVERY";

export type GenderTarget = "ALL" | "MEN" | "WOMEN" | "UNISEX";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  avatarUrl?: string | null;
  preferredSkinType?: string | null;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  recipientName: string;
  phone: string;
  division: string;
  district: string;
  area: string;
  fullAddress: string;
  postalCode?: string | null;
  isDefault: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  description?: string | null;
  country?: string | null;
  website?: string | null;
  isFeatured: boolean;
  productCount?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  parentId?: string | null;
  isFeatured: boolean;
  productCount?: number;
}

export interface SkinType {
  id: string;
  name: string; // Normal, Dry, Oily, Combination, Sensitive
  slug: string;
  description?: string | null;
}

export interface SkinConcern {
  id: string;
  name: string; // Acne, Dark Spots, Hyperpigmentation, Dryness, Aging, Dullness, Redness, Uneven Skin Tone
  slug: string;
  description?: string | null;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brandId: string;
  brand?: Brand;
  categoryId: string;
  category?: Category;
  description: string;
  shortDescription?: string | null;
  price: number;
  compareAtPrice?: number | null;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  gender: GenderTarget;
  weight?: string | null;
  volume?: string | null;
  ingredients?: string | null;
  benefits?: string | null;
  howToUse?: string | null;
  countryOfOrigin?: string | null;
  expiryInformation?: string | null;
  averageRating: number;
  reviewCount: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isTrending: boolean;
  badge?: string | null;
  images: ProductImage[];
  skinTypes?: SkinType[];
  skinConcerns?: SkinConcern[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Cart {
  id: string;
  userId?: string | null;
  sessionId?: string | null;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  appliedCoupon?: Coupon | null;
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  addedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: DiscountType;
  value: number; // e.g. 10 for 10% or 300 for ৳300
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  startDate: string;
  expiryDate: string;
  usageLimit?: number | null;
  usedCount: number;
  isActive: boolean;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  productSku: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderTimelineEvent {
  id: string;
  orderId: string;
  status: OrderStatus;
  note?: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string | null;
  user?: UserProfile | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  division: string;
  district: string;
  area: string;
  fullAddress: string;
  postalCode?: string | null;
  deliveryMethod: "STANDARD" | "EXPRESS";
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string | null;
  shippingFee: number;
  totalAmount: number;
  notes?: string | null;
  trackingNumber?: string | null;
  courierName?: string | null;
  estimatedDelivery?: string | null;
  timeline: OrderTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  product?: Product;
  userId: string;
  user?: UserProfile;
  userName: string;
  userAvatar?: string | null;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED";
  isFeatured: boolean;
  createdAt: string;
}

export interface HomepageSectionConfig {
  id: string;
  sectionKey: string;
  title: string;
  subtitle?: string | null;
  content?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  buttonText?: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface SkinQuizResult {
  skinType: string;
  primaryConcern: string;
  sensitivityLevel: "LOW" | "MEDIUM" | "HIGH";
  morningRoutine: {
    step: number;
    category: string;
    product: Product;
    howToApply: string;
  }[];
  nightRoutine: {
    step: number;
    category: string;
    product: Product;
    howToApply: string;
  }[];
  tips: string[];
}
