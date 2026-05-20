import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  fullPage?: boolean;
}

export default function LoadingSpinner({ className, size = "md", fullPage }: LoadingSpinnerProps) {
  const sizeMap = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };
  const spinner = (
    <Loader2 className={cn("animate-spin text-primary", sizeMap[size], className)} />
  );

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        {spinner}
      </div>
    );
  }

  return spinner;
}

export function MovieCardSkeleton() {
  return (
    <div className="space-y-2">
      <div className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
      <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
      <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
    </div>
  );
}
