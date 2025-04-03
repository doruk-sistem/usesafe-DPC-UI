"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ManualInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
  buttonText?: string;
}

export function ManualInput({ 
  value, 
  onChange, 
  onSubmit,
  placeholder = "Enter Product ID (e.g., PROD-2024-001)",
  buttonText = "Verify"
}: ManualInputProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <Button type="submit">{buttonText}</Button>
      </div>
    </form>
  );
}