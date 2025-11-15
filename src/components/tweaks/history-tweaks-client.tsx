"use client";
import Link from "next/link";
import type { TweakHistoryEntry } from "@/types/tweak.types";
import HistoryTweaksTable from "@/components/tweaks/history-tweaks-table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function HistoryTweaksClient({
  history,
}: {
  history: TweakHistoryEntry[];
}) {
  const handleDownload = (entry: TweakHistoryEntry) => {};
  const handleRename = (entry: TweakHistoryEntry) => {};
  const handleDelete = (entry: TweakHistoryEntry) => {};
  const handleModify = (entry: TweakHistoryEntry) => {};
  const handleFavorite = (entry: TweakHistoryEntry) => {};

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tweak History</h1>
        <Button variant="outline">
          <ArrowLeft className="flex items-center" />
          <Link href="/home">Back to Home</Link>
        </Button>
      </div>
      <HistoryTweaksTable
        history={history}
        onDownload={handleDownload}
        onRename={handleRename}
        onDelete={handleDelete}
        onModify={handleModify}
        onFavorite={handleFavorite}
      />
    </div>
  );
}
