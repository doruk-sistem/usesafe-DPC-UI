"use client";

import { useTranslations } from "next-intl";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BaseProduct } from "@/lib/types/product";

interface CategoryDetailsProps {
  product: BaseProduct;
}

export function CategoryDetails({ product }: CategoryDetailsProps) {
  const t = useTranslations("products.details");

  // DPP config'den veri çıkarma fonksiyonları
  const getFieldValue = (sectionId: string, fieldId: string) => {
    const section = product.dpp_config?.sections.find(s => s.id === sectionId);
    const field = section?.fields.find(f => f.id === fieldId);
    return field?.value;
  };

  const getFieldsByType = (sectionId: string, fieldType: string) => {
    const section = product.dpp_config?.sections.find(s => s.id === sectionId);
    return section?.fields.filter(f => f.type === fieldType) || [];
  };

  // Kategoriye özel bölümleri dinamik olarak oluştur
  const renderCategorySpecificSections = () => {
    const sections = product.dpp_config?.sections || [];
    
    return sections.map((section) => {
      // Temel bilgiler, sertifikalar gibi ortak bölümleri atla
      if (["basic-info", "certifications", "environmental"].includes(section.id)) {
        return null;
      }

      return (
        <Card key={section.id}>
          <CardHeader>
            <CardTitle>{t(`categories.${product.product_type}.${section.id}`)}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderSectionContent(section)}
          </CardContent>
        </Card>
      );
    });
  };

  // Bölüm içeriğini türüne göre render et
  const renderSectionContent = (section: any) => {
    switch (section.type) {
      case "list":
        return (
          <div className="space-y-4">
            {section.fields.map((field: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <span>{field.name}</span>
                <span className="text-muted-foreground">
                  {typeof field.value === "object" 
                    ? JSON.stringify(field.value)
                    : field.value}
                </span>
              </div>
            ))}
          </div>
        );

      case "text":
        return (
          <div className="prose">
            {section.fields[0]?.value}
          </div>
        );

      case "warnings":
        return (
          <div className="space-y-2">
            {section.fields.map((field: any, index: number) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-red-500">⚠️</span>
                <span>{field.value}</span>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {renderCategorySpecificSections()}
    </div>
  );
} 