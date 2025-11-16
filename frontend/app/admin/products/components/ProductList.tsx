import { Product } from "./Product.types";




type ProductListProps = {
  products: Product[];
};

export default function ProductList({ products }: ProductListProps) {
  return (
    <div className="space-y-4 mt-6">
      {products.length === 0 ? (
        <p className="text-neutral-600">Hiç ürün bulunamadı.</p>
      ) : (
        <ul className="space-y-2">
          {products.map((p) => (
            <li key={p.id} className="border p-3 rounded-lg">
              <div className="font-semibold">{p.name}</div>
              <div className="text-sm text-neutral-600">
                {p.category} — {p.price}₺ — Stok: {p.stock}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
