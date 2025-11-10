"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import AdminProductTabs from "../components/AdminProductTabs";

type Product = {
  id: string;
  name: string;
};

type Variant = {
  id: string;
  size: string;
  color: string;
  stock: number;
};

export default function AdminProductUpdatePage() {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [variantsError, setVariantsError] = useState<string | null>(null);
  const [newVariant, setNewVariant] = useState({
    size: "",
    color: "",
    stock: "",
  });
  const [savingVariant, setSavingVariant] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const hasQuery = query.trim().length >= 1;
  const suggestions = useMemo(
    () => (showSuggestions ? searchResults : []),
    [showSuggestions, searchResults]
  );

  const handleSearchChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    setSelectedProduct(null);
    setVariants([]);
    setVariantsError(null);

    const trimmed = value.trim();
    if (trimmed.length < 1) {
      setShowSuggestions(false);
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError(null);
      return;
    }

    setShowSuggestions(true);
    setSearchLoading(true);
    setSearchError(null);
    try {
      const response = await fetch(
        `http://localhost:3001/products/search?name=${encodeURIComponent(trimmed)}`
      );
      if (!response.ok) {
        throw new Error("Ürün araması başarısız");
      }
      const data: Product[] = await response.json();
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setSearchResults([]);
      setSearchError("Ürünler yüklenirken bir hata oluştu.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setQuery(product.name);
    setShowSuggestions(false);
  };

  const loadVariants = async (productId: string) => {
    setVariants([]);
    setVariantsLoading(true);
    setVariantsError(null);
    try {
      const response = await fetch(`http://localhost:3001/products/${productId}/variants`);
      if (!response.ok) {
        throw new Error("Varyant bilgileri alınamadı");
      }
      const data: Variant[] = await response.json();
      setVariants(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setVariants([]);
      setVariantsError("Varyantlar yüklenirken bir hata oluştu.");
    } finally {
      setVariantsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedProduct) {
      setVariants([]);
      setVariantsError(null);
      setVariantsLoading(false);
      return;
    }
    void loadVariants(selectedProduct.id);
  }, [selectedProduct]);

  const handleVariantSubmit = async () => {
    if (!selectedProduct) {
      setSaveMessage("Lütfen önce bir ürün seçin.");
      return;
    }
    if (!newVariant.size || !newVariant.color.trim() || !newVariant.stock) {
      setSaveMessage("Lütfen tüm varyant alanlarını doldurun.");
      return;
    }

    setSavingVariant(true);
    setSaveMessage(null);
    try {
      const response = await fetch(
        `http://localhost:3001/products/${selectedProduct.id}/variants`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            size: newVariant.size,
            color: newVariant.color.trim(),
            stock: Number(newVariant.stock),
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Varyant kaydedilemedi");
      }

      setSaveMessage("Varyant eklendi/güncellendi.");
      setNewVariant({ size: "", color: "", stock: "" });
      if (selectedProduct) {
        await loadVariants(selectedProduct.id);
      }
    } catch (error) {
      console.error(error);
      setSaveMessage("Bir hata oluştu, lütfen tekrar deneyin.");
    } finally {
      setSavingVariant(false);
    }
  };

  return (
    <div className="container-base py-12 space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
          Admin / Ürünler
        </p>
        <h1 className="text-3xl font-semibold">Ürün Güncelleme</h1>
        <p className="text-sm text-neutral-500">
          Ürün varyantlarını arayıp görüntüleyin; bu arayüz backend API&apos;lerinden veri çekmektedir.
        </p>
      </div>

      <AdminProductTabs />

      <div className="rounded-lg border border-[var(--line)] bg-white p-6 shadow-sm space-y-6">
        <div className="space-y-3">
          <p className="text-xs text-neutral-500">
            Bu sayfa, NestJS API&apos;leri üzerinden gerçek ürün araması ve varyant sorgusu yapar.
          </p>
          <label className="text-sm font-medium text-neutral-700">
            Ürün Ara
            <input
              type="text"
              value={query}
              onChange={(event) => void handleSearchChange(event)}
              placeholder="Ürün ara..."
              className="mt-1 w-full rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </label>
          <p className="text-xs text-neutral-500">
            En az bir karakter girerek ürün araması yapabilirsiniz.
          </p>

          {hasQuery && showSuggestions ? (
            suggestions.length ? (
              <ul className="divide-y divide-[var(--line)] rounded-lg border border-[var(--line)] bg-[var(--background)]">
                {suggestions.map((product) => (
                  <li
                    key={product.id}
                    className="cursor-pointer px-4 py-3 text-sm transition-colors hover:bg-white"
                    onClick={() => handleSelectProduct(product)}
                  >
                    {product.name}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-lg border border-dashed border-[var(--line)] bg-[var(--background)] px-4 py-4 text-center text-sm text-neutral-500">
                {searchLoading
                  ? "Ürünler yükleniyor..."
                  : searchError ?? `"${query}" ile eşleşen ürün bulunamadı.`}
              </div>
            )
          ) : null}
        </div>

        {selectedProduct ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Varyant Listesi</h2>
                <p className="text-sm text-neutral-500">
                  {selectedProduct.name} ürününe ait varyant listesi.
                </p>
              </div>
              <span className="text-xs uppercase tracking-[0.2em] text-neutral-400">API</span>
            </div>

            <div className="overflow-hidden rounded-lg border border-[var(--line)]">
              <table className="min-w-full divide-y divide-[var(--line)] text-sm">
                <thead className="bg-[var(--background)] text-neutral-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Beden</th>
                    <th className="px-4 py-3 text-left font-semibold">Renk</th>
                    <th className="px-4 py-3 text-left font-semibold">Stok</th>
                    <th className="px-4 py-3 text-left font-semibold">İşlem</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[var(--line)]">
                  {variantsLoading ? (
                    <tr>
                      <td className="px-4 py-6 text-center text-sm text-neutral-500" colSpan={4}>
                        Varyantlar yükleniyor...
                      </td>
                    </tr>
                  ) : variantsError ? (
                    <tr>
                      <td className="px-4 py-6 text-center text-sm text-red-600" colSpan={4}>
                        {variantsError}
                      </td>
                    </tr>
                  ) : variants.length ? (
                    variants.map((variant) => (
                      <tr key={variant.id}>
                        <td className="px-4 py-3">{variant.size}</td>
                        <td className="px-4 py-3">{variant.color}</td>
                        <td className="px-4 py-3">{variant.stock}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button className="rounded-md border border-[var(--line)] px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-[var(--background)]">
                              Güncelle
                            </button>
                            <button className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50">
                              Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-6 text-center text-sm text-neutral-500" colSpan={4}>
                        Bu ürün için varyant bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="space-y-4 rounded-lg border border-dashed border-[var(--line)] bg-[var(--background)] p-4">
              <h3 className="text-base font-semibold text-neutral-900">Yeni Varyant Ekle</h3>
              <p className="text-sm text-neutral-500">
                Bu form üzerinden seçili ürüne yeni varyant ekleyebilir veya mevcut varyantın stokunu
                güncelleyebilirsiniz.
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                <label className="text-sm font-medium text-neutral-700">
                  Beden
                  <select
                    value={newVariant.size}
                    onChange={(event) =>
                      setNewVariant((prev) => ({ ...prev, size: event.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                  >
                    <option value="">Beden Seçin</option>
                    {["XS", "S", "M", "L", "XL"].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-medium text-neutral-700">
                  Renk
                  <input
                    type="text"
                    placeholder="Örn. Taupe"
                    value={newVariant.color}
                    onChange={(event) =>
                      setNewVariant((prev) => ({ ...prev, color: event.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                  />
                </label>
                <label className="text-sm font-medium text-neutral-700">
                  Stok
                  <input
                    type="number"
                    min="0"
                    placeholder="Örn. 25"
                    value={newVariant.stock}
                    onChange={(event) =>
                      setNewVariant((prev) => ({ ...prev, stock: event.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                  />
              </label>
            </div>
            {saveMessage ? (
              <p
                className={`text-sm ${
                  saveMessage.includes("hata") ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {saveMessage}
              </p>
            ) : null}
            <div>
              <button
                onClick={handleVariantSubmit}
                disabled={savingVariant}
                className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-60"
              >
                {savingVariant ? "Kaydediliyor..." : "Ekle"}
              </button>
            </div>
          </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--line)] bg-[var(--background)] px-4 py-8 text-center text-sm text-neutral-500">
            Bir ürün seçtiğinizde varyant listesi burada görüntülenir.
          </div>
        )}
      </div>
    </div>
  );
}
