// "use client";

// import { useEffect, useState } from "react";
// import type { UseFormReturn } from "react-hook-form";

// import { Button } from "@/components/ui/button";
// import {
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Textarea } from "@/components/ui/textarea";
// import { useToast } from "@/components/ui/use-toast";
// import type { NewProduct } from "@/lib/types/product";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";

// interface EsprComplianceStepProps {
//   form: UseFormReturn<NewProduct>;
// }

// export function EsprComplianceStep({ form }: EsprComplianceStepProps) {
//   const { toast } = useToast();
//   const [isLoading, setIsLoading] = useState(false);

//   const handleEsprCheck = async () => {
//     try {
//       setIsLoading(true);
//       const formData = form.getValues();
      
//       // For new products, we'll use a temporary endpoint
//       const endpoint = formData.id 
//         ? `/api/products/espr-compliance/${formData.id}`
//         : '/api/products/espr-compliance/check';

//       const response = await fetch(endpoint, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           productName: formData.name,
//           categoryName: formData.product_type,
//           regions: ["eu", "uk"], // Default to EU and UK
//         }),
//       });

//       if (!response.ok) {
//         throw new Error("ESPR compliance check failed");
//       }

//       const data = await response.json();
      
//       // Save ESPR compliance data to form state
//       form.setValue("espr_compliance", {
//         directives: data.directives,
//         regulations: data.regulations,
//         standards: data.standards,
//       });

//       toast({
//         title: "Success",
//         description: "ESPR compliance check completed successfully",
//       });
//     } catch (error) {
//       console.error("ESPR check error:", error);
//       toast({
//         title: "Error",
//         description: "Failed to check ESPR compliance. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="space-y-2">
//         <h3 className="text-lg font-semibold">ESPR Compliance</h3>
//         <p className="text-sm text-muted-foreground">
//           Check your product&apos;s compliance with the Ecodesign for Sustainable Products Regulation (ESPR)
//         </p>
//       </div>

//       <div className="space-y-4">
//         <Button
//           type="button"
//           onClick={handleEsprCheck}
//           disabled={isLoading}
//           className="w-full"
//         >
//           {isLoading ? "Checking..." : "Check ESPR Compliance"}
//         </Button>

//         <div className="space-y-4">
//           <FormField
//             control={form.control}
//             name="espr_compliance.directives"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel className="text-lg font-semibold">ESPR Directives</FormLabel>
//                 <FormControl>
//                   <ScrollArea className="h-[400px] rounded-md border p-4">
//                     <div className="space-y-3">
//                       {field.value?.map((directive: any, index: number) => (
//                         <Card key={index} className="overflow-hidden border-2 border-primary/10 bg-card shadow-md transition-all hover:shadow-lg">
//                           <CardHeader className="bg-primary/5 px-4 py-3">
//                             <div className="flex items-center justify-between">
//                               <CardTitle className="text-base font-semibold text-primary">{directive.directive_name}</CardTitle>
//                               <Badge variant="secondary" className="ml-2">{directive.directive_number}</Badge>
//                             </div>
//                           </CardHeader>
//                           <CardContent className="p-4">
//                             <div className="space-y-3">
//                               <div className="flex items-start gap-2">
//                                 <Badge variant="outline" className="mt-1">Date</Badge>
//                                 <span className="text-sm text-muted-foreground">{directive.directive_edition_date}</span>
//                               </div>
//                               <div className="space-y-2">
//                                 <h4 className="text-sm font-medium text-primary">Description</h4>
//                                 <p className="text-sm text-muted-foreground">{directive.directive_description}</p>
//                               </div>
//                               <div className="space-y-2">
//                                 <h4 className="text-sm font-medium text-primary">Sustainability Requirements</h4>
//                                 <p className="text-sm text-muted-foreground">{directive.sustainability_requirements}</p>
//                               </div>
//                               <div className="space-y-2">
//                                 <h4 className="text-sm font-medium text-primary">Environmental Impact</h4>
//                                 <p className="text-sm text-muted-foreground">{directive.environmental_impact}</p>
//                               </div>
//                               <div className="space-y-2">
//                                 <h4 className="text-sm font-medium text-primary">Circular Economy Criteria</h4>
//                                 <p className="text-sm text-muted-foreground">{directive.circular_economy_criteria}</p>
//                               </div>
//                               <div className="space-y-2">
//                                 <h4 className="text-sm font-medium text-primary">Product Lifecycle Assessment</h4>
//                                 <p className="text-sm text-muted-foreground">{directive.product_lifecycle_assessment}</p>
//                               </div>
//                             </div>
//                           </CardContent>
//                         </Card>
//                       ))}
//                     </div>
//                   </ScrollArea>
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name="espr_compliance.regulations"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel className="text-lg font-semibold">ESPR Regulations</FormLabel>
//                 <FormControl>
//                   <ScrollArea className="h-[400px] rounded-md border p-4">
//                     <div className="space-y-3">
//                       {field.value?.map((regulation: any, index: number) => (
//                         <Card key={index} className="overflow-hidden border-2 border-primary/10 bg-card shadow-md transition-all hover:shadow-lg">
//                           <CardHeader className="bg-primary/5 px-4 py-3">
//                             <div className="flex items-center justify-between">
//                               <CardTitle className="text-base font-semibold text-primary">{regulation.regulation_name}</CardTitle>
//                               <Badge variant="secondary" className="ml-2">{regulation.regulation_number}</Badge>
//                             </div>
//                           </CardHeader>
//                           <CardContent className="p-4">
//                             <div className="space-y-3">
//                               <div className="flex items-start gap-2">
//                                 <Badge variant="outline" className="mt-1">Date</Badge>
//                                 <span className="text-sm text-muted-foreground">{regulation.regulation_edition_date}</span>
//                               </div>
//                               <div className="space-y-2">
//                                 <h4 className="text-sm font-medium text-primary">Description</h4>
//                                 <p className="text-sm text-muted-foreground">{regulation.regulation_description}</p>
//                               </div>
//                               <div className="space-y-2">
//                                 <h4 className="text-sm font-medium text-primary">Sustainability Criteria</h4>
//                                 <p className="text-sm text-muted-foreground">{regulation.sustainability_criteria}</p>
//                               </div>
//                               <div className="space-y-2">
//                                 <h4 className="text-sm font-medium text-primary">Circular Economy Requirements</h4>
//                                 <p className="text-sm text-muted-foreground">{regulation.circular_economy_requirements}</p>
//                               </div>
//                               <div className="space-y-2">
//                                 <h4 className="text-sm font-medium text-primary">Environmental Impact Assessment</h4>
//                                 <p className="text-sm text-muted-foreground">{regulation.environmental_impact_assessment}</p>
//                               </div>
//                               <div className="space-y-2">
//                                 <h4 className="text-sm font-medium text-primary">Resource Efficiency Requirements</h4>
//                                 <p className="text-sm text-muted-foreground">{regulation.resource_efficiency_requirements}</p>
//                               </div>
//                             </div>
//                           </CardContent>
//                         </Card>
//                       ))}
//                     </div>
//                   </ScrollArea>
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name="espr_compliance.standards"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel className="text-lg font-semibold">ESPR Standards</FormLabel>
//                 <FormControl>
//                   <ScrollArea className="h-[400px] rounded-md border p-4">
//                     <div className="space-y-3">
//                       {field.value?.map((standard: any, index: number) => (
//                         <Card key={index} className="overflow-hidden border-2 border-primary/10 bg-card shadow-md transition-all hover:shadow-lg">
//                           <CardHeader className="bg-primary/5 px-4 py-3">
//                             <div className="flex items-center justify-between">
//                               <CardTitle className="text-base font-semibold text-primary">{standard.title}</CardTitle>
//                               <Badge variant="secondary" className="ml-2">{standard.ref_no}</Badge>
//                             </div>
//                           </CardHeader>
//                           <CardContent className="p-4">
//                             <div className="space-y-3">
//                               <div className="flex items-start gap-2">
//                                 <Badge variant="outline" className="mt-1">Date</Badge>
//                                 <span className="text-sm text-muted-foreground">{standard.edition_or_date}</span>
//                               </div>
//                               <div className="space-y-2">
//                                 <h4 className="text-sm font-medium text-primary">Sustainability Metrics</h4>
//                                 <p className="text-sm text-muted-foreground">{standard.sustainability_metrics}</p>
//                               </div>
//                               <div className="space-y-2">
//                                 <h4 className="text-sm font-medium text-primary">Environmental Standards</h4>
//                                 <p className="text-sm text-muted-foreground">{standard.environmental_standards}</p>
//                               </div>
//                               <div className="space-y-2">
//                                 <h4 className="text-sm font-medium text-primary">Circular Economy Standards</h4>
//                                 <p className="text-sm text-muted-foreground">{standard.circular_economy_standards}</p>
//                               </div>
//                               <div className="space-y-2">
//                                 <h4 className="text-sm font-medium text-primary">Lifecycle Assessment Methodology</h4>
//                                 <p className="text-sm text-muted-foreground">{standard.lifecycle_assessment_methodology}</p>
//                               </div>
//                             </div>
//                           </CardContent>
//                         </Card>
//                       ))}
//                     </div>
//                   </ScrollArea>
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// ESPR Compliance Step - Geçici olarak devre dışı bırakıldı
export function EsprComplianceStep() {
  return null;
} 