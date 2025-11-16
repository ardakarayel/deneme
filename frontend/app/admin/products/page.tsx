import AdminProductTabs from "./components/AdminProductTabs";

export default function ProductsPage() {
  return (
    <div className="container-base py-12 space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
          Admin / Ürünler
        </p>

        <h1 className="text-2xl font-semibold">Ürün Yönetimi</h1>
        <p className="text-sm text-neutral-500">
          Bu sayfadan ürünleri listeleyebilir, arayabilir, ekleyebilir, güncelleyebilir ve silebilirsiniz.
        </p>
      </div>

      <AdminProductTabs />

      <div className="p-6 rounded-lg border border-[var(--line)] bg-white">
        <p className="text-neutral-600 text-sm">
          Soldaki sekmelerden bir işlem seçin.
        </p>
      </div>
    </div>
  );
}
