import {
  Box,
  FileCheck,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const metrics = [
  {
    title: "Total Products",
    value: "24",
    change: "+2",
    icon: Box,
  },
  {
    title: "Pending Applications",
    value: "3",
    change: "-1",
    icon: Clock,
  },
  {
    title: "Active DPCs",
    value: "18",
    change: "+2",
    icon: ShieldCheck,
  },
  {
    title: "Document Verifications",
    value: "12",
    change: "+3",
    icon: FileCheck,
  },
  {
    title: "System Alerts",
    value: "2",
    change: "-1",
    icon: AlertTriangle,
  },
  {
    title: "Successful Verifications",
    value: "96.5%",
    change: "+0.5%",
    icon: CheckCircle2,
  },
];

export function DashboardMetrics() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className={`text-xs ${
              metric.change.startsWith("+") ? "text-green-500" : "text-red-500"
            }`}>
              {metric.change} from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}