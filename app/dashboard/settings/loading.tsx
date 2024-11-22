import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-[400px]" />
        <Skeleton className="h-[600px]" />
      </div>
    </div>
  );
}