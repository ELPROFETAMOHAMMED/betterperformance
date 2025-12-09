import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/components/ui/carousel";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";

export function FavoritesCarouselSkeleton() {
  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {[1, 2, 3].map((i) => (
            <CarouselItem key={i} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
              <Card className="h-full border-border/60">
                <CardHeader className="pb-3">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-5 flex-1" />
                    </div>
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-16 rounded-full" />
                    <div className="space-y-2 pt-2">
                      <Skeleton className="h-2.5 w-32" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Skeleton className="h-9 w-full rounded-md" />
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0 bg-background/80 backdrop-blur-sm border-border/60" />
        <CarouselNext className="right-0 bg-background/80 backdrop-blur-sm border-border/60" />
      </Carousel>
    </div>
  );
}

