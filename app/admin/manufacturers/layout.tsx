"use client";

import { usePathname } from "next/navigation";

interface ManufacturersLayoutProps {
  children: React.ReactNode;
}

export default function ManufacturersLayout({ children }: ManufacturersLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      {children}
    </div>
  );
}