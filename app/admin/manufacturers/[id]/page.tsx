import { ManufacturerDetails } from "@/components/admin/manufacturers/manufacturer-details";
import { ManufacturerDocuments } from "@/components/admin/manufacturers/manufacturer-documents";
import { ManufacturerProducts } from "@/components/admin/manufacturers/manufacturer-products";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for static params
const manufacturers = [
  { id: "MFR-001" },
  { id: "MFR-002" },
  { id: "MFR-003" },
];

export function generateStaticParams() {
  return manufacturers.map((manufacturer) => ({
    id: manufacturer.id,
  }));
}

export default async function ManufacturerPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return (
    <div className="space-y-6">
      <ManufacturerDetails manufacturerId={params.id} />
      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>
        <TabsContent value="documents" className="space-y-4">
          <ManufacturerDocuments manufacturerId={params.id} />
        </TabsContent>
        <TabsContent value="products" className="space-y-4">
          <ManufacturerProducts manufacturerId={params.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}