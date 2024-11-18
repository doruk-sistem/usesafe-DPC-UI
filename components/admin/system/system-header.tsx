import { Download, Plus, Settings } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function SystemHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">System Configuration</h1>
        <p className="text-sm text-muted-foreground">
          Manage templates, materials, and system settings
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon">
          <Download className="h-4 w-4" />
        </Button>
        <Button asChild>
          <Link href="/admin/system/settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Link>
        </Button>
      </div>
    </div>
  );
}