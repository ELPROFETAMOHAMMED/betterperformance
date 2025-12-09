import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Star } from "lucide-react";

export default function HistoryTweaksLoading() {
  return (
    <ScrollArea className="h-full w-full">
      <div className="w-full px-4 py-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          {/* Header skeleton */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <Skeleton className="h-5 w-56 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-72" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-60 rounded-[var(--radius-md)]" />
              <Skeleton className="h-8 w-24 rounded-[var(--radius-md)]" />
            </div>
          </div>

          {/* Favorites strip skeleton */}
          <div className="rounded-[var(--radius-md)] border border-border/40 bg-card/80 p-4">
            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-muted-foreground/40" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-64" />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-7 w-40 rounded-[var(--radius-md)]"
                />
              ))}
            </div>
          </div>

          {/* Table skeleton */}
          <div className="rounded-[var(--radius-md)] border border-border/40 bg-card/80 p-4">
            <div className="mb-3 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Skeleton className="h-8 flex-1 rounded-[var(--radius-md)]" />
                <Skeleton className="h-8 w-44 rounded-[var(--radius-md)]" />
              </div>
            </div>
            <div className="space-y-2">
              {/* Header row */}
              <div className="grid grid-cols-[2fr,1.2fr,2fr,1fr] items-center gap-3 border-b border-border/40 pb-2 text-[11px] text-muted-foreground">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-10 justify-self-end" />
              </div>
              {/* Skeleton rows */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[2fr,1.2fr,2fr,1fr] items-center gap-3 border-b border-border/20 py-2"
                >
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-52" />
                  <div className="flex items-center justify-end gap-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Skeleton key={j} className="h-7 w-7 rounded-full" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}





