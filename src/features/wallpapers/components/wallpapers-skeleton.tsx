import { Card } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function WallpapersSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="border-border/40 bg-card/80 p-6 shadow-sm backdrop-blur-sm">
        <div className="space-y-3">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-full max-w-3xl" />
          <Skeleton className="h-4 w-2/3 max-w-2xl" />
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <Card key={index} className="overflow-hidden border-border/30 bg-card/80 p-0 shadow-sm backdrop-blur-sm">
            <Skeleton className="aspect-[16/10] w-full" />
            <div className="space-y-3 p-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
