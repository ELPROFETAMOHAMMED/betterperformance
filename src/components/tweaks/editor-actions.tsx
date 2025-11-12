"use client";

import { Button } from "@/components/ui/button";
import {
  Download,
  Trash2,
  Copy,
  Settings,
  X,
  Heart,
  FlagIcon,
  MoreHorizontalIcon,
  MailCheckIcon,
  Settings2,
  TextCursorInput,
} from "lucide-react";
import type { Tweak } from "@/types/tweak.types";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getIcon } from "@/utils/icon-map";
import { ButtonGroup } from "@/components/ui/button-group";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

interface EditorActionsProps {
  code: string;
  hasContent: boolean;
  selectedTweaks?: Tweak[];
  onRemoveTweak?: (tweakId: string) => void;
  onCopy: () => void;
  onDownload: () => void;
  onClearAll: () => void;
  // editor settings (controlled by parent)
  showLineNumbers?: boolean;
  setShowLineNumbers?: (v: boolean) => void;
  enableTextColors?: boolean;
  setEnableTextColors?: (v: boolean) => void;
  encodingUtf8?: boolean;
  setEncodingUtf8?: (v: boolean) => void;
  hideSensitive?: boolean;
  setHideSensitive?: (v: boolean) => void;
  downloadEachTweak?: boolean;
  setDownloadEachTweak?: (v: boolean) => void;
  alwaysShowWarning?: boolean;
  setAlwaysShowWarning?: (v: boolean) => void;
}

export default function EditorActions({
  code,
  hasContent,
  selectedTweaks = [],
  onRemoveTweak,
  onCopy,
  onDownload,
  onClearAll,
  showLineNumbers = true,
  setShowLineNumbers,
  enableTextColors = true,
  setEnableTextColors,
  encodingUtf8 = true,
  setEncodingUtf8,
  hideSensitive = false,
  setHideSensitive,
  downloadEachTweak = false,
  setDownloadEachTweak,
  alwaysShowWarning = false,
  setAlwaysShowWarning,
}: EditorActionsProps) {
  const isEmpty = !code || code.startsWith("# Your PowerShell");
  // small local helpers to toggle when setter provided
  const toggle = (setter?: (v: boolean) => void, v?: boolean) =>
    setter?.(Boolean(v));
  return (
    // Header bar for the combined tweaks panel. Left side interactive, right side actions
    <div className="relative w-full flex items-center justify-between gap-2 bg-transparent backdrop-blur-md px-3 py-2 z-20 rounded-t-lg border-b border-secondary/10">
      {/* Left: interactive summary / selected tweaks */}
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={"ghost"}
              className="focus-visible:ring-0 focus:ring-0 ring-0"
            >
              <div className="text-sm font-medium">
                {selectedTweaks.length > 0
                  ? `BetterPerformance (${selectedTweaks.length})`
                  : "BetterPerformance"}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="absolute left-3 top-full mt-2 max-w-xs w-[320px] bg-background/5 backdrop-blur-xl border border-secondary/10 rounded-md p-2 shadow-lg z-50">
            {selectedTweaks.length > 0 && (
              <ScrollArea>
                {selectedTweaks.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No tweaks selected
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 max-h-40 ">
                    {selectedTweaks.map((t) => {
                      const CategoryIcon = getIcon(t.icon);
                      return (
                        <Button
                          key={t.id}
                          arial-label={`Remove ${t.title}`}
                          onClick={() => onRemoveTweak?.(t.id)}
                          variant={"outline"}
                          className="flex items-center justify-between gap-2 px-2 py-1 rounded hover:bg-background/5"
                        >
                          <div className="text-sm truncate flex gap-x-2">
                            <CategoryIcon className="h-4 w-4 text-foreground inline-block mr-2 flex-shrink-0" />
                            <p>{t.title}</p>
                          </div>
                          <X className="h-4 w-4" />
                        </Button>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-x-2">
        <ButtonGroup>
          <Button
            variant="outline"
            size="sm"
            onClick={onCopy}
            disabled={isEmpty}
            className="h-8 bg-transparent backdrop-blur-sm border-secondary/50 hover:bg-background/20"
          >
            <Copy className="h-3.5 w-3.5 mr-1.5" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
            disabled={isEmpty}
            className="h-8 bg-transparent backdrop-blur-sm border-secondary/50 hover:bg-background/20"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            disabled={!hasContent}
            className="h-8 bg-transparent backdrop-blur-sm border-secondary/50 hover:bg-background/20"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Clear All
          </Button>
        </ButtonGroup>

        <ButtonGroup>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {}}
            disabled={!hasContent}
            className="h-8 bg-transparent backdrop-blur-sm border-secondary/50 hover:bg-background/20"
          >
            <Heart className="h-3.5 w-3.5 mr-1.5" />
            Favorites
          </Button>
          {/* Settings Tweaks */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                aria-label="More Options"
                className="h-8 bg-transparent backdrop-blur-sm border-secondary/50 hover:bg-background/20"
              >
                <MoreHorizontalIcon className="h-3.5 w-3.5 mr-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuCheckboxItem
                  checked={alwaysShowWarning}
                  onCheckedChange={(v) => toggle(setAlwaysShowWarning, v)}
                >
                  Always show warning message
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={downloadEachTweak}
                  onCheckedChange={(v) => toggle(setDownloadEachTweak, v)}
                >
                  Download each tweak separately
                </DropdownMenuCheckboxItem>
                {/* EDITOR SETTINGS */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <TextCursorInput className="h-3.5 w-3.5 mr-1.5" />
                    Editor Settings
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-transparent backdrop-blur-xl">
                    <DropdownMenuCheckboxItem
                      checked={showLineNumbers}
                      onCheckedChange={(v) => toggle(setShowLineNumbers, v)}
                    >
                      Show Line Numbers
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={enableTextColors}
                      onCheckedChange={(v) => toggle(setEnableTextColors, v)}
                    >
                      Enable Text Colors
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={!enableTextColors}
                      onCheckedChange={(v) => toggle(setEnableTextColors, !v)}
                    >
                      Remove text colors
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={encodingUtf8}
                      onCheckedChange={(v) => toggle(setEncodingUtf8, v)}
                    >
                      Change encoding from UTF-16 to UTF-8
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={hideSensitive}
                      onCheckedChange={(v) => toggle(setHideSensitive, v)}
                    >
                      Hide sensitive information
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <FlagIcon />
                Report Tweak
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>
      </div>
    </div>
  );
}
