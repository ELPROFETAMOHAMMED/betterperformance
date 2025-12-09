import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function TweaksLoading() {
  return (
    <ScrollArea className="h-full w-full">
      <div className="w-full px-4 py-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:min-h-[calc(100vh-8rem)] lg:flex-row">
          {/* Left: tree with filters skeleton */}
          <div className="flex w-full flex-col gap-4 lg:w-[600px]">
            <div className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-border/40 bg-background/60 p-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 flex-1 rounded-[var(--radius-md)]" />
                <Skeleton className="h-9 w-10 rounded-[var(--radius-md)]" />
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-2 rounded-[var(--radius-md)] border border-border/40 bg-background/60 p-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-sm" />
                  <Skeleton className="h-4 w-44" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: details + controls skeleton */}
          <div className="flex h-full w-full flex-1 flex-col rounded-[var(--radius-md)] border border-border/40 bg-card/80 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-52" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-32 rounded-[var(--radius-md)]" />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex h-full flex-col gap-3 rounded-[var(--radius-md)] border border-border/40 bg-background/70 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />

                <div className="mt-2 grid grid-cols-2 gap-3 text-[11px]">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="mt-auto h-16 w-full rounded-[var(--radius-md)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}





