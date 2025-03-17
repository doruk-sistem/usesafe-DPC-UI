"use client";

import { SettingsForm } from "@/components/dashboard/settings/settings-form";
import { SettingsHeader } from "@/components/dashboard/settings/settings-header";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <SettingsHeader />
      <SettingsForm />
    </div>
  );
}