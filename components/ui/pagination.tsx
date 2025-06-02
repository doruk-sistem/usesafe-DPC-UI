import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <nav role="navigation" aria-label="pagination" className={cn("flex w-full justify-center", className)} {...props} />;
}

export function PaginationContent({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn("flex items-center gap-1", className)} {...props} />;
}

export function PaginationItem({ className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) {
  return <li className={cn("", className)} {...props} />;
}

export function PaginationLink({ className, isActive, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { isActive?: boolean }) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
        isActive
          ? "bg-primary/10 text-primary border-primary font-semibold"
          : "bg-white text-muted-foreground border-muted hover:bg-muted/70",
        className
      )}
      {...props}
    />
  );
}

export function PaginationPrevious({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label="Previous Page"
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition-colors",
        className
      )}
      {...props}
    >
      <ChevronLeft className="w-4 h-4" />
    </button>
  );
}

export function PaginationNext({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label="Next Page"
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition-colors",
        className
      )}
      {...props}
    >
      <ChevronRight className="w-4 h-4" />
    </button>
  );
}

export function PaginationEllipsis({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("flex h-9 w-9 items-center justify-center text-muted-foreground text-sm", className)} {...props}>
      ...
    </span>
  );
} 