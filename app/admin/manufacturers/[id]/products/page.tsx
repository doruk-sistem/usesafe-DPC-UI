import { ManufacturerProducts } from "@/components/admin/manufacturers/manufacturer-products";

export default function ManufacturerProductsPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <ManufacturerProducts manufacturerId={params.id} />
    </div>
  );
} 