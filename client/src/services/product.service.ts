import { api } from './api';
import { ApiResponse, Product, Brand, Category, SkinType, SkinConcern } from '@skincare/shared';

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  skinType?: string;
  skinConcern?: string;
  gender?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  availability?: string;
  sort?: string;
  search?: string;
  isBestSeller?: string;
  isFeatured?: string;
  isNewArrival?: string;
  isTrending?: string;
}

export const productService = {
  async getProducts(params: ProductQueryParams = {}) {
    const res = await api.get<ApiResponse<Product[]>>('/products', { params });
    return res.data;
  },

  async getProductBySlug(slug: string) {
    const res = await api.get<ApiResponse<Product & { relatedProducts: Product[]; frequentlyBought: Product[]; reviews: any[] }>>(`/products/${slug}`);
    return res.data.data;
  },

  async getSearchSuggestions(q: string) {
    const res = await api.get<ApiResponse<{ products: any[]; brands: any[]; categories: any[] }>>('/products/search/suggestions', {
      params: { q },
    });
    return res.data.data;
  },

  async getCategories() {
    const res = await api.get<ApiResponse<Category[]>>('/products/categories');
    return res.data.data || [];
  },

  async getBrands() {
    const res = await api.get<ApiResponse<Brand[]>>('/products/brands');
    return res.data.data || [];
  },

  async getTaxonomies() {
    const res = await api.get<ApiResponse<{ skinTypes: SkinType[]; skinConcerns: SkinConcern[] }>>('/products/taxonomies');
    return res.data.data || { skinTypes: [], skinConcerns: [] };
  },

  async getFeaturedReviews() {
    const res = await api.get<ApiResponse<any[]>>('/reviews/featured');
    return res.data.data || [];
  },
};
