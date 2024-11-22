"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ManualInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ManualInput({ value, onChange, onSubmit }: ManualInputProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Enter Product ID (e.g., PROD-2024-001)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <Button type="submit">Verify</Button>
      </div>
    </form>
  );
}