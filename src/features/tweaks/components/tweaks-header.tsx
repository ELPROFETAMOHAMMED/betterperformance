"use client";

import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardIcon,
  FlagIcon,
  PencilIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import type { Tweak, TweakCategory } from "@/features/tweaks/types/tweak.types";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/cn";

type TweaksHeaderProps = {
  activeCategory: TweakCategory | null;
  visibility: boolean
  activeIndex: number;
  activeTab: string;
  activeTweak: Tweak | null;
  globalIsLoading: boolean;
  isAdmin: boolean;
  isCopying: boolean;
  isDownloadLoading: boolean;
  selectedTweaksCount: number;
  onCopy: () => void;
  onCreateTweak: () => void;
  onDownload: () => void;
  onEditTweak: (tweak: Tweak) => void;
  onNextTweak: () => void;
  onOpenReportDialog: () => void;
  onPrevTweak: () => void;
  onRefresh: () => void;
};

export function TweaksHeader({
  activeCategory,
  activeIndex,
  activeTab,
  activeTweak,
  globalIsLoading,
  isAdmin,
  visibility,
  isCopying,
  isDownloadLoading,
  selectedTweaksCount,
  onCopy,
  onCreateTweak,
  onDownload,
  onEditTweak,
  onNextTweak,
  onOpenReportDialog,
  onPrevTweak,
  onRefresh,
}: TweaksHeaderProps) {
  return (
    <div className={cn("w-full shrink-0 border-b border-border/20 bg-background/50 px-2  py-4 ", visibility ? "block" : "hidden")}>
      <div className={cn("items-center justify-between")}>
        <div className="flex items-center border-r border-border/20 px-4 lg:w-1/3">
          <span className="text-sm font-bold uppercase tracking-tight opacity-50">
            Explorer
          </span>
        </div>

        <div className="flex flex-1 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {activeTweak ? (
              <>
                <Badge variant="outline" className="bg-background/50 font-normal shadow-sm">
                  {activeIndex + 1} / {selectedTweaksCount}
                </Badge>
                <div className="mx-1 h-4 w-px bg-border/60" />
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {activeCategory?.name || "Uncategorized"}
                </span>
              </>
            ) : (
              <span className="pl-2 text-xs italic text-muted-foreground">
                No tweaks selected
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-normal">
              <TooltipProvider>
                {activeTweak && (
                  <div className="mr-2 flex items-center gap-1 border-r border-border/40 pr-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={onCopy}
                          disabled={isCopying}
                        >
                          <ClipboardIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy code</TooltipContent>
                    </Tooltip>

                    {isAdmin && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => onEditTweak(activeTweak)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit Tweak</TooltipContent>
                      </Tooltip>
                    )}

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={onOpenReportDialog}
                        >
                          <FlagIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Report issue</TooltipContent>
                    </Tooltip>
                  </div>
                )}

                {activeTab === "library" && isAdmin && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5"
                        onClick={onCreateTweak}
                      >
                        <PlusIcon className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Add Tweak</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Create new Tweak</TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5"
                      onClick={onRefresh}
                      disabled={globalIsLoading}
                    >
                      <ArrowPathIcon
                        className={cn(
                          "h-3.5 w-3.5",
                          globalIsLoading && "animate-spin"
                        )}
                      />
                      <span>Refresh</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh data</TooltipContent>
                </Tooltip>

                {activeTweak && (
                  <Button
                    size="sm"
                    className="ml-1 h-9 gap-2 rounded-[var(--radius-md)] px-4"
                    onClick={onDownload}
                    disabled={isDownloadLoading}
                  >
                    {isDownloadLoading ? (
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <>
                        <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </>
                    )}
                  </Button>
                )}
              </TooltipProvider>
            </div>

            <div className="flex items-center gap-1 border-l border-border/40 pl-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={onPrevTweak}
                disabled={!activeTweak || activeIndex <= 0}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={onNextTweak}
                disabled={!activeTweak || activeIndex >= selectedTweaksCount - 1}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
