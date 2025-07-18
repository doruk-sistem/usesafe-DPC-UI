"use client";

import { useState, ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { Upload, Plus, Trash2, Download } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

interface Material {
  id: string;
  name: string;
  percentage: number;
  recyclable: boolean;
  description: string;
}

interface MaterialsStepProps {
  form: UseFormReturn<any>;
}

export function MaterialsStep({ form }: MaterialsStepProps) {
  const t = useTranslations("productManagement.materials");
  const { toast } = useToast();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [newMaterial, setNewMaterial] = useState<Omit<Material, 'id'>>({
    name: "",
    percentage: 0,
    recyclable: false,
    description: ""
  });

  const handleMaterialChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    let fieldValue: string | number | boolean = value;
    
    if (type === "number") {
      fieldValue = parseFloat(value) || 0;
    }
    
    setNewMaterial(prev => ({
      ...prev,
      [name]: fieldValue
    }));
  };

  const handleRecyclableChange = (value: string) => {
    setNewMaterial(prev => ({
      ...prev,
      recyclable: value === "true"
    }));
  };

  const handleAddMaterial = () => {
    if (!newMaterial.name || newMaterial.percentage <= 0) {
      toast({
        title: t("error.title"),
        description: t("error.invalidMaterial"),
        variant: "destructive",
      });
      return;
    }

    // Toplam yüzde kontrolü
    const totalPercentage = materials.reduce((sum, mat) => sum + mat.percentage, 0) + newMaterial.percentage;
    if (totalPercentage > 100) {
      toast({
        title: t("error.title"),
        description: t("error.totalPercentageExceeded"),
        variant: "destructive",
      });
      return;
    }

    const material: Material = {
      id: Date.now().toString(),
      ...newMaterial
    };

    setMaterials(prev => [...prev, material]);
    setNewMaterial({
      name: "",
      percentage: 0,
      recyclable: false,
      description: ""
    });

    // Form'a materyal verilerini kaydet
    form.setValue("materials", [...materials, material]);
  };

  const handleRemoveMaterial = (id: string) => {
    const updatedMaterials = materials.filter(mat => mat.id !== id);
    setMaterials(updatedMaterials);
    form.setValue("materials", updatedMaterials);
  };

  const handleExcelUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      toast({
        title: t("error.title"),
        description: t("error.invalidFileType"),
        variant: "destructive",
      });
      return;
    }

    // Excel dosyasını oku (mock implementation)
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        // Mock: Excel'den okunan veriler
        const mockExcelData: Material[] = [
          { id: Date.now().toString(), name: "Cotton", percentage: 60, recyclable: true, description: "Organic cotton" },
          { id: (Date.now() + 1).toString(), name: "Polyester", percentage: 30, recyclable: true, description: "Recycled polyester" },
          { id: (Date.now() + 2).toString(), name: "Elastane", percentage: 10, recyclable: false, description: "Elastane blend" },
        ];

        setMaterials(prev => [...prev, ...mockExcelData]);
        form.setValue("materials", [...materials, ...mockExcelData]);

        toast({
          title: t("success.title"),
          description: t("success.excelUploaded"),
        });
      } catch (error) {
        toast({
          title: t("error.title"),
          description: t("error.excelParseError"),
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const downloadExcelTemplate = () => {
    let rows: (string | number | boolean)[][] = [];
    if (materials.length === 0) {
      // Örnek şablon
      rows = [
        ["Material Name", "Percentage", "Recyclable", "Description"],
        ["Cotton", "60", "true", "Organic cotton"],
        ["Polyester", "30", "true", "Recycled polyester"],
        ["Elastane", "10", "false", "Elastane blend"]
      ];
    } else {
      // Mevcut materyaller
      rows = [
        ["Material Name", "Percentage", "Recyclable", "Description"],
        ...materials.map(mat => [
          mat.name,
          mat.percentage,
          mat.recyclable ? "true" : "false",
          mat.description
        ])
      ];
    }

    const csvContent = '\uFEFF' + rows.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "materials_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalPercentage = materials.reduce((sum, mat) => sum + mat.percentage, 0);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">{t("title")}</h2>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {/* Excel Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            {t("excelUpload.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={downloadExcelTemplate}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {t("excelUpload.downloadTemplate")}
            </Button>
            <div className="flex-1">
              <Input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleExcelUpload}
                className="cursor-pointer"
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{t("excelUpload.instructions")}</p>
        </CardContent>
      </Card>

      {/* Manuel Ekleme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {t("manualAdd.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="materialName">{t("manualAdd.materialName")}</Label>
              <Input
                id="materialName"
                name="name"
                value={newMaterial.name}
                onChange={handleMaterialChange}
                placeholder={t("manualAdd.materialNamePlaceholder")}
              />
            </div>
            <div>
              <Label htmlFor="percentage">{t("manualAdd.percentage")}</Label>
              <Input
                id="percentage"
                name="percentage"
                type="number"
                min="0"
                max="100"
                value={newMaterial.percentage}
                onChange={handleMaterialChange}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="recyclable">{t("manualAdd.recyclable")}</Label>
              <Select value={newMaterial.recyclable.toString()} onValueChange={handleRecyclableChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">{t("manualAdd.yes")}</SelectItem>
                  <SelectItem value="false">{t("manualAdd.no")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">{t("manualAdd.description")}</Label>
              <Input
                id="description"
                name="description"
                value={newMaterial.description}
                onChange={handleMaterialChange}
                placeholder={t("manualAdd.descriptionPlaceholder")}
              />
            </div>
          </div>
          <Button
            onClick={handleAddMaterial}
            className="mt-4 flex items-center gap-2"
            disabled={!newMaterial.name || newMaterial.percentage <= 0}
          >
            <Plus className="w-4 h-4" />
            {t("manualAdd.addButton")}
          </Button>
        </CardContent>
      </Card>

      {/* Materyal Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>{t("list.title")}</CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {t("list.totalMaterials")}: {materials.length}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{t("list.totalPercentage")}:</span>
              <Badge variant={totalPercentage === 100 ? "success" : totalPercentage > 100 ? "destructive" : "secondary"}>
                {totalPercentage}%
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {materials.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("list.noMaterials")}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("list.table.material")}</TableHead>
                  <TableHead>{t("list.table.percentage")}</TableHead>
                  <TableHead>{t("list.table.recyclable")}</TableHead>
                  <TableHead>{t("list.table.description")}</TableHead>
                  <TableHead>{t("list.table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium">{material.name}</TableCell>
                    <TableCell>{material.percentage}%</TableCell>
                    <TableCell>
                      <Badge variant={material.recyclable ? "success" : "secondary"}>
                        {material.recyclable ? t("list.table.yes") : t("list.table.no")}
                      </Badge>
                    </TableCell>
                    <TableCell>{material.description}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMaterial(material.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 