import { SystemHeader } from "@/components/admin/system/system-header";
import { SystemTemplates } from "@/components/admin/system/system-templates";
import { SystemMaterials } from "@/components/admin/system/system-materials";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SystemPage() {
  return (
    <div className="space-y-6">
      <SystemHeader />
      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
        </TabsList>
        <TabsContent value="templates" className="space-y-4">
          <SystemTemplates />
        </TabsContent>
        <TabsContent value="materials" className="space-y-4">
          <SystemMaterials />
        </TabsContent>
      </Tabs>
    </div>
  );
}