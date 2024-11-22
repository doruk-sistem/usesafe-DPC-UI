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

const applications = [
  {
    id: "DPC-023",
    type: "DPC",
    name: "AGM LEO Battery",
    status: "pending",
    submitted: "2024-03-15T09:45:00",
  },
  {
    id: "DOC-089",
    type: "Document",
    name: "ISO 9001 Certificate",
    status: "pending",
    submitted: "2024-03-15T09:15:00",
  },
  {
    id: "DPC-024",
    type: "DPC",
    name: "EFB MAX TIGRIS Battery",
    status: "pending",
    submitted: "2024-03-15T08:30:00",
  },
];

export function PendingApplications() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pending Applications
        </CardTitle>
        <CardDescription>Recent applications requiring attention</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {applications.map((application) => (
            <div
              key={application.id}
              className="flex items-center justify-between space-x-4"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {application.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {application.type} · {application.id}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/${application.type.toLowerCase()}s/${application.id}`}>
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