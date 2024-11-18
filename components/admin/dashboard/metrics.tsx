import {
  Users,
  FileCheck,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const metrics = [
  {
    title: "Total Manufacturers",
    value: "1,284",
    change: "+12.3%",
    icon: Users,
  },
  {
    title: "Pending Approvals",
    value: "23",
    change: "-4.5%",
    icon: Clock,
  },
  {
    title: "Active DPCs",
    value: "3,891",
    change: "+23.1%",
    icon: Shield,
  },
  {
    title: "Document Verifications",
    value: "156",
    change: "+8.2%",
    icon: FileCheck,
  },
  {
    title: "System Alerts",
    value: "12",
    change: "-2.4%",
    icon: AlertTriangle,
  },
  {
    title: "Successful Verifications",
    value: "98.3%",
    change: "+1.2%",
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