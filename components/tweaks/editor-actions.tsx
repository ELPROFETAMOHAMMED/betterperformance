"use client";

import { Button } from "@/components/ui/button";
import { Download, Trash2, Copy, Settings } from "lucide-react";

interface EditorActionsProps {
  code: string;
  hasContent: boolean;
  onCopy: () => void;
  onDownload: () => void;
  onClearAll: () => void;
}

export default function EditorActions({
  code,
  hasContent,
  onCopy,
  onDownload,
  onClearAll,
}: EditorActionsProps) {
  const isEmpty = !code || code.startsWith("# Your PowerShell");

  return (
    <div className="absolute top-4 right-4 flex items-center gap-2 bg-transparent backdrop-blur-md rounded-lg shadow-lg p-2 z-20">
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
      <div className="h-6 w-px bg-secondary/30 mx-1" />
      <Button
        variant="outline"
        size="sm"
        className="h-8 bg-transparent backdrop-blur-sm border-secondary/50 hover:bg-background/20"
        disabled
      >
        <Settings className="h-3.5 w-3.5 mr-1.5" />
        Settings
      </Button>
    </div>
  );
}

