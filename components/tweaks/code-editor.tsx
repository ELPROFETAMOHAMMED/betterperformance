"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import type { Tweak } from "@/types/tweak.types";

interface CodeEditorProps {
  selectedTweaks: Tweak[];
  code: string;
}

export default function CodeEditor({ selectedTweaks, code }: CodeEditorProps) {
  return (
    <ScrollArea className="flex max-h-full min-h-full h-full">
      <div className="p-4">
        <div className="bg-transparent backdrop-blur-md rounded-lg">
          <pre className="text-sm font-mono text-foreground whitespace-pre-wrap break-words">
            {code}
          </pre>
        </div>
      </div>
    </ScrollArea>
  );
}
