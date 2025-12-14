"use client";
import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TweakHistoryEntry } from "@/features/tweaks/types/tweak.types";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableHeader,
} from "@/shared/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  ArrowDownToLine,
  Pencil,
  Trash2,
  Wand2,
  Star,
  Loader2,
  Filter,
  X,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

interface HistoryTweaksTableProps {
  history: TweakHistoryEntry[];
  onDownload: (entry: TweakHistoryEntry) => void;
  onRename: (entry: TweakHistoryEntry) => void;
  onDelete: (entry: TweakHistoryEntry) => void;
  onModify: (entry: TweakHistoryEntry) => void;
  onFavorite: (entry: TweakHistoryEntry) => void;
  downloadingIds?: Set<string>;
  favoritingIds?: Set<string>;
}

const MotionTableRow = motion(TableRow);

export default function HistoryTweaksTable({
  history,
  onDownload,
  onRename,
  onDelete,
  onModify,
  onFavorite,
  downloadingIds = new Set(),
  favoritingIds = new Set(),
}: HistoryTweaksTableProps) {
  const [filter, setFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filteredHistory = useMemo(() => {
    const filtered = history.filter((entry: TweakHistoryEntry) => {
      const matchesName = entry.name
        ?.toLowerCase()
        .includes(filter.toLowerCase());
      const matchesDate = dateFilter
        ? format(new Date(entry.createdAt), "yyyy-MM-dd") === dateFilter
        : true;
      const matchesFavorite = showFavoritesOnly ? entry.isFavorite : true;
      return matchesName && matchesDate && matchesFavorite;
    });

    // Sort: favorites first, then by date (newest first)
    filtered.sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) {
        return a.isFavorite ? -1 : 1;
      }
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

    return filtered;
  }, [history, filter, dateFilter, showFavoritesOnly]);

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const currentItems = filteredHistory.slice(
    startIndex,
    startIndex + pageSize
  );

  // Reset to first page when filters or history change
  useEffect(() => {
    setPage(1);
  }, [filter, dateFilter, showFavoritesOnly, history.length]);

  return (
    <div className="space-y-4">
      {/* Filters - Minimalist design */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            {filteredHistory.length} result
            {filteredHistory.length === 1 ? "" : "s"}
            {history.length !== filteredHistory.length && (
              <span> · {history.length} total</span>
            )}
          </span>
          <span>
            Page {currentPage} of {totalPages}
          </span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex flex-1 gap-2">
            <Input
              type="text"
              placeholder="Search by name..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-8 flex-1 px-2 text-xs bg-transparent"
            />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-8 w-full px-2 text-xs bg-transparent sm:w-44"
            />
          </div>
          <Button
            variant={showFavoritesOnly ? "default" : "ghost"}
            size="sm"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className="h-8 gap-2 px-3 text-xs"
          >
            <Filter className="h-3.5 w-3.5" />
            {showFavoritesOnly ? "Show all" : "Favorites only"}
          </Button>
          {(filter || dateFilter || showFavoritesOnly) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilter("");
                setDateFilter("");
                setShowFavoritesOnly(false);
              }}
              className="h-8 gap-2 px-3 text-xs"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
      </motion.div>
      <TooltipProvider delayDuration={200}>
        <div className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/20 hover:bg-transparent">
                <TableHead className="h-10">Name</TableHead>
                <TableHead className="h-10">Date</TableHead>
                <TableHead className="h-10">Tweaks</TableHead>
                <TableHead className="h-10 w-[1%] whitespace-nowrap text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {currentItems.map((entry: TweakHistoryEntry, index) => (
                  <MotionTableRow
                    key={entry.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{
                      duration: 0.2,
                      delay: index * 0.02,
                    }}
                    className="border-b border-border/10 hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-medium py-3">
                      <div className="flex items-center gap-2">
                        {entry.isFavorite && (
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                        )}
                        <span>{entry.name || "Unnamed"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground py-3">
                      {format(new Date(entry.createdAt), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="max-w-xs text-xs text-muted-foreground py-3">
                      {Array.isArray(entry.tweaks)
                        ? `${entry.tweaks.length} tweak${
                            entry.tweaks.length === 1 ? "" : "s"
                          } · ` +
                          entry.tweaks
                            .map((t: { title: string }) => t.title)
                            .slice(0, 3)
                            .join(", ") +
                          (entry.tweaks.length > 3 ? "…" : "")
                        : ""}
                    </TableCell>
                    <TableCell className="flex items-center justify-end gap-1 py-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => onDownload(entry)}
                        disabled={downloadingIds.has(entry.id)}
                      >
                        {downloadingIds.has(entry.id) ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ArrowDownToLine className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">
                        {downloadingIds.has(entry.id)
                          ? "Downloading..."
                          : "Download this tweak set"}
                      </p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => onModify(entry)}
                      >
                        <Wand2 className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">Open on Tweaks page to edit</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => onRename(entry)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">Rename this selection</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => onDelete(entry)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">Delete from history</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant={entry.isFavorite ? "default" : "ghost"}
                        className="h-7 w-7"
                        onClick={() => onFavorite(entry)}
                        disabled={favoritingIds.has(entry.id)}
                      >
                        {favoritingIds.has(entry.id) ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Star
                            className={
                              entry.isFavorite
                                ? "h-3.5 w-3.5 text-yellow-500 fill-yellow-500"
                                : "h-3.5 w-3.5"
                            }
                            aria-hidden="true"
                          />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">
                        {favoritingIds.has(entry.id)
                          ? "Updating..."
                          : entry.isFavorite
                          ? "Remove from favorites"
                          : "Mark as favorite"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                    </TableCell>
                  </MotionTableRow>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </TooltipProvider>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-between pt-2 text-[11px] text-muted-foreground"
      >
        <span>
          Showing{" "}
          {filteredHistory.length === 0
            ? 0
            : `${startIndex + 1}-${Math.min(
                startIndex + pageSize,
                filteredHistory.length
              )}`}{" "}
          of {filteredHistory.length}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[11px]"
            disabled={currentPage === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[11px]"
            disabled={currentPage === totalPages || filteredHistory.length === 0}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </motion.div>
    </div>
  );
}



