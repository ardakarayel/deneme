"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import AdminProductTabs from "../components/AdminProductTabs";

const CATEGORY_OPTIONS = {
  Women: ["Knitwear", "Coats & Jackets", "Shirts", "Accessories"],
  Men: ["Shirts", "Bottoms", "Accessories"],
  Beauty: ["Skincare", "Makeup", "Perfume"],
} as const;

type CategoryKey = keyof typeof CATEGORY_OPTIONS;
const CATEGORY_KEYS = Object.keys(CATEGORY_OPTIONS) as CategoryKey[];

type ProductForm = {
  name: string;
  category: CategoryKey | "";
  subcategory: string;
  price: string;
  imageUrl: string;
  description: string;
  stock: string;   // 🔥 BUNU EKLE
};


const initialFormState: ProductForm = {
  name: "",
  category: "",
  subcategory: "",
  price: "",
  imageUrl: "",
  description: "",
  stock: "",   // 🔥 EKLE
};


export default function AdminProductAddPage() {
  const router = useRouter();
  const [form, setForm] = useState<ProductForm>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (field: keyof ProductForm) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const subcategories = form.category ? CATEGORY_OPTIONS[form.category] : [];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const requiredFields = {
      name: form.name.trim(),
      category: form.category,
      price: form.price.trim(),
      imageUrl: form.imageUrl.trim(),
      stock: Number(form.stock),

    };

    const hasMissingRequired = Object.values(requiredFields).some(
      (value) => value === "" || value === undefined,
    );

    const shouldSelectSubcategory =
      form.category !== "" && (CATEGORY_OPTIONS[form.category]?.length ?? 0) > 0;
    const isSubcategoryMissing = shouldSelectSubcategory && form.subcategory === "";

    if (hasMissingRequired || isSubcategoryMissing) {
      setErrorMessage("Lütfen tüm zorunlu alanları doldurun.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {

      const payload: Record<string, unknown> = {
  name: form.name.trim(),
  category: form.category,
  price: Number(form.price),
  stock: Number(form.stock),     // 🔥 ZORUNLU
  imageUrl: form.imageUrl.trim(),
};

    

      if (form.subcategory.trim()) {
        payload.subcategory = form.subcategory.trim();
      }

      if (form.description.trim()) {
        payload.description = form.description.trim();
      }

      const response = await fetch("http://localhost:3001/products", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});



      if (!response.ok) {
        throw new Error("Failed to add product");
      }

      const createdProduct = await response.json();

      if (!createdProduct?.id) {
        throw new Error("Invalid product response");
      }

      router.push(`/admin/products/${createdProduct.id}/details`);
    } catch (error) {
      console.error(error);
      setErrorMessage("Ürün eklenemedi. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-base py-12 space-y-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
            Admin / Ürünler
          </p>
          <h1 className="text-2xl font-semibold">Yeni Ürün Ekle</h1>
          <p className="text-sm text-neutral-500">
            Mağazanıza hızlıca yeni ürünler eklemek için aşağıdaki formu doldurun.
          </p>
        </div>
        <AdminProductTabs />
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <label className="text-sm font-medium text-neutral-700">
            Ürün Adı
            <input
              type="text"
              value={form.name}
              onChange={(event) => handleChange("name")(event.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
              placeholder="Örn. Wool Blend Coat"
              required
            />
          </label>

          <label className="text-sm font-medium text-neutral-700">
            Kategori
            <select
              value={form.category}
              onChange={(event) => {
                const value = event.target.value as CategoryKey | "";
                setForm((prev) => ({
                  ...prev,
                  category: value,
                  subcategory: "",
                }));
              }}
              className="mt-1 w-full rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
              required
            >
              <option value="" disabled>
                Kategori seçin
              </option>
              {CATEGORY_KEYS.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          {subcategories.length ? (
            <label className="text-sm font-medium text-neutral-700">
              Alt Kategori
              <select
                value={form.subcategory}
                onChange={(event) => handleChange("subcategory")(event.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                required
              >
                <option value="">Alt kategori seçin </option>
                {subcategories.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="text-sm font-medium text-neutral-700">
            Fiyat (₺)
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) => handleChange("price")(event.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
              placeholder="1499.90"
              required
            />
          </label> <label className="text-sm font-medium text-neutral-700">
  Stok
  <input
    type="number"
    min="0"
    value={form.stock}
    onChange={(event) => handleChange("stock")(event.target.value)}
    className="mt-1 w-full rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
    placeholder="0"
    required
  />
</label>

           
          <label className="text-sm font-medium text-neutral-700">
            Görsel URL
            <input
              type="url"
              value={form.imageUrl}
              onChange={(event) => handleChange("imageUrl")(event.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
              placeholder="https://"
              required
            />
          </label>

          <label className="text-sm font-medium text-neutral-700">
            Açıklama (opsiyonel)
            <textarea
              value={form.description}
              onChange={(event) => handleChange("description")(event.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
              rows={4}
              placeholder="Ürün hakkında kısa bir açıklama girin"
            />
          </label>
        </div>

        <div className="space-y-2">
          <button
            type="submit"
            className="btn btn-primary w-full md:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Ekleniyor..." : "Ürünü Kaydet"}
          </button>
          {errorMessage ? (
            <p className="text-sm text-red-500">{errorMessage}</p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
