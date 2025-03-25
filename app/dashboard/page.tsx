"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardMetrics } from "@/components/dashboard/metrics";
import { PendingApplications } from "@/components/dashboard/pending-applications";
import { RecentActivities } from "@/components/dashboard/recent-activities";


export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader />
      
  

      <DashboardMetrics />
      <div className="grid gap-6 md:grid-cols-2">
        <PendingApplications />
        <RecentActivities />
      </div>
    </div>
  );
}
