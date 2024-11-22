"use client";

import { SettingsHeader } from "@/components/dashboard/settings/settings-header";
import { SettingsForm } from "@/components/dashboard/settings/settings-form";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <SettingsHeader />
      <SettingsForm />
    </div>
  );
}