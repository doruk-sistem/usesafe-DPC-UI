import { ManufacturerList } from "@/components/admin/manufacturers/manufacturer-list";
import { ManufacturerHeader } from "@/components/admin/manufacturers/manufacturer-header";

export default function ManufacturersPage() {
  return (
    <div className="space-y-6">
      <ManufacturerHeader />
      <ManufacturerList />
    </div>
  );
}