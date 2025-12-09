import { cn } from "@/shared/lib/utils";

interface IconSkeletonProps {
  className?: string;
}

export default function IconSkeleton({ className }: IconSkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-sm bg-muted/50",
        className
      )}
      aria-label="Loading icon"
    />
  );
}




