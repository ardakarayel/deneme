"use client";

import { useEffect, useState } from "react";
import AdminProductTabs from "../components/AdminProductTabs";
import ProductList from "../components/ProductList";

type Product = {
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

export default function AdminProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Ürünleri backend'den çek
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:3001/products");
        const data = await response.json();

        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Ürünler alınamadı:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="container-base py-12 space-y-8">

      {/* Başlık */}
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
            Admin / Ürünler
          </p>

          <h1 className="text-2xl font-semibold">Ürün Listesi</h1>

          <p className="text-sm text-neutral-500">
            Sistemde kayıtlı tüm ürünleri görüntüleyebilir ve yönetebilirsiniz.
          </p>
        </div>

        {/* Sekmeler */}
        <AdminProductTabs />
      </div>

      {/* Liste Alanı */}
      <div className="rounded-lg border border-[var(--line)] bg-white p-6 shadow-sm">
        {isLoading ? (
          <p className="text-sm text-neutral-500">Yükleniyor...</p>
        ) : products.length === 0 ? (
          <p className="text-sm text-neutral-500">Hiç ürün bulunamadı.</p>
        ) : (
          <ProductList products={products} />
        )}
      </div>
    </div>
  );
}
