"use client";
import React, { useEffect, useState } from "react";
import type { TweakHistoryEntry } from "@/types/tweak.types";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableHeader,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import {
  ArrowDownToLine,
  Pencil,
  Trash2,
  Wand2,
  Star,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HistoryTweaksTableProps {
  history: TweakHistoryEntry[];
  onDownload: (entry: TweakHistoryEntry) => void;
  onRename: (entry: TweakHistoryEntry) => void;
  onDelete: (entry: TweakHistoryEntry) => void;
  onModify: (entry: TweakHistoryEntry) => void;
  onFavorite: (entry: TweakHistoryEntry) => void;
}

export default function HistoryTweaksTable({
  history,
  onDownload,
  onRename,
  onDelete,
  onModify,
  onFavorite,
}: HistoryTweaksTableProps) {
  const [filter, setFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filteredHistory = history.filter((entry: TweakHistoryEntry) => {
    const matchesName = entry.name
      ?.toLowerCase()
      .includes(filter.toLowerCase());
    const matchesDate = dateFilter
      ? format(new Date(entry.createdAt), "yyyy-MM-dd") === dateFilter
      : true;
    return matchesName && matchesDate;
  });

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
  }, [filter, dateFilter, history.length]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-border/40 bg-background/60 p-3">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            {filteredHistory.length} result
            {filteredHistory.length === 1 ? "" : "s"} · {history.length} saved
            set{history.length === 1 ? "" : "s"} total
          </span>
          <span>
            Page {currentPage} of {totalPages}
          </span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            type="text"
            placeholder="Search by name..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-8 flex-1 rounded-[var(--radius-md)] border-border/40 bg-background/80 px-2 text-xs"
          />
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-8 w-full rounded-[var(--radius-md)] border-border/40 bg-background/80 px-2 text-xs sm:w-44"
          />
        </div>
      </div>
      <TooltipProvider delayDuration={200}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Tweaks</TableHead>
              <TableHead className="w-[1%] whitespace-nowrap text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((entry: TweakHistoryEntry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">{entry.name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {format(new Date(entry.createdAt), "dd/MM/yyyy HH:mm")}
                </TableCell>
                <TableCell className="max-w-xs text-xs text-muted-foreground">
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
                <TableCell className="flex items-center justify-end gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => onDownload(entry)}
                      >
                        <ArrowDownToLine className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">Download this tweak set</p>
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
                      >
                        <Star
                          className={
                            entry.isFavorite
                              ? "h-3.5 w-3.5 text-yellow-500 fill-yellow-500"
                              : "h-3.5 w-3.5"
                          }
                          aria-hidden="true"
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">
                        {entry.isFavorite
                          ? "Remove from favorites"
                          : "Mark as favorite"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TooltipProvider>
      <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
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
            variant="outline"
            size="sm"
            className="h-7 px-2 text-[11px]"
            disabled={currentPage === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-[11px]"
            disabled={currentPage === totalPages || filteredHistory.length === 0}
            onClick={() =>
              setPage((p) => Math.min(totalPages, p + 1))
            }
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
