"use client";

import { FileText, Plus, MoreHorizontal, History } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const templates = [
  {
    id: "TPL-001",
    name: "Textile Product Certificate",
    category: "Certification",
    version: "2.1",
    lastUpdated: "2024-03-15T10:30:00",
    status: "active",
    fields: 12,
    usageCount: 156,
  },
  {
    id: "TPL-002",
    name: "Material Quality Test Report",
    category: "Quality",
    version: "1.3",
    lastUpdated: "2024-03-14T15:45:00",
    status: "active",
    fields: 18,
    usageCount: 89,
  },
  {
    id: "TPL-003",
    name: "Care Instructions Label",
    category: "Care",
    version: "1.0",
    lastUpdated: "2024-03-13T09:15:00",
    status: "draft",
    fields: 8,
    usageCount: 0,
  },
];

export function SystemTemplates() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h2 className="text-lg font-semibold">Document Templates</h2>
          <p className="text-sm text-muted-foreground">
            Manage and customize document templates for various purposes
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/system/templates/new">
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Fields</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {template.id} · Updated {new Date(template.lastUpdated).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{template.category}</TableCell>
                  <TableCell>v{template.version}</TableCell>
                  <TableCell>{template.fields} fields</TableCell>
                  <TableCell>{template.usageCount} uses</TableCell>
                  <TableCell>
                    <Badge
                      variant={template.status === "active" ? "success" : "secondary"}
                    >
                      {template.status}
                    </Badge>
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
                          <Link href={`/admin/system/templates/${template.id}`}>
                            Edit Template
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/system/templates/${template.id}/preview`}>
                            Preview
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <History className="h-4 w-4 mr-2" />
                          View History
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}