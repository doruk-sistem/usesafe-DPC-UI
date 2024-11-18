import { AlertTriangle, Bell } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const alerts = [
  {
    id: 1,
    type: "warning",
    message: "High volume of pending approvals detected",
    timestamp: "10 minutes ago",
  },
  {
    id: 2,
    type: "error",
    message: "Failed blockchain verification attempt",
    timestamp: "25 minutes ago",
  },
  {
    id: 3,
    type: "info",
    message: "System maintenance scheduled for tonight",
    timestamp: "1 hour ago",
  },
];

export function SystemAlerts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          System Alerts
        </CardTitle>
        <CardDescription>Recent system notifications and warnings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start space-x-4 rounded-lg border p-4"
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {alert.message}
                </p>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      alert.type === "error"
                        ? "destructive"
                        : alert.type === "warning"
                        ? "warning"
                        : "secondary"
                    }
                  >
                    {alert.type}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {alert.timestamp}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}