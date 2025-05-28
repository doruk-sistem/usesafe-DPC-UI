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
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2">
          <PendingApplications />
        </div>
        <div className="w-full md:w-1/2">
          <RecentActivities />
        </div>
      </div>
    </div>
  );
}
