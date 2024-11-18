import { DashboardHeader } from "@/components/admin/dashboard/header";
import { DashboardMetrics } from "@/components/admin/dashboard/metrics";
import { PendingApprovals } from "@/components/admin/dashboard/pending-approvals";
import { SystemAlerts } from "@/components/admin/dashboard/system-alerts";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <DashboardHeader />
      <DashboardMetrics />
      <div className="grid gap-6 md:grid-cols-2">
        <PendingApprovals />
        <SystemAlerts />
      </div>
    </div>
  );
}