import { Skeleton } from "@/components/ui/skeleton";

export default function ManufacturerLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-[200px]" />
        <Skeleton className="h-[200px]" />
      </div>
    </div>
  );
}