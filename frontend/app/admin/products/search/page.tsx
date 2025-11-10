"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import AdminProductTabs from "../components/AdminProductTabs";

type ProductResult = {
  id: string;
  name: string;
  category: string;
  subcategory?: string | null;
  price: number | string;
  stock?: number | null;
  imageUrl?: string | null;
  description?: string | null;
  color?: string | null;
  size?: string | null;
};

type Variant = {
  id: string;
  size: string;
  color: string;
  stock: number;
};

export default function AdminProductSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductResult[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductResult | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [variantMap, setVariantMap] = useState<Record<
    string,
    { isOpen: boolean; loading: boolean; error?: string | null; data: Variant[] }
  >>({});
  const variantMapRef = useRef(variantMap);

  useEffect(() => {
    variantMapRef.current = variantMap;
  }, [variantMap]);

  const hasQuery = query.trim().length >= 1;

  const suggestions = useMemo(
    () => (showSuggestions ? results : []),
    [results, showSuggestions]
  );

  const selectedVariantState = selectedProduct ? variantMap[selectedProduct.id] : undefined;
  const aggregated = selectedProduct ? aggregateVariantInfo(selectedVariantState) : null;

  const fetchVariantsForProduct = useCallback(
    async (productId: string, options: { force?: boolean; setOpen?: boolean } = {}) => {
      const current = variantMapRef.current[productId];
      if (
        !options.force &&
        current &&
        (current.loading || current.data.length > 0)
      ) {
        if (options.setOpen !== undefined && current.isOpen !== options.setOpen) {
          setVariantMap((prev) => ({
            ...prev,
            [productId]: {
              ...prev[productId],
              isOpen: options.setOpen!,
            },
          }));
        }
        return;
      }

      setVariantMap((prev) => ({
        ...prev,
        [productId]: {
          isOpen: options.setOpen ?? prev[productId]?.isOpen ?? false,
          loading: true,
          data: prev[productId]?.data ?? [],
          error: null,
        },
      }));

      try {
        const response = await fetch(
          `http://localhost:3001/products/${productId}/variants`
        );
        if (!response.ok) {
          throw new Error("Varyantlar getirilemedi");
        }
        const data: Variant[] = await response.json();
        setVariantMap((prev) => ({
          ...prev,
          [productId]: {
            ...prev[productId],
            isOpen: options.setOpen ?? prev[productId]?.isOpen ?? false,
            loading: false,
            data: Array.isArray(data) ? data : [],
            error: null,
          },
        }));
      } catch (error) {
        console.error(error);
        setVariantMap((prev) => ({
          ...prev,
          [productId]: {
            ...prev[productId],
            isOpen: options.setOpen ?? prev[productId]?.isOpen ?? false,
            loading: false,
            data: [],
            error: "Varyantlar yüklenirken bir hata oluştu.",
          },
        }));
      }
    },
    []
  );

  useEffect(() => {
    if (!selectedProduct) return;
    void fetchVariantsForProduct(selectedProduct.id);
  }, [selectedProduct, fetchVariantsForProduct]);

  const handleVariantToggle = useCallback(
    async (productId: string) => {
      const current = variantMapRef.current[productId];
      if (current?.isOpen) {
        setVariantMap((prev) => ({
          ...prev,
          [productId]: {
            ...prev[productId],
            isOpen: false,
          },
        }));
        return;
      }

      await fetchVariantsForProduct(productId, {
        force: !!current?.error,
        setOpen: true,
      });
    },
    [fetchVariantsForProduct]
  );

  const handleSearchChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    setSelectedProduct(null);
    setShowSuggestions(true);

    if (value.trim().length < 1) {
      setResults([]);
      return;
    }

    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-base py-12 space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
          Admin / Ürünler
        </p>
        <h1 className="text-2xl font-semibold">Ürün Arama</h1>
        <p className="text-sm text-neutral-500">
          Ürün adı yazarak veritabanındaki kayıtları hızlıca bulun. Silme işlemi bu sekmede yapılmaz.
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
              onChange={(event) => void handleSearchChange(event)}
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
                              src={product.imageUrl ?? "/images/placeholder.png"}
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
                    {isLoading ? "Ürünler yükleniyor..." : `"${query}" ile eşleşen ürün bulunamadı.`}
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
            <div className="rounded-md border border-[var(--line)] bg-white p-4 shadow-sm space-y-6">
              <div className="flex flex-col gap-2 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">
                    {selectedProduct.name}
                  </h2>
                  <p className="text-sm text-neutral-500">
                    Aşağıda ürünün tüm detaylarını görüntüleyebilirsiniz.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-gray-200 bg-[var(--background)]">
                {getProductDetails(selectedProduct, aggregated).map(({ label, value, isImage }) => (
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
                            src={selectedProduct.imageUrl ?? "/images/placeholder.png"}
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
              {selectedVariantState?.loading ? (
                <p className="text-xs text-neutral-500">Varyant bilgileri yükleniyor...</p>
              ) : selectedVariantState?.error ? (
                <p className="text-xs text-red-600">{selectedVariantState.error}</p>
              ) : null}
              <VariantSection
                productId={selectedProduct.id}
                productName={selectedProduct.name}
                variantState={variantMap[selectedProduct.id]}
                onToggle={() => void handleVariantToggle(selectedProduct.id)}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function VariantSection({
  productId,
  productName,
  variantState,
  onToggle,
}: {
  productId: string;
  productName: string;
  variantState?: { isOpen: boolean; loading: boolean; error?: string | null; data: Variant[] };
  onToggle: () => void;
}) {
  const isOpen = variantState?.isOpen ?? false;
  const loading = variantState?.loading ?? false;
  const error = variantState?.error;
  const variants = variantState?.data ?? [];

  return (
    <div className="space-y-3 rounded-lg border border-[var(--line)] bg-[var(--background)] p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-800">Varyantlar</p>
          <p className="text-xs text-neutral-500">{productName} için varyant detayları.</p>
        </div>
        <button
          onClick={onToggle}
          className="rounded-md border border-[var(--line)] px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-white"
        >
          {isOpen ? "Varyantları Gizle" : "Varyantları Gör"}
        </button>
      </div>

      {isOpen ? (
        <div className="mt-4 rounded-lg border border-white bg-white">
          {loading ? (
            <p className="px-4 py-4 text-center text-sm text-neutral-500">Varyantlar yükleniyor...</p>
          ) : error ? (
            <p className="px-4 py-4 text-center text-sm text-red-600">{error}</p>
          ) : variants.length === 0 ? (
            <p className="px-4 py-4 text-center text-sm text-neutral-500">
              Bu ürün için varyant bulunamadı.
            </p>
          ) : (
            <table className="min-w-full divide-y divide-[var(--line)] text-sm">
              <thead className="bg-[var(--background)] text-neutral-600">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Beden</th>
                  <th className="px-4 py-2 text-left font-semibold">Renk</th>
                  <th className="px-4 py-2 text-left font-semibold">Stok</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {variants.map((variant) => (
                  <tr key={`${productId}-${variant.id}`}>
                    <td className="px-4 py-2">{variant.size}</td>
                    <td className="px-4 py-2">{variant.color}</td>
                    <td className="px-4 py-2">{variant.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : null}
    </div>
  );
}

function aggregateVariantInfo(
  variantState?: { data: Variant[] }
): { colors: string; sizes: string; totalStock: number } | null {
  if (!variantState || !variantState.data.length) {
    return null;
  }

  const colors = Array.from(new Set(variantState.data.map((v) => v.color))).join(", ");
  const sizes = Array.from(new Set(variantState.data.map((v) => v.size))).join(", ");
  const totalStock = variantState.data.reduce((sum, variant) => sum + (variant.stock || 0), 0);

  return { colors, sizes, totalStock };
}

function getProductDetails(
  product: ProductResult,
  aggregated: ReturnType<typeof aggregateVariantInfo> | null
) {
  const priceValue =
    typeof product.price === "number" ? product.price : Number(product.price ?? 0);
  const colorValue = aggregated ? aggregated.colors || "-" : formatNullable(product.color);
  const sizeValue = aggregated ? aggregated.sizes || "-" : formatNullable(product.size);
  const stockValue = aggregated
    ? aggregated.totalStock.toString()
    : product.stock?.toString() ?? "0";

  return [
    { label: "ID", value: product.id },
    { label: "Ürün Adı", value: product.name },
    { label: "Kategori", value: product.category },
    { label: "Alt Kategori", value: product.subcategory ?? "NULL" },
    { label: "Fiyat", value: `₺${priceValue.toFixed(2)}` },
    { label: "Stok", value: stockValue },
    { label: "Renk", value: colorValue },
    { label: "Beden", value: sizeValue },
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
