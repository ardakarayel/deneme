"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import AdminProductTabs from "../components/AdminProductTabs";
import { toast } from "react-hot-toast";

const CATEGORY_OPTIONS = {
  Women: ["Knitwear", "Coats & Jackets", "Shirts", "Accessories"],
  Men: ["Shirts", "Bottoms", "Accessories"],
  Beauty: ["Skincare", "Makeup", "Perfume"],
} as const;

type CategoryKey = keyof typeof CATEGORY_OPTIONS;
const CATEGORY_KEYS = Object.keys(CATEGORY_OPTIONS) as CategoryKey[];

type VariantForm = {
  size: string;
  color: string;
  stock: string;
};

type ProductForm = {
  name: string;
  category: CategoryKey | "";
  subcategory: string;
  price: string;
  imageUrl: string;
  description: string;
  stock: string;
};

const initialFormState: ProductForm = {
  name: "",
  category: "",
  subcategory: "",
  price: "",
  imageUrl: "",
  description: "",
  stock: "",
};

export default function AdminProductAddPage() {
  const router = useRouter();

  const [form, setForm] = useState<ProductForm>(initialFormState);
  const [variants, setVariants] = useState<VariantForm[]>([]);
  const [variantDraft, setVariantDraft] = useState<VariantForm>({
    size: "",
    color: "",
    stock: "",
  });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessageBox, setErrorMessageBox] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof ProductForm) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleVariantChange = (field: keyof VariantForm) => (value: string) => {
    setVariantDraft((prev) => ({ ...prev, [field]: value }));
  };

  const addVariant = () => {
    if (!variantDraft.size.trim() || !variantDraft.color.trim() || !variantDraft.stock.trim()) {
      setErrorMessageBox("Varyant eklemek için tüm alanları doldurun.");
      return;
    }

    setVariants([
      ...variants,
      {
        size: variantDraft.size.toUpperCase(),
        color: variantDraft.color.charAt(0).toUpperCase() + variantDraft.color.slice(1).toLowerCase(),
        stock: variantDraft.stock,
      },
    ]);

    setVariantDraft({ size: "", color: "", stock: "" });
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const subcategories = form.category ? CATEGORY_OPTIONS[form.category] : [];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const required = {
      name: form.name.trim(),
      category: form.category,
      price: form.price.trim(),
      imageUrl: form.imageUrl.trim(),
      stock: form.stock.trim(),
    };

    const isMissing = Object.values(required).some(
      (v) => v === "" || v === undefined
    );

    if (isMissing) {
      setErrorMessageBox("Lütfen tüm zorunlu alanları doldurun.");
      toast.error("Lütfen tüm zorunlu alanları doldurun.");
      return;
    }

    setErrorMessageBox(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const payload: any = {
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        stock: Number(form.stock),
        imageUrl: form.imageUrl.trim(),
        variants: variants.map((v) => ({
          size: v.size,
          color: v.color,
          stock: Number(v.stock),
        })),
      };

      if (form.subcategory.trim()) payload.subcategory = form.subcategory.trim();
      if (form.description.trim()) payload.description = form.description.trim();

      const response = await fetch("http://localhost:3001/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to add product");

      toast.success("🎉 Ürün başarıyla eklendi!");
      setSuccessMessage("Ürün başarıyla eklendi!");

      // Form reset
      setForm(initialFormState);
      setVariants([]);
      setVariantDraft({ size: "", color: "", stock: "" });

      // Mesaj 5 saniyede kaybolsun
      setTimeout(() => setSuccessMessage(null), 5000);

    } catch (error) {
      console.error(error);
      toast.error("Ürün eklenirken hata oluştu.");
      setErrorMessageBox("Ürün eklenirken hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-base py-12 space-y-8">

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
          Admin / Ürünler
        </p>
        <h1 className="text-2xl font-semibold">Yeni Ürün Ekle</h1>
        <p className="text-sm text-neutral-500">
          Mağazanıza yeni ürün eklemek için aşağıdaki formu doldurun.
        </p>
      </div>

      <AdminProductTabs />

      {/* BAŞARI MESAJI */}
      {successMessage && (
        <div className="rounded-lg bg-green-100 text-green-700 border border-green-300 p-3">
          {successMessage}
        </div>
      )}

      {/* HATA MESAJI */}
      {errorMessageBox && (
        <div className="rounded-lg bg-red-100 text-red-700 border border-red-300 p-3">
          {errorMessageBox}
        </div>
      )}

      {/* FORM */}
      <form className="space-y-6" onSubmit={handleSubmit}>

        <div className="grid gap-4">

          {/* Ürün Adı */}
          <label className="text-sm font-medium text-neutral-700">
            Ürün Adı
            <input
              type="text"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={form.name}
              onChange={(e) => handleChange("name")(e.target.value)}
              placeholder="Örn. Wool Blend Coat"
              required
            />
          </label>

          {/* Kategori */}
          <label className="text-sm font-medium text-neutral-700">
            Kategori
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={form.category}
              onChange={(e) => {
                const val = e.target.value as CategoryKey | "";
                setForm((prev) => ({ ...prev, category: val, subcategory: "" }));
              }}
              required
            >
              <option value="">Kategori seçin</option>
              {CATEGORY_KEYS.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </label>

          {/* Alt kategori */}
          {subcategories.length > 0 && (
            <label className="text-sm font-medium text-neutral-700">
              Alt Kategori
              <select
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                value={form.subcategory}
                onChange={(e) => handleChange("subcategory")(e.target.value)}
                required
              >
                <option value="">Alt kategori seçin</option>
                {subcategories.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </label>
          )}

          {/* Fiyat */}
          <label className="text-sm font-medium text-neutral-700">
            Fiyat (₺)
            <input
              type="number"
              min="0"
              step="0.01"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={form.price}
              onChange={(e) => handleChange("price")(e.target.value)}
              required
            />
          </label>

          {/* Stok */}
          <label className="text-sm font-medium text-neutral-700">
            Stok
            <input
              type="number"
              min="0"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={form.stock}
              onChange={(e) => handleChange("stock")(e.target.value)}
              required
            />
          </label>

          {/* Görsel */}
          <label className="text-sm font-medium text-neutral-700">
            Görsel URL
            <input
              type="url"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={form.imageUrl}
              onChange={(e) => handleChange("imageUrl")(e.target.value)}
              placeholder="https://"
              required
            />
          </label>

          {/* Açıklama */}
          <label className="text-sm font-medium text-neutral-700">
            Açıklama (opsiyonel)
            <textarea
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              rows={3}
              value={form.description}
              onChange={(e) => handleChange("description")(e.target.value)}
            />
          </label>

        </div>

        {/* Varyant Alanı */}
        <div className="space-y-4 p-4 border rounded-lg bg-neutral-50">

          <h2 className="text-lg font-medium">Varyantlar</h2>

          {/* Yeni varyant girişi */}
          <div className="grid grid-cols-3 gap-4">
            <input
              type="text"
              className="rounded-lg border px-3 py-2 text-sm"
              placeholder="Beden (S, M, L)"
              value={variantDraft.size}
              onChange={(e) => handleVariantChange("size")(e.target.value)}
            />

            <input
              type="text"
              className="rounded-lg border px-3 py-2 text-sm"
              placeholder="Renk"
              value={variantDraft.color}
              onChange={(e) => handleVariantChange("color")(e.target.value)}
            />

            <input
              type="number"
              className="rounded-lg border px-3 py-2 text-sm"
              placeholder="Stok"
              value={variantDraft.stock}
              onChange={(e) => handleVariantChange("stock")(e.target.value)}
            />
          </div>

          <button type="button" onClick={addVariant} className="btn btn-secondary mt-2">
            Varyant Ekle
          </button>

          {/* Eklenen varyant listesi */}
          {variants.length > 0 && (
            <ul className="space-y-2 mt-4">
              {variants.map((v, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center p-2 bg-white border rounded"
                >
                  <span>
                    <strong>{v.size}</strong> - {v.color} — Stok: {v.stock}
                  </span>
                  <button
                    type="button"
                    className="text-red-600"
                    onClick={() => removeVariant(i)}
                  >
                    Sil
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary w-full md:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Ekleniyor..." : "Ürünü Kaydet"}
        </button>
      </form>
    </div>
  );
}
