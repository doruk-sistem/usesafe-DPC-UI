import { ManufacturerHeader } from "@/components/admin/manufacturers/manufacturer-header";
import { ManufacturerList } from "@/components/admin/manufacturers/manufacturer-list";

export default function ManufacturersPage() {
  return (
    <div className="space-y-6">
      <ManufacturerHeader />
      <ManufacturerList />
    </div>
  );
}