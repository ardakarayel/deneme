"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Ekleme", href: "/admin/products/add" },
  { label: "Silme", href: "/admin/products/delete" },
  { label: "Güncelleme", href: "/admin/products/update" },
  { label: "Arama", href: "/admin/products/search" },
];

export default function AdminProductTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-4 border-b border-[var(--line)] pb-3 text-sm">
      {tabs.map((tab) => {
        const isActive =
          pathname === tab.href ||
          (tab.href === "/admin/products/add" && pathname === "/admin/products");

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`pb-1 transition-colors ${
              isActive
                ? "border-b-2 border-[#7a0025] font-semibold text-[#7a0025]"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
