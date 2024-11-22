import { Activity } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const activities = [
  {
    id: 1,
    type: "success",
    message: "DPC approved for AGM LEO Battery",
    timestamp: "10 minutes ago",
  },
  {
    id: 2,
    type: "warning",
    message: "ISO Certificate expiring in 30 days",
    timestamp: "25 minutes ago",
  },
  {
    id: 3,
    type: "info",
    message: "New product added: MAXIM A GORILLA",
    timestamp: "1 hour ago",
  },
];

export function RecentActivities() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activities
        </CardTitle>
        <CardDescription>Latest updates and notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-4 rounded-lg border p-4"
            >
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {activity.message}
                </p>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      activity.type === "success"
                        ? "success"
                        : activity.type === "warning"
                        ? "warning"
                        : "secondary"
                    }
                  >
                    {activity.type}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {activity.timestamp}
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