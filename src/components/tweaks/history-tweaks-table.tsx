"use client";
import React, { useState } from "react";
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

  const filteredHistory = history.filter((entry: TweakHistoryEntry) => {
    const matchesName = entry.name
      ?.toLowerCase()
      .includes(filter.toLowerCase());
    const matchesDate = dateFilter
      ? format(new Date(entry.createdAt), "yyyy-MM-dd") === dateFilter
      : true;
    return matchesName && matchesDate;
  });

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <Input
          type="text"
          placeholder="Filter by name"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="border flex-1 rounded px-2 py-1"
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Tweaks</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredHistory.map((entry: TweakHistoryEntry) => (
            <TableRow key={entry.id}>
              <TableCell>{entry.name}</TableCell>
              <TableCell>
                {format(new Date(entry.createdAt), "dd/MM/yyyy HH:mm")}
              </TableCell>
              <TableCell>
                {Array.isArray(entry.tweaks)
                  ? entry.tweaks
                      .map((t: { title: string }) => t.title)
                      .join(", ")
                  : ""}
              </TableCell>
              <TableCell className="flex gap-2">
                <Button size="sm" onClick={() => onDownload(entry)}>
                  Download
                </Button>
                <Button size="sm" onClick={() => onRename(entry)}>
                  Rename
                </Button>
                <Button size="sm" onClick={() => onDelete(entry)}>
                  Delete
                </Button>
                <Button size="sm" onClick={() => onModify(entry)}>
                  Modify
                </Button>
                <Button size="sm" onClick={() => onFavorite(entry)}>
                  Favorite
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
