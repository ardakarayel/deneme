export type Product = {
  id: string;
  name: string;
  category: string;
  subcategory?: string | null;
  price: number;
  stock: number;
  imageUrl: string;
  description?: string | null;
  color?: string | null;
  size?: string | null;
};
