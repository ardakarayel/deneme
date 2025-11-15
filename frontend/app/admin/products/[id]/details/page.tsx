"use client";

import { useEffect, useState } from "react";
import AdminProductTabs from "../../components/AdminProductTabs";

export default function ProductDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    async function fetchProduct() {
      const res = await fetch(`http://localhost:3001/products/${id}`);
      const data = await res.json();
      setProduct(data);
    }

    fetchProduct();
  }, [id]);

  const handleAddVariant = () => {
    console.log("Add variant clicked for", id);
  };

  const handleDeleteProduct = () => {
    console.log("Delete product clicked for", id);
  };

  return (
    <div className="container-base py-12 space-y-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
            Admin / Ürünler
          </p>
          <h1 className="text-2xl font-semibold">Ürün Detayları</h1>
          <p className="text-sm text-neutral-500">
            Bu sayfada ürün bilgilerini ve varyantlarını yönetebilirsiniz.
          </p>
        </div>

        <AdminProductTabs />
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border border-[var(--line)] bg-[var(--background)] p-6 space-y-4">

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
              Ürün ID
            </p>
            <p className="text-lg font-semibold text-neutral-900">{id}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-neutral-700">Ürün Bilgisi</p>
            {product ? (
              <div className="text-sm text-neutral-900 space-y-1">
                <p><b>Ad:</b> {product.name}</p>
                <p><b>Kategori:</b> {product.category}</p>
                {product.subcategory && <p><b>Alt kategori:</b> {product.subcategory}</p>}
                <p><b>Fiyat:</b> ₺{product.price}</p>
                <p><b>Stok:</b> {product.stock}</p>
                {product.description && <p><b>Açıklama:</b> {product.description}</p>}
              </div>
            ) : (
              <p className="text-sm text-neutral-500">Ürün bilgisi yükleniyor…</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button className="btn btn-secondary" onClick={handleAddVariant}>
              Varyant Ekle
            </button>

            <button className="btn btn-outline" onClick={handleDeleteProduct}>
              Ürünü Sil
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
