import AdminProductTabs from "../components/AdminProductTabs";
import ProductAddForm from "../components/ProductAddForm";

export default function AdminProductAddPage() {
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

      <ProductAddForm />
    </div>
  );
}
