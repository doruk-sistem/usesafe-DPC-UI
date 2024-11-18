import { Download, Plus, Filter } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DocumentHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Document Management</h1>
        <p className="text-sm text-muted-foreground">
          Review and manage document submissions
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Select defaultValue="all">
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Documents</SelectItem>
            <SelectItem value="certification">Certifications</SelectItem>
            <SelectItem value="compliance">Compliance</SelectItem>
            <SelectItem value="legal">Legal</SelectItem>
            <SelectItem value="quality">Quality</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all-status">
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-status">All Status</SelectItem>
            <SelectItem value="pending">Pending Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Download className="h-4 w-4" />
        </Button>
        <Button asChild>
          <Link href="/admin/documents/upload">
            <Plus className="h-4 w-4 mr-2" />
            Upload
          </Link>
        </Button>
      </div>
    </div>
  );
}