import { useQuery } from '@tanstack/react-query';
import { apiClient } from './apiClient';
import { PRICE_MULTIPLIER, STALE_TIME_MS } from '@constants/student';

export interface RawProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

export const fetchProducts = async (): Promise<Product[]> => {
  const response = await apiClient.get<RawProduct[]>('/products?limit=12');
  return response.data.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    category: item.category,
    image: item.image,
    price: Math.round(item.price * PRICE_MULTIPLIER),
  }));
};

export function useProductsQuery() {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: STALE_TIME_MS,
  });
}
