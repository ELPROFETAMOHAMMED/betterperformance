"use client";

import { useState } from "react";
import { useDownloadTweaks } from "@/features/tweaks/hooks/use-download-tweaks";
import { useEditorSettings } from "@/features/settings/hooks/use-editor-settings";
import type { TweakHistoryEntry } from "@/features/tweaks/types/tweak.types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/components/ui/carousel";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ArrowDownToLine, Star, Calendar, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { incrementTweakDownloads } from "@/features/history-tweaks/utils/tweak-history-client";

interface FavoritesCarouselClientProps {
  initialFavorites: TweakHistoryEntry[];
}

export function FavoritesCarouselClient({ initialFavorites }: FavoritesCarouselClientProps) {
  // Use initial data from server, no client-side fetching
  const [favorites] = useState<TweakHistoryEntry[]>(initialFavorites);

  const { settings } = useEditorSettings();
  const { encodingUtf8, hideSensitive, downloadEachTweak, autoCreateRestorePoint } = settings;
  const { handleDownload: handleDownloadWithWarning, WarningDialog } = useDownloadTweaks();

  const handleDownload = async (entry: TweakHistoryEntry) => {
    if (!entry.tweaks || entry.tweaks.length === 0) {
      toast.error("No tweaks to download", {
        description: "This entry has no tweaks associated with it.",
      });
      return;
    }

    try {
      await incrementTweakDownloads(entry.tweaks.map((t) => t.id));

      // Use the hook's handleDownload which will show warning dialog if needed
      // The callbacks ensure toast is only shown when download actually starts
      handleDownloadWithWarning(
        entry.tweaks,
        {
          encodingUtf8,
          hideSensitive,
          downloadEachTweak,
          autoCreateRestorePoint,
        },
        {
          onDownloadStart: () => {
            // Only show toast when download actually starts
            toast.success("Download started", {
              description: `Re-downloading "${entry.name ?? "Favorite tweak"}"`,
            });
          },
        }
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to download tweaks", {
        description: error instanceof Error ? error.message : "Please try again later.",
      });
    }
  };

  // If no favorites, don't render
  if (favorites.length === 0) {
    return null;
  }

  return (
    <>
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
              Your Favorite Tweaks
            </h2>
            <p className="text-sm text-muted-foreground">
              Quick access to your saved tweak selections
            </p>
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
            {favorites.map((entry) => {
              const tweakTitles = entry.tweaks?.map((t) => t.title) || [];
              const displayedTweaks = tweakTitles.slice(0, 2);
              const remainingCount = tweakTitles.length - displayedTweaks.length;
              const createdDate = entry.createdAt ? format(new Date(entry.createdAt), "MMM dd, yyyy") : null;

              return (
                <CarouselItem key={entry.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card className="h-full group relative overflow-hidden border-border/60 bg-gradient-to-br from-card to-card/50 hover:from-card/90 hover:to-card/70 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <CardHeader className="pb-3 relative z-10">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base font-semibold flex items-center gap-2 mb-1.5">
                            <div className="flex-shrink-0">
                              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 drop-shadow-sm" />
                            </div>
                            <span className="truncate">{entry.name || "Unnamed Selection"}</span>
                          </CardTitle>
                          {createdDate && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                              <Calendar className="h-3 w-3" />
                              <span>{createdDate}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                            {entry.tweaks?.length || 0} tweak{entry.tweaks?.length !== 1 ? "s" : ""}
                          </span>
                        </div>

                        {tweakTitles.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                              Included Tweaks:
                            </p>
                            <div className="space-y-1">
                              {displayedTweaks.map((title, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 text-xs text-foreground/80">
                                  <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                  <span className="truncate">{title}</span>
                                </div>
                              ))}
                              {remainingCount > 0 && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground pl-4">
                                  <span>+{remainingCount} more</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0 relative z-10">
                      <Button
                        size="sm"
                        onClick={() => handleDownload(entry)}
                        className="w-full font-medium shadow-sm hover:shadow-md transition-all duration-200 bg-primary hover:bg-primary/90"
                      >
                        <ArrowDownToLine className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="left-0 bg-background/80 backdrop-blur-sm border-border/60 hover:bg-background" />
          <CarouselNext className="right-0 bg-background/80 backdrop-blur-sm border-border/60 hover:bg-background" />
        </Carousel>
      </div>
      <WarningDialog />
    </>
  );
}

