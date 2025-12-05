"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <ScrollArea className="h-full w-full">
      <main className="flex min-h-[calc(100vh-4rem)] w-full items-start justify-center px-4 py-8">
        <div className="grid w-full max-w-4xl gap-6 md:grid-cols-[1.4fr_minmax(0,1fr)]">
          <section className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-4 w-80" />
            </div>

            <div className="space-y-3 rounded-[var(--radius-md)] border border-border/60 bg-card/80 p-5">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="h-8 w-32 rounded-[var(--radius-md)]" />
            </div>

            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="space-y-3 rounded-[var(--radius-md)] border border-border/60 bg-card/80 p-5"
              >
                <Skeleton className="h-4 w-40" />
                {Array.from({ length: 3 }).map((_, j) => (
                  <div
                    key={j}
                    className="flex items-center justify-between gap-4 pt-2"
                  >
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-40" />
                      <Skeleton className="h-3 w-56" />
                    </div>
                    <Skeleton className="h-5 w-10 rounded-full" />
                  </div>
                ))}
              </div>
            ))}
          </section>

          <aside className="space-y-4">
            <div className="space-y-3 rounded-[var(--radius-md)] border border-border/60 bg-card/80 p-5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-64" />
              <Skeleton className="h-3 w-56" />
            </div>
          </aside>
        </div>
      </main>
    </ScrollArea>
  );
}


