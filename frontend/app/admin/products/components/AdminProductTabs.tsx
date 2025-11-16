"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { name: "Listele", href: "/admin/products" },
  { name: "Ara", href: "/admin/products/search" },
  { name: "Ekle", href: "/admin/products/add" },
  { name: "Güncelle", href: "/admin/products/update" },
  { name: "Sil", href: "/admin/products/delete" },
];

export default function AdminProductTabs() {
  const pathname = usePathname();

  return (
    <div className="flex gap-3 border-b pb-2 mb-4">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-3 py-1 rounded-md text-sm font-medium transition
              ${isActive ? "bg-black text-white" : "bg-gray-200 hover:bg-gray-300"}
            `}
          >
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}
