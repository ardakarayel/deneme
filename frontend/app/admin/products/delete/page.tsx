"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import AdminProductTabs from "../components/AdminProductTabs";
import { toast } from "react-hot-toast";

type ProductResult = {
  id: string;
  name: string;
  category: string;
  subcategory?: string | null;
  price: number | string;
  stock: number;
  imageUrl: string;
  description?: string | null;
  color?: string | null;
  size?: string | null;
};

export default function AdminProductDeletePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductResult[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductResult | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const normalizedQuery = query.trim();
  const hasQuery = normalizedQuery.length >= 1;

  const suggestions = useMemo(() => (showSuggestions ? results : []), [showSuggestions, results]);

  const handleSearchChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    setSelectedProduct(null);
    setShowSuggestions(true);

    if (value.trim().length < 1) {
      setResults([]);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/products?search=${encodeURIComponent(value.trim())}`
      );
      if (!response.ok) {
        throw new Error("Backend search error");
      }
      const data: ProductResult[] = await response.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setResults([]);
    }
  };

  const handleDelete = async (product: ProductResult) => {
    if (isDeleting) return;
    const confirmed = window.confirm("Bu ürünü silmek istiyor musunuz?");
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`http://localhost:3001/products/${product.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      console.log("Deleted product:", product.id);
      toast.success("✅ Ürün başarıyla silindi.");

      setQuery("");
      setSelectedProduct(null);
      setShowSuggestions(false);
      setResults([]);
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("❌ Ürün silinirken hata oluştu.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container-base py-12 space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
          Admin / Ürünler
        </p>
        <h1 className="text-2xl font-semibold">Silme Sayfası</h1>
        <p className="text-sm text-neutral-500">
          Ürün araması yaparak silme işlemini simüle edebilirsiniz.
        </p>
      </div>

      <AdminProductTabs />

      <div className="rounded-lg border border-[var(--line)] bg-white p-6 space-y-6 shadow-sm">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">
            Ürün Ara
            <input
              type="text"
              value={query}
              onChange={(event) => {
                void handleSearchChange(event);
              }}
              placeholder="Ürün adı yazın (ör. Wool...)"
              className="mt-1 w-full rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </label>
          <p className="text-xs text-neutral-500">
            En az 1 karakter girerek veritabanındaki ürünleri arayın. Sonuçlar otomatik olarak listelenir.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            {hasQuery ? (
              showSuggestions ? (
                suggestions.length ? (
                  <ul className="divide-y divide-[var(--line)] rounded-lg border border-[var(--line)] bg-[var(--background)]">
                    {suggestions.map((product) => (
                      <li
                        key={product.id}
                        className="cursor-pointer px-4 py-3 text-sm transition-colors hover:bg-gray-100"
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowSuggestions(false);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-white">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-neutral-900">{product.name}</span>
                            <span className="text-xs text-neutral-500">
                              {product.category} · ₺
                              {typeof product.price === "number"
                                ? product.price.toFixed(2)
                                : Number(product.price || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="rounded-lg border border-dashed border-[var(--line)] bg-[var(--background)] px-4 py-6 text-center text-sm text-neutral-500">
                    "{query}" ile eşleşen ürün bulunamadı.
                  </div>
                )
              ) : null
            ) : (
              <div className="rounded-lg border border-dashed border-[var(--line)] bg-[var(--background)] px-4 py-6 text-center text-sm text-neutral-500">
                Aramaya başlamak için en az 1 karakter yazın.
              </div>
            )}
          </div>

          {selectedProduct ? (
            <div className="rounded-md border border-[var(--line)] bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-2 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">
                    {selectedProduct.name}
                  </h2>
                  <p className="text-sm text-neutral-500">
                    Detayları görüntülüyorsunuz. Silmek için aşağıdaki butonu kullanın.
                  </p>
                </div>
                <button
                  className="btn bg-red-500 text-white w-full sm:w-auto disabled:opacity-70"
                  onClick={() => handleDelete(selectedProduct)}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Siliniyor..." : "Sil"}
                </button>
              </div>

              <div className="mt-4 rounded-lg border border-gray-200 bg-[var(--background)]">
                {getProductDetails(selectedProduct).map(({ label, value, isImage }) => (
                  <div
                    key={label}
                    className="flex flex-col justify-between gap-2 border-b border-gray-200 px-4 py-2 last:border-0 sm:flex-row sm:items-center"
                  >
                    <span className="font-medium text-gray-900">{label}</span>
                    {isImage ? (
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <span className="text-sm text-gray-700 break-words">{value}</span>
                        <div className="h-20 w-20 overflow-hidden rounded border border-gray-200 bg-gray-50">
                          <img
                            src={selectedProduct.imageUrl}
                            alt={selectedProduct.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-700 break-words">{value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function getProductDetails(product: ProductResult) {
  const priceValue =
    typeof product.price === "number" ? product.price : Number(product.price ?? 0);

  return [
    { label: "ID", value: product.id },
    { label: "Ürün Adı", value: product.name },
    { label: "Kategori", value: product.category },
    { label: "Alt Kategori", value: product.subcategory ?? "NULL" },
    { label: "Fiyat", value: `₺${priceValue.toFixed(2)}` },
    { label: "Stok", value: product.stock?.toString() ?? "0" },
    { label: "Renk", value: formatNullable(product.color) },
    { label: "Beden", value: formatNullable(product.size) },
    { label: "Görsel", value: product.imageUrl ?? "-", isImage: true },
    { label: "Açıklama", value: product.description ?? "NULL" },
  ];
}

function formatNullable(value?: string | null) {
  if (value === null || value === undefined || value === "") {
    return "NULL";
  }
  return value;
}
