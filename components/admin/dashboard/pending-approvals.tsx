import { Clock } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const approvals = [
  {
    id: "MFR-001",
    type: "Manufacturer",
    name: "TechFabrics Ltd",
    status: "pending",
    submitted: "2024-03-15T10:30:00",
  },
  {
    id: "DOC-023",
    type: "Document",
    name: "ISO 9001 Certificate",
    status: "pending",
    submitted: "2024-03-15T09:45:00",
  },
  {
    id: "DPC-089",
    type: "DPC",
    name: "Organic Cotton T-Shirt",
    status: "pending",
    submitted: "2024-03-15T09:15:00",
  },
];

export function PendingApprovals() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pending Approvals
        </CardTitle>
        <CardDescription>Recent approval requests requiring attention</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {approvals.map((approval) => (
            <div
              key={approval.id}
              className="flex items-center justify-between space-x-4"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {approval.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {approval.type} · {approval.id}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/${approval.type.toLowerCase()}s/${approval.id}`}>
                  Review
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}