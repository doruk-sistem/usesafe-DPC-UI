"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { defaultBatteryTemplate } from "@/lib/data/default-templates";
import { DPPTemplateService } from "@/lib/services/dpp-template";

const formSchema = z.object({
  product_type: z.string().min(1, "Product type is required"),
  hazard_pictograms: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    image_url: z.string(),
    description: z.string()
  })),
  materials: z.array(z.object({
    name: z.string().min(1, "Name is required"),
    percentage: z.number().min(0).max(100),
    cas_number: z.string().optional(),
    hazard_level: z.string().optional(),
    recyclable: z.boolean()
  })),
  health_safety_measures: z.array(z.object({
    category: z.string().min(1, "Category is required"),
    measures: z.array(z.string().min(1, "Measure is required"))
  })),
  emergency_procedures: z.array(z.object({
    scenario: z.string().min(1, "Scenario is required"),
    steps: z.array(z.string().min(1, "Step is required"))
  })),
  storage_installation_guidelines: z.array(z.object({
    title: z.string().min(1, "Title is required"),
    items: z.array(z.string().min(1, "Item is required"))
  })),
  required_certifications: z.array(z.string().min(1, "Certification is required")),
  optional_certifications: z.array(z.string().min(1, "Certification is required"))
});

type FormData = z.infer<typeof formSchema>;

interface DPPTemplateFormProps {
  templateId?: string;
}

export function DPPTemplateForm({ templateId }: DPPTemplateFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product_type: "",
      hazard_pictograms: [],
      materials: [],
      health_safety_measures: [],
      emergency_procedures: [],
      storage_installation_guidelines: [],
      required_certifications: [],
      optional_certifications: []
    }
  });

  const { fields: hazardFields, append: appendHazard, remove: removeHazard } = 
    useFieldArray({ control: form.control, name: "hazard_pictograms" });

  const { fields: materialFields, append: appendMaterial, remove: removeMaterial } = 
    useFieldArray({ control: form.control, name: "materials" });

  const { fields: measureFields, append: appendMeasure, remove: removeMeasure } = 
    useFieldArray({ control: form.control, name: "health_safety_measures" });

  const { fields: procedureFields, append: appendProcedure, remove: removeProcedure } = 
    useFieldArray({ control: form.control, name: "emergency_procedures" });

  const { fields: guidelineFields, append: appendGuideline, remove: removeGuideline } = 
    useFieldArray({ control: form.control, name: "storage_installation_guidelines" });

  const { fields: reqCertFields, append: appendReqCert, remove: removeReqCert } = 
    useFieldArray({ control: form.control, name: "required_certifications" });

  const { fields: optCertFields, append: appendOptCert, remove: removeOptCert } = 
    useFieldArray({ control: form.control, name: "optional_certifications" });

  useEffect(() => {
    const loadTemplate = async () => {
      if (!templateId) return;

      try {
        const template = await DPPTemplateService.getTemplate(templateId);
        if (template) {
          form.reset(template);
        }
      } catch (error) {
        console.error('Error loading template:', error);
        toast({
          title: "Error",
          description: "Failed to load template",
          variant: "destructive",
        });
      }
    };

    loadTemplate();
  }, [templateId, form, toast]);

  const onSubmit = async (data: FormData) => {
    try {
      // Transform storage guidelines to match schema
      const transformedData = {
        ...data,
        storage_installation_guidelines: data.storage_installation_guidelines.map(guideline => ({
          title: guideline.title,
          items: guideline.items || []
        }))
      };

      // Validate required fields
      if (!data.product_type) {
        toast({
          title: "Validation Error",
          description: "Product type is required",
          variant: "destructive",
        });
        return;
      }

      // Validate at least one material
      if (!data.materials || data.materials.length === 0) {
        toast({
          title: "Validation Error", 
          description: "At least one material is required",
          variant: "destructive",
        });
        return;
      }

      // Validate at least one required certification
      if (!data.required_certifications || data.required_certifications.length === 0) {
        toast({
          title: "Validation Error",
          description: "At least one required certification is required",
          variant: "destructive",
        });
        return;
      }

      // Ensure arrays are initialized
      const template = {
        ...data,
        hazard_pictograms: data.hazard_pictograms || [],
        materials: data.materials || [],
        health_safety_measures: data.health_safety_measures || [],
        emergency_procedures: data.emergency_procedures || [],
        storage_installation_guidelines: data.storage_installation_guidelines || [],
        required_certifications: data.required_certifications || [],
        optional_certifications: data.optional_certifications || []
      };

      // Show loading state
      toast({
        title: "Creating template...",
        description: "Please wait while we save your template",
      });

      if (templateId) {
        await DPPTemplateService.updateTemplate(templateId, transformedData);
      } else {
        await DPPTemplateService.createTemplate(transformedData);
      }

      toast({
        title: "Success",
        description: `DPP template ${templateId ? 'updated' : 'created'} successfully`,
      });

      router.push("/admin/templates");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create template",
        variant: "destructive",
      });
      console.error('Template creation error:', error);
    }
  };

  console.log(form)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="product_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="battery">Battery</SelectItem>
                  <SelectItem value="textile">Textile</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <FormLabel>Hazard Pictograms</FormLabel>
            <Select
              onValueChange={(value) => {
                const pictogram = defaultBatteryTemplate.hazard_pictograms?.find(p => p.name === value);
                if (pictogram) {
                  appendHazard(pictogram);
                }
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Add pictogram" />
              </SelectTrigger>
              <SelectContent>
                {defaultBatteryTemplate.hazard_pictograms
                  ?.filter(p => !hazardFields.some(f => f.name === p.name))
                  .map(p => (
                    <SelectItem key={p.id} value={p.name}>
                      {p.name}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>
          {hazardFields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-start">
              <div className="flex-1 flex items-center gap-4">
                <img 
                  src={field.image_url} 
                  alt={field.name}
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <p className="font-medium">{field.name}</p>
                  <p className="text-sm text-muted-foreground">{field.description}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeHazard(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Materials */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <FormLabel>Materials *</FormLabel>
              <p className="text-sm text-muted-foreground">At least one material is required</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendMaterial({
                name: "",
                percentage: 0,
                cas_number: "",
                hazard_level: "",
                recyclable: false
              })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Material
            </Button>
          </div>
          {materialFields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-start">
              <div className="flex-1 space-y-4">
                <Input
                  placeholder="Material Name"
                  {...form.register(`materials.${index}.name`)}
                />
                <Input
                  type="number"
                  placeholder="Percentage"
                  {...form.register(`materials.${index}.percentage`, { valueAsNumber: true })}
                />
                <Input
                  placeholder="CAS Number"
                  {...form.register(`materials.${index}.cas_number`)}
                />
                <Input
                  placeholder="Hazard Level"
                  {...form.register(`materials.${index}.hazard_level`)}
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    {...form.register(`materials.${index}.recyclable`)}
                  />
                  <FormLabel>Recyclable</FormLabel>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeMaterial(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Health & Safety Measures */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <FormLabel>Health & Safety Measures</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendMeasure({ category: "", measures: [""] })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
          {measureFields.map((field, index) => (
            <div key={field.id} className="space-y-4 border p-4 rounded-lg">
              <div className="flex gap-4 items-start">
                <Input
                  placeholder="Category Name"
                  {...form.register(`health_safety_measures.${index}.category`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMeasure(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {form.watch(`health_safety_measures.${index}.measures`).map((_, mIndex) => (
                <div key={mIndex} className="flex gap-4">
                  <Input
                    placeholder="Safety Measure"
                    {...form.register(`health_safety_measures.${index}.measures.${mIndex}`)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const measures = form.getValues(`health_safety_measures.${index}.measures`);
                      measures.splice(mIndex, 1);
                      form.setValue(`health_safety_measures.${index}.measures`, measures);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const measures = form.getValues(`health_safety_measures.${index}.measures`);
                  measures.push("");
                  form.setValue(`health_safety_measures.${index}.measures`, measures);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Measure
              </Button>
            </div>
          ))}
        </div>

        {/* Emergency Procedures */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <FormLabel>Emergency Procedures</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendProcedure({ scenario: "", steps: [""] })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Procedure
            </Button>
          </div>
          {procedureFields.map((field, index) => (
            <div key={field.id} className="space-y-4 border p-4 rounded-lg">
              <div className="flex gap-4 items-start">
                <Input
                  placeholder="Emergency Scenario"
                  {...form.register(`emergency_procedures.${index}.scenario`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeProcedure(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {form.watch(`emergency_procedures.${index}.steps`).map((_, stepIndex) => (
                <div key={stepIndex} className="flex gap-4">
                  <Input
                    placeholder="Procedure Step"
                    {...form.register(`emergency_procedures.${index}.steps.${stepIndex}`)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const steps = form.getValues(`emergency_procedures.${index}.steps`);
                      steps.splice(stepIndex, 1);
                      form.setValue(`emergency_procedures.${index}.steps`, steps);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const steps = form.getValues(`emergency_procedures.${index}.steps`);
                  steps.push("");
                  form.setValue(`emergency_procedures.${index}.steps`, steps);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            </div>
          ))}
        </div>

        {/* Storage & Installation Guidelines */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <FormLabel>Storage & Installation Guidelines</FormLabel>
              <p className="text-sm text-muted-foreground">Add categories and their guidelines</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendGuideline({ title: "", items: [""] })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
          {guidelineFields.map((field, index) => (
            <div key={field.id} className="space-y-4 border p-4 rounded-lg">
              <div className="flex gap-4 items-start">
                <Input
                  placeholder="Section Title"
                  {...form.register(`storage_installation_guidelines.${index}.title`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeGuideline(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {form.watch(`storage_installation_guidelines.${index}.items`).map((_, guidelineItemIndex) => (
                <div key={guidelineItemIndex} className="flex gap-4">
                  <Input
                    placeholder="Guideline"
                    {...form.register(`storage_installation_guidelines.${index}.items.${guidelineItemIndex}`)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const items = form.getValues(`storage_installation_guidelines.${index}.items`);
                      items.splice(guidelineItemIndex, 1);
                      form.setValue(`storage_installation_guidelines.${index}.items`, items);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const items = form.getValues(`storage_installation_guidelines.${index}.items`);
                  items.push("");
                  form.setValue(`storage_installation_guidelines.${index}.items`, items);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          ))}
        </div>

        {/* Required Certifications */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <FormLabel>Required Certifications *</FormLabel>
              <p className="text-sm text-muted-foreground">At least one certification is required</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendReqCert("")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Certification
            </Button>
          </div>
          {reqCertFields.map((field, index) => (
            <div key={field.id} className="flex gap-4">
              <Input
                placeholder="Certification Name"
                {...form.register(`required_certifications.${index}`)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeReqCert(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Optional Certifications */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <FormLabel>Optional Certifications</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendOptCert("")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Certification
            </Button>
          </div>
          {optCertFields.map((field, index) => (
            <div key={field.id} className="flex gap-4">
              <Input
                placeholder="Certification Name"
                {...form.register(`optional_certifications.${index}`)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeOptCert(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            {form.formState.isSubmitting 
              ? (templateId ? "Updating..." : "Creating...") 
              : (templateId ? "Update Template" : "Create Template")
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}