"use client";

import { Eye, MoreHorizontal, FileText, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Error } from "@/components/ui/error";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useDPPTemplates } from "@/lib/hooks/use-dpp-templates";
import { DPPTemplateService } from "@/lib/services/dpp-template";

export function DPPTemplateList() {
  const { templates, isLoading, error, refreshTemplates } = useDPPTemplates();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      await DPPTemplateService.deleteTemplate(id);
      toast({
        title: "Success",
        description: "Template deleted successfully",
        duration: 3000,
      });
      
      await refreshTemplates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <Error error={error} />;
  }

  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Templates Found</h2>
          <p className="text-muted-foreground mb-4 text-center max-w-sm">
            Create your first DPP template to start managing product certifications.
          </p>
          <Button asChild>
            <Link href="/admin/templates/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>DPP Templates</CardTitle>
        <CardDescription>
          Configure templates for different product types
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Type</TableHead>
              <TableHead>Required Certifications</TableHead>
              <TableHead>Hazards</TableHead>
              <TableHead>Safety Measures</TableHead>
              <TableHead>Guidelines</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{template.product_type}</p>
                      <p className="text-sm text-muted-foreground">
                        {template.id}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {template.required_certifications.slice(0, 2).map((cert, index) => (
                      <Badge key={index} variant="secondary">
                        {cert}
                      </Badge>
                    ))}
                    {template.required_certifications.length > 2 && (
                      <Badge variant="outline">
                        +{template.required_certifications.length - 2} more
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {template.hazard_pictograms.slice(0, 2).map((hazard, index) => (
                      <Badge key={index} variant="destructive" className="flex items-center gap-1">
                        {hazard.name}
                      </Badge>
                    ))}
                    {template.hazard_pictograms.length > 2 && (
                      <Badge variant="outline">
                        +{template.hazard_pictograms.length - 2} more
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {template.health_safety_measures.slice(0, 2).map((measure, index) => (
                      <Badge key={index} variant="warning">
                        {measure.category}
                      </Badge>
                    ))}
                    {template.health_safety_measures.length > 2 && (
                      <Badge variant="outline">
                        +{template.health_safety_measures.length - 2} more
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {template.materials.slice(0, 2).map((material, index) => (
                      <Badge key={index} variant="secondary">
                        {material.name}
                      </Badge>
                    ))}
                    {template.materials.length > 2 && (
                      <Badge variant="outline">
                        +{template.materials.length - 2} more
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(template.updated_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/templates/${template.id}/edit`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Edit Template
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/templates/${template.id}/preview`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview Template
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            className="text-red-600"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Template</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this template? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(template.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}