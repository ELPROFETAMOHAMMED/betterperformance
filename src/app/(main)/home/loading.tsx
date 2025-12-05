import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <ScrollArea className="h-full w-full">
      <main className="flex min-h-[calc(100vh-5rem)] w-full items-center justify-center px-4">
        <div className="grid w-full max-w-6xl items-center gap-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {/* Left: hero content skeleton */}
          <section className="space-y-6">
            <div className="inline-flex items-center gap-2">
              <Skeleton className="h-5 w-56 rounded-full" />
            </div>

            <div className="space-y-3">
              <Skeleton className="h-8 w-72" />
              <Skeleton className="h-8 w-60" />
              <Skeleton className="h-4 w-80" />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-10 w-40 rounded-[var(--radius-md)]" />
              <Skeleton className="h-9 w-32 rounded-[var(--radius-md)]" />
            </div>

            <div className="grid gap-3 rounded-lg border border-dashed border-border/40 bg-card/60 p-4 text-xs md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>
          </section>

          {/* Right: logo / visual skeleton */}
          <section className="flex flex-col items-center justify-center gap-6">
            <div className="relative flex h-48 w-48 items-center justify-center md:h-56 md:w-56">
              <Skeleton className="absolute h-full w-full rounded-[var(--radius-lg)]" />
              <Skeleton className="relative h-32 w-32 rounded-[var(--radius-lg)] md:h-40 md:w-40" />
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <Skeleton className="h-3 w-56" />
              <Skeleton className="h-3 w-40" />
            </div>
          </section>
        </div>
      </main>
    </ScrollArea>
  );
}


